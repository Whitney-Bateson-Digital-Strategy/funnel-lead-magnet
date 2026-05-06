import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from './prompt';
import type { ReadOutput } from './supabase';

const client = new Anthropic({
  apiKey: import.meta.env.ANTHROPIC_API_KEY,
});

type Answers = {
  leadMagnetTitle: string;
  leadMagnetTeaches: string;
  afterFeeling: string;
  paidOffer: string;
  offerType: string;
  transformation: string;
  currentlyAttracting: string;
  priceRange: string;
};

export async function generateRead(answers: Answers): Promise<ReadOutput> {
  const userPrompt = `Lead magnet title: ${answers.leadMagnetTitle}

What it teaches/gives: ${answers.leadMagnetTeaches}

What people believe or feel after: ${answers.afterFeeling}

Paid offer: ${answers.paidOffer}
Offer type: ${answers.offerType}
Price range: ${answers.priceRange}

Transformation the paid offer delivers: ${answers.transformation}

Who the lead magnet is currently attracting: ${answers.currentlyAttracting}

Apply Whitney's framework. Return only the JSON object.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as { type: 'text'; text: string }).text)
    .join('')
    .replace(/```json|```/g, '')
    .trim();

  let parsed: ReadOutput;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse AI response:', text);
    throw new Error('AI returned invalid JSON');
  }

  // Validate required fields
  const required = [
    'opener',
    'spectrumIntro',
    'spectrumThought',
    'leadMagnetPosition',
    'offerPosition',
    'thoughtOneHeader',
    'thoughtOne',
    'thoughtTwoHeader',
    'thoughtTwo',
    'thoughtThreeHeader',
    'thoughtThree',
    'actionsIntro',
    'actions',
    'closer',
  ];

  for (const key of required) {
    if (!(key in parsed)) {
      throw new Error(`AI response missing required field: ${key}`);
    }
  }

  if (!Array.isArray(parsed.actions) || parsed.actions.length !== 2) {
    throw new Error('AI response actions must be an array of 2 items');
  }

  // Coerce position values to numbers
  parsed.leadMagnetPosition = Number(parsed.leadMagnetPosition);
  parsed.offerPosition = Number(parsed.offerPosition);

  return parsed;
}
