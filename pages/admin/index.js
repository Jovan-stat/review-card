import { useState, useEffect } from 'react';
import Head from 'next/head';
import QRCode from 'qrcode';

// Ganti ini sesuai domain lo nanti pas udah deploy (atau tetap localhost buat testing)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://vertix-review-one.vercel.app';

export default function AdminDashboard() {
  const [adminKey, setAdminKey] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrModal, setQrModal] = useState(null); // { code, dataUrl }
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ business_name: '', destination_url: '' });
  const [genCount, setGenCount] = useState(5);

  // Cek apakah key udah tersimpan dari sesi sebelumnya
  useEffect(() => {
    const saved = localStorage.getItem('admin_key');
    if (saved) {
      setAdminKey(saved);
      setLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (loggedIn) fetchCards();
  }, [loggedIn]);

  async function fetchCards() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/cards', {
        headers: { 'x-admin-key': adminKey },
      });
      if (res.status === 401) {
        setError('Admin key salah.');
        setLoggedIn(false);
        localStorage.removeItem('admin_key');
        return;
      }
      const data = await res.json();
      setCards(data.cards || []);
    } catch (e) {
      setError('Gagal memuat data. Pastikan server jalan.');
    }
    setLoading(false);
  }

  function handleLogin(e) {
    e.preventDefault();
    localStorage.setItem('admin_key', adminKey);
    setLoggedIn(true);
  }

  function handleLogout() {
    localStorage.removeItem('admin_key');
    setAdminKey('');
    setLoggedIn(false);
    setCards([]);
  }

  async function handleGenerate() {
    setLoading(true);
    const res = await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ count: Number(genCount) }),
    });
    if (res.ok) fetchCards();
    else setError('Gagal generate kartu.');
    setLoading(false);
  }

  function startEdit(card) {
    setEditingId(card.id);
    setEditForm({
      business_name: card.business_name || '',
      destination_url: card.destination_url || '',
    });
  }

  async function saveEdit(id) {
    setLoading(true);
    const res = await fetch(`/api/cards/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      setEditingId(null);
      fetchCards();
    } else {
      setError('Gagal menyimpan perubahan.');
    }
    setLoading(false);
  }

  async function toggleActive(card) {
    await fetch(`/api/cards/${card.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ is_active: !card.is_active }),
    });
    fetchCards();
  }

  async function deleteCard(id) {
    if (!confirm('Hapus kartu ini? Tidak bisa dibatalkan.')) return;
    await fetch(`/api/cards/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-key': adminKey },
    });
    fetchCards();
  }

  async function showQr(code) {
    const url = `${BASE_URL}/r/${code}`;
    const dataUrl = await QRCode.toDataURL(url, { width: 400, margin: 2 });
    setQrModal({ code, dataUrl, url });
  }

  // ---------- LOGIN SCREEN ----------
  if (!loggedIn) {
    return (
      <div style={styles.loginPage}>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
          <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
        </Head>
        <div style={styles.loginPanel}>
          <div style={styles.loginBrandMark}>
            <TapIcon />
          </div>
          <h1 style={styles.loginBrandTitle}>Review Card</h1>
          <p style={styles.loginBrandText}>
            Satu tap, satu scan &mdash; langsung ke ulasan Google bisnis Anda.
            Kelola semua kartu dan tujuan tautannya dari satu tempat.
          </p>
        </div>

        <div style={styles.loginFormSide}>
          <form onSubmit={handleLogin} style={styles.loginForm}>
            <span style={styles.loginEyebrow}>Panel admin</span>
            <h2 style={styles.loginHeading}>Masuk ke dashboard</h2>
            <p style={styles.loginSubtext}>Masukkan kunci admin untuk melanjutkan.</p>

            <label style={styles.loginLabel} htmlFor="admin-key-input">Kunci admin</label>
            <input
              id="admin-key-input"
              type="password"
              placeholder="Masukkan kunci admin"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              style={styles.loginInput}
              autoFocus
            />

            <button type="submit" style={styles.loginBtn}>Masuk</button>

            {error && <p style={styles.loginError}>{error}</p>}
          </form>
        </div>
      </div>
    );
  }

  // ---------- DASHBOARD ----------
  const totalCards = cards.length;
  const activeCards = cards.filter((c) => c.is_active).length;
  const unassignedCards = cards.filter((c) => !c.destination_url).length;

  return (
    <div style={styles.dashPage}>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div style={styles.dashShell}>
        <div style={styles.dashHeader}>
          <div style={styles.dashBrand}>
            <div style={styles.dashBrandDot} />
            <span style={styles.dashBrandName}>Review Card</span>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>Keluar</button>
        </div>

        <div style={styles.summaryRow}>
          <div style={styles.summaryCard}>
            <span style={styles.summaryValue}>{totalCards}</span>
            <span style={styles.summaryLabel}>Total kartu</span>
          </div>
          <div style={styles.summaryCard}>
            <span style={styles.summaryValue}>{activeCards}</span>
            <span style={styles.summaryLabel}>Aktif</span>
          </div>
          <div style={styles.summaryCard}>
            <span style={styles.summaryValue}>{unassignedCards}</span>
            <span style={styles.summaryLabel}>Belum di-assign</span>
          </div>
        </div>

        <div style={styles.genBox}>
          <div>
            <div style={styles.genLabel}>Cetak kartu baru</div>
            <div style={styles.genHint}>Kartu dibuat kosong, tautan diisi belakangan.</div>
          </div>
          <div style={styles.genControls}>
            <input
              type="number"
              min="1"
              max="100"
              value={genCount}
              onChange={(e) => setGenCount(e.target.value)}
              style={styles.genInput}
            />
            <button onClick={handleGenerate} disabled={loading} style={styles.btnPrimary}>
              Generate {genCount} kartu
            </button>
          </div>
        </div>

        {error && <p style={styles.errorText}>{error}</p>}
        {loading && <p style={styles.mutedText}>Memuat&hellip;</p>}

        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Kode</th>
                <th style={styles.th}>Nama bisnis</th>
                <th style={styles.th}>Tautan tujuan</th>
                <th style={styles.th}>Scan</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card) => (
                <tr key={card.id} style={styles.tr}>
                  <td style={styles.td}><code style={styles.codeChip}>{card.code}</code></td>

                  {editingId === card.id ? (
                    <>
                      <td style={styles.td}>
                        <input
                          style={styles.inlineInput}
                          value={editForm.business_name}
                          onChange={(e) => setEditForm({ ...editForm, business_name: e.target.value })}
                          placeholder="Nama bisnis klien"
                        />
                      </td>
                      <td style={styles.td}>
                        <input
                          style={styles.inlineInput}
                          value={editForm.destination_url}
                          onChange={(e) => setEditForm({ ...editForm, destination_url: e.target.value })}
                          placeholder="https://search.google.com/local/writereview?placeid=..."
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={styles.td}>
                        {card.business_name || <span style={styles.mutedText}>&mdash;</span>}
                      </td>
                      <td style={styles.td}>
                        {card.destination_url ? (
                          <a href={card.destination_url} target="_blank" rel="noreferrer" style={styles.linkText}>
                            {card.destination_url.replace(/^https?:\/\//, '').slice(0, 36)}&hellip;
                          </a>
                        ) : (
                          <span style={styles.mutedText}>Belum di-assign</span>
                        )}
                      </td>
                    </>
                  )}

                  <td style={styles.td}>{card.scan_logs?.[0]?.count ?? 0}</td>
                  <td style={styles.td}>
                    <span style={card.is_active ? styles.badgeActive : styles.badgeInactive}>
                      {card.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {editingId === card.id ? (
                      <div style={styles.actionRow}>
                        <button onClick={() => saveEdit(card.id)} style={styles.btnSmallPrimary}>Simpan</button>
                        <button onClick={() => setEditingId(null)} style={styles.btnSmall}>Batal</button>
                      </div>
                    ) : (
                      <div style={styles.actionRow}>
                        <button onClick={() => startEdit(card)} style={styles.btnSmall}>Edit</button>
                        <button onClick={() => showQr(card.code)} style={styles.btnSmall}>QR</button>
                        <button onClick={() => toggleActive(card)} style={styles.btnSmall}>
                          {card.is_active ? 'Matikan' : 'Aktifkan'}
                        </button>
                        <button onClick={() => deleteCard(card.id)} style={styles.btnSmallDanger}>Hapus</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {cards.length === 0 && !loading && (
                <tr><td colSpan={6} style={styles.emptyState}>Belum ada kartu. Generate dulu di atas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {qrModal && (
        <div style={styles.modalOverlay} onClick={() => setQrModal(null)}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <span style={styles.modalEyebrow}>Kode {qrModal.code}</span>
            <h3 style={styles.modalTitle}>QR untuk kartu ini</h3>
            <img src={qrModal.dataUrl} alt="QR Code" style={styles.modalQr} />
            <p style={styles.modalUrl}>{qrModal.url}</p>
            <div style={styles.modalActions}>
              <a href={qrModal.dataUrl} download={`qr-${qrModal.code}.png`} style={styles.btnPrimary}>
                Unduh PNG
              </a>
              <button onClick={() => setQrModal(null)} style={styles.btnSecondary}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TapIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 4C11.16 4 4 11.16 4 20s7.16 16 16 16 16-7.16 16-16" stroke="#E8DCC8" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 5" />
      <circle cx="20" cy="20" r="9" fill="#0F6B5C" />
      <path d="M16.5 20.2l2.6 2.6 5-5.4" stroke="#F4EFE4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

const FONT_SANS = "'Space Grotesk', 'Segoe UI', system-ui, sans-serif";

const styles = {
  // ---- Dashboard shell ----
  dashPage: {
    fontFamily: FONT_SANS,
    background: '#FBF8F2',
    minHeight: '100vh',
    color: '#1A1A18',
  },
  dashShell: {
    maxWidth: 1080,
    margin: '0 auto',
    padding: '32px 24px 64px',
  },
  dashHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  dashBrand: { display: 'flex', alignItems: 'center', gap: 10 },
  dashBrandDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: '#0F6B5C',
  },
  dashBrandName: { fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' },
  logoutBtn: {
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 500,
    background: 'transparent',
    color: '#6B6B64',
    border: '1px solid #DDD6C6',
    borderRadius: 6,
    cursor: 'pointer',
    fontFamily: FONT_SANS,
  },

  // ---- Summary cards ----
  summaryRow: { display: 'flex', gap: 12, marginBottom: 20 },
  summaryCard: {
    flex: 1,
    background: '#fff',
    border: '1px solid #EDE7D8',
    borderRadius: 10,
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  summaryValue: { fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' },
  summaryLabel: { fontSize: 13, color: '#6B6B64' },

  // ---- Generate box ----
  genBox: {
    background: '#12211D',
    color: '#F4EFE4',
    borderRadius: 10,
    padding: '18px 22px',
    marginBottom: 20,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  genLabel: { fontSize: 15, fontWeight: 600 },
  genHint: { fontSize: 13, color: '#B9C2BC', marginTop: 2 },
  genControls: { display: 'flex', gap: 10, alignItems: 'center' },
  genInput: {
    width: 64,
    padding: '10px 10px',
    fontSize: 14,
    border: '1px solid #35473F',
    borderRadius: 6,
    background: '#1B302A',
    color: '#F4EFE4',
    textAlign: 'center',
    fontFamily: FONT_SANS,
  },

  // ---- Table ----
  tableCard: {
    background: '#fff',
    border: '1px solid #EDE7D8',
    borderRadius: 10,
    overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    fontSize: 12,
    fontWeight: 600,
    color: '#8A8A80',
    borderBottom: '1px solid #EDE7D8',
    background: '#FAF7F0',
  },
  tr: {},
  td: { padding: '12px 16px', borderBottom: '1px solid #F2EEE2', verticalAlign: 'middle' },
  codeChip: {
    background: '#F2EEE2',
    padding: '3px 8px',
    borderRadius: 4,
    fontSize: 13,
    fontFamily: 'ui-monospace, Menlo, monospace',
  },
  linkText: { color: '#0F6B5C', textDecoration: 'none' },
  mutedText: { color: '#A6A69C', fontSize: 13 },
  emptyState: { padding: '32px 16px', textAlign: 'center', color: '#A6A69C' },

  badgeActive: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    background: '#E4F0EB',
    color: '#0F6B5C',
  },
  badgeInactive: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    background: '#F2EEE2',
    color: '#8A8A80',
  },

  actionRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  inlineInput: {
    padding: '7px 10px',
    fontSize: 13,
    border: '1px solid #DDD6C6',
    borderRadius: 5,
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: FONT_SANS,
  },

  // ---- Buttons ----
  btnPrimary: {
    padding: '10px 18px',
    fontSize: 14,
    fontWeight: 600,
    background: '#0F6B5C',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    fontFamily: FONT_SANS,
  },
  btnSecondary: {
    padding: '10px 18px',
    fontSize: 14,
    fontWeight: 500,
    background: 'transparent',
    color: '#6B6B64',
    border: '1px solid #DDD6C6',
    borderRadius: 6,
    cursor: 'pointer',
    fontFamily: FONT_SANS,
  },
  btnSmall: {
    padding: '5px 10px',
    fontSize: 12,
    fontWeight: 500,
    border: '1px solid #DDD6C6',
    borderRadius: 5,
    background: '#fff',
    color: '#3A3A35',
    cursor: 'pointer',
    fontFamily: FONT_SANS,
  },
  btnSmallPrimary: {
    padding: '5px 10px',
    fontSize: 12,
    fontWeight: 600,
    border: 'none',
    borderRadius: 5,
    background: '#0F6B5C',
    color: '#fff',
    cursor: 'pointer',
    fontFamily: FONT_SANS,
  },
  btnSmallDanger: {
    padding: '5px 10px',
    fontSize: 12,
    fontWeight: 500,
    border: '1px solid #E3B8B4',
    borderRadius: 5,
    background: '#fff',
    color: '#B3413B',
    cursor: 'pointer',
    fontFamily: FONT_SANS,
  },
  errorText: { color: '#B3413B', fontSize: 14, marginBottom: 12 },

  // ---- QR Modal ----
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(18,33,29,0.55)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    background: '#fff',
    padding: '28px 28px 24px',
    borderRadius: 12,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    width: '100%',
    maxWidth: 340,
  },
  modalEyebrow: { fontSize: 12, fontWeight: 600, color: '#0F6B5C' },
  modalTitle: { fontSize: 18, fontWeight: 600, margin: '0 0 8px 0' },
  modalQr: { width: '100%', maxWidth: 260, margin: '0 auto', borderRadius: 6 },
  modalUrl: { wordBreak: 'break-all', fontSize: 12, color: '#8A8A80', margin: '8px 0 4px' },
  modalActions: { display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8 },

  // ---- Login screen ----
  loginPage: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: FONT_SANS,
    background: '#FBF8F2',
  },
  loginPanel: {
    flex: '1 1 40%',
    background: '#12211D',
    color: '#F4EFE4',
    padding: '64px 48px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 18,
  },
  loginBrandMark: { marginBottom: 4 },
  loginBrandTitle: {
    fontSize: 32,
    fontWeight: 600,
    margin: 0,
    letterSpacing: '-0.02em',
  },
  loginBrandText: {
    fontSize: 15,
    lineHeight: 1.6,
    color: '#C9CFC9',
    maxWidth: 320,
    margin: 0,
  },
  loginFormSide: {
    flex: '1 1 60%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loginForm: {
    width: '100%',
    maxWidth: 340,
    display: 'flex',
    flexDirection: 'column',
  },
  loginEyebrow: {
    fontSize: 13,
    color: '#0F6B5C',
    fontWeight: 600,
    marginBottom: 8,
  },
  loginHeading: {
    fontSize: 26,
    fontWeight: 600,
    color: '#1A1A18',
    margin: '0 0 6px 0',
    letterSpacing: '-0.01em',
  },
  loginSubtext: {
    fontSize: 14,
    color: '#6B6B64',
    margin: '0 0 28px 0',
  },
  loginLabel: {
    fontSize: 13,
    color: '#3A3A35',
    fontWeight: 500,
    marginBottom: 6,
  },
  loginInput: {
    padding: '12px 14px',
    fontSize: 15,
    border: '1px solid #DDD6C6',
    borderRadius: 6,
    background: '#fff',
    marginBottom: 20,
    outline: 'none',
    fontFamily: FONT_SANS,
  },
  loginBtn: {
    padding: '12px 16px',
    fontSize: 15,
    fontWeight: 600,
    background: '#0F6B5C',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontFamily: FONT_SANS,
  },
  loginError: {
    color: '#B3413B',
    fontSize: 13,
    marginTop: 14,
  },

};