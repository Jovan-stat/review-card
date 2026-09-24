import { getSupabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  const supabase = getSupabaseAdmin();
  const { id } = req.query;

  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_DASHBOARD_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'PUT') {
    // Dipakai buat: assign link tujuan ke kode, ganti nama bisnis, atau nonaktifin kartu
    const { destination_url, business_name, is_active } = req.body;
    const updates = { ...req.body };

    // Kalau ini pertama kali di-assign, catat waktunya
    if (destination_url) updates.assigned_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('cards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ card: data });
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('cards').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}