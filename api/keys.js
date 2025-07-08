import { createClient } from '@supabase/supabase-js';

// Use the service_role key so this function can bypass RLS
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { key, expires } = req.body;
    const { error } = await supabase
      .from('keys')
      .insert([{ key, expires_at: expires }]);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ success: true });
  }

  if (req.method === 'GET') {
    const { key } = req.query;
    const { data, error } = await supabase
      .from('keys')
      .select('*')
      .eq('key', key)
      .single();
    if (error && error.code === 'PGRST116') return res.status(404).end();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
