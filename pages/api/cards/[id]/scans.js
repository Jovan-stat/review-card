import { getSupabaseAdmin } from '../../../../lib/supabase';

export default async function handler(req, res) {
  const supabase = getSupabaseAdmin();
  const { id } = req.query;

  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_DASHBOARD_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Ambil info kartu
  const { data: card, error: cardError } = await supabase
    .from('cards')
    .select('*')
    .eq('id', id)
    .single();

  if (cardError || !card) {
    return res.status(404).json({ error: 'Kartu tidak ditemukan' });
  }

  // Ambil semua log scan kartu ini, terbaru duluan
  const { data: scans, error: scanError } = await supabase
    .from('scan_logs')
    .select('scanned_at, user_agent')
    .eq('card_id', id)
    .order('scanned_at', { ascending: false });

  if (scanError) {
    return res.status(500).json({ error: scanError.message });
  }

  return res.status(200).json({ card, scans: scans || [] });
}