/**
 * Kit (ConvertKit) API wrapper.
 *
 * Subscribes a user to a specific form, which triggers any sequences
 * attached to that form. Custom fields are passed so emails can reference
 * the user's unique Read URL via {{ subscriber.read_url }}.
 */

const KIT_API_KEY = import.meta.env.KIT_API_KEY;
const KIT_FORM_ID = import.meta.env.KIT_FORM_ID;

type SubscribeOptions = {
  email: string;
  firstName: string;
  readUrl: string;
};

export async function subscribeToKit({ email, firstName, readUrl }: SubscribeOptions) {
  if (!KIT_API_KEY || !KIT_FORM_ID) {
    console.warn('Kit credentials missing — skipping subscriber sync');
    return { skipped: true };
  }

  const response = await fetch(
    `https://api.convertkit.com/v3/forms/${KIT_FORM_ID}/subscribe`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: KIT_API_KEY,
        email,
        first_name: firstName,
        fields: {
          read_url: readUrl,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Kit subscribe failed:', response.status, errorText);
    throw new Error(`Kit subscribe failed with status ${response.status}`);
  }

  return await response.json();
}
