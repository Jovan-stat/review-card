// Halaman ini yang di-hit tiap kali NFC di-tap atau QR di-scan
// URL pola: vtx.id/r/abc123

import { getSupabaseAdmin } from '../../lib/supabase';

export async function getServerSideProps({ params, req, res }) {
  const { code } = params;
  const supabase = getSupabaseAdmin();

  // 1. Cari kode di database
  const { data: card, error } = await supabase
    .from('cards')
    .select('*')
    .eq('code', code)
    .single();

  // 2. Kalau kode gak ketemu / gak aktif -> tampilkan halaman error, jangan redirect
  if (error || !card || !card.is_active) {
    return { props: { notFound: true } };
  }

  // 3. Kalau kode ketemu tapi belum di-assign link tujuan (kartu blank / belum closing)
  if (!card.destination_url) {
    return { props: { notAssigned: true, businessName: card.business_name || null } };
  }

  // 4. Catat log scan (async, gak perlu ditunggu biar redirect tetap cepat)
  supabase.from('scan_logs').insert({
    card_id: card.id,
    user_agent: req.headers['user-agent'] || null,
    referrer: req.headers['referer'] || null,
  }).then(() => {});

  // 5. Redirect ke link Google review yang sebenarnya
  res.writeHead(302, { Location: card.destination_url });
  res.end();
  return { props: {} };
}

export default function RedirectPage({ notFound, notAssigned, businessName }) {
  // Halaman ini cuma muncul sebentar kalau redirect gagal (kode invalid / belum di-assign)
  if (notFound) {
    return (
      <div style={styles.wrap}>
        <h1>Kode tidak ditemukan</h1>
        <p>Kartu ini belum terdaftar di sistem kami.</p>
      </div>
    );
  }

  if (notAssigned) {
    return (
      <div style={styles.wrap}>
        <h1>Kartu belum aktif</h1>
        <p>
          {businessName ? `Kartu untuk ${businessName}` : 'Kartu ini'} sedang menunggu
          aktivasi. Silakan hubungi VertixDigital.
        </p>
      </div>
    );
  }

  // Normalnya user gak pernah lihat ini karena udah keburu di-redirect di server
  return <div style={styles.wrap}>Mengalihkan...</div>;
}

const styles = {
  wrap: {
    fontFamily: 'system-ui, sans-serif',
    textAlign: 'center',
    padding: '60px 20px',
    color: '#333',
  },
};