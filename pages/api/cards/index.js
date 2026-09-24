import { getSupabaseAdmin } from '../../../lib/supabase';

// Generate kode unik pendek, misal "x7f9a2"
function generateCode(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default async function handler(req, res) {
  const supabase = getSupabaseAdmin();

  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_DASHBOARD_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const { data: cards, error } = await supabase
      .from('cards')
      .select('*, scan_logs(count)')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ cards });
  }

  if (req.method === 'POST') {
    const { count = 1 } = req.body;
    const newCards = [];
    for (let i = 0; i < count; i++) {
      newCards.push({ code: generateCode() });
    }

    const { data, error } = await supabase.from('cards').insert(newCards).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ cards: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}