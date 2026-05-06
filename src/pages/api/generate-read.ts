import type { APIRoute } from 'astro';
import { generateRead } from '../../lib/anthropic';
import { supabase } from '../../lib/supabase';
import { subscribeToKit } from '../../lib/kit';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, answers } = body;

    // Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return jsonError('Name is required', 400);
    }
    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return jsonError('Valid email is required', 400);
    }
    if (!answers || typeof answers !== 'object') {
      return jsonError('Answers are required', 400);
    }

    const requiredAnswerKeys = [
      'leadMagnetTitle',
      'leadMagnetTeaches',
      'afterFeeling',
      'paidOffer',
      'offerType',
      'transformation',
      'currentlyAttracting',
      'priceRange',
    ];

    for (const key of requiredAnswerKeys) {
      if (!answers[key] || typeof answers[key] !== 'string' || !answers[key].trim()) {
        return jsonError(`Missing answer: ${key}`, 400);
      }
    }

    // Generate the Read with Claude
    let output;
    try {
      output = await generateRead(answers);
    } catch (err) {
      console.error('AI generation failed:', err);
      return jsonError('Could not generate your Read right now. Please try again.', 500);
    }

    // Save to Supabase
    const { data: insertedRead, error: dbError } = await supabase
      .from('reads')
      .insert({
        email: email.toLowerCase().trim(),
        first_name: name.trim(),
        answers,
        output,
      })
      .select('id')
      .single();

    if (dbError || !insertedRead) {
      console.error('Database insert failed:', dbError);
      return jsonError('Could not save your Read. Please try again.', 500);
    }

    const siteUrl = import.meta.env.PUBLIC_SITE_URL || 'https://read.whitneybateson.com';
    const readUrl = `${siteUrl}/r/${insertedRead.id}`;

    // Subscribe to Kit (don't block on failure)
    try {
      await subscribeToKit({
        email: email.toLowerCase().trim(),
        firstName: name.trim(),
        readUrl,
      });
    } catch (err) {
      console.error('Kit subscribe failed (continuing anyway):', err);
      // Don't fail the request if Kit is down
    }

    return new Response(
      JSON.stringify({
        id: insertedRead.id,
        url: readUrl,
        output,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Unexpected error in /api/generate-read:', err);
    return jsonError('Something went wrong. Please try again.', 500);
  }
};

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
