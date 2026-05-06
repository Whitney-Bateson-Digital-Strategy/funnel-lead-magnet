import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Server-side client with full access. Never expose to the browser.
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export type ReadRecord = {
  id: string;
  email: string;
  first_name: string;
  answers: Record<string, string>;
  output: ReadOutput;
  created_at: string;
};

export type ReadOutput = {
  opener: string;
  spectrumIntro: string;
  spectrumThought: string;
  leadMagnetPosition: number;
  offerPosition: number;
  thoughtOneHeader: string;
  thoughtOne: string;
  thoughtTwoHeader: string;
  thoughtTwo: string;
  thoughtThreeHeader: string;
  thoughtThree: string;
  actionsIntro: string;
  actions: string[];
  closer: string;
};
