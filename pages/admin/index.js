import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

// Ganti ini sesuai domain lo nanti pas udah deploy (atau tetap localhost buat testing)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://review-card-beta.vercel.app/';

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
      <div style={styles.loginWrap}>
        <form onSubmit={handleLogin} style={styles.loginBox}>
          <h2>Admin Login</h2>
          <input
            type="password"
            placeholder="Admin key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            style={styles.input}
            autoFocus
          />
          <button type="submit" style={styles.btnPrimary}>Masuk</button>
          {error && <p style={styles.errorText}>{error}</p>}
        </form>
      </div>
    );
  }

  // ---------- DASHBOARD ----------
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1>Review Card Dashboard</h1>
        <button onClick={handleLogout} style={styles.btnSecondary}>Logout</button>
      </div>

      <div style={styles.genBox}>
        <label>Generate kartu baru: </label>
        <input
          type="number"
          min="1"
          max="100"
          value={genCount}
          onChange={(e) => setGenCount(e.target.value)}
          style={{ ...styles.input, width: 80, display: 'inline-block' }}
        />
        <button onClick={handleGenerate} disabled={loading} style={styles.btnPrimary}>
          + Generate {genCount} Kartu
        </button>
      </div>

      {error && <p style={styles.errorText}>{error}</p>}
      {loading && <p>Memuat...</p>}

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Kode</th>
            <th style={styles.th}>Nama Bisnis</th>
            <th style={styles.th}>Link Tujuan</th>
            <th style={styles.th}>Scan</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {cards.map((card) => (
            <tr key={card.id} style={!card.is_active ? { opacity: 0.5 } : {}}>
              <td style={styles.td}><code>{card.code}</code></td>

              {editingId === card.id ? (
                <>
                  <td style={styles.td}>
                    <input
                      style={styles.input}
                      value={editForm.business_name}
                      onChange={(e) => setEditForm({ ...editForm, business_name: e.target.value })}
                      placeholder="Nama bisnis klien"
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.input}
                      value={editForm.destination_url}
                      onChange={(e) => setEditForm({ ...editForm, destination_url: e.target.value })}
                      placeholder="https://search.google.com/local/writereview?placeid=..."
                    />
                  </td>
                </>
              ) : (
                <>
                  <td style={styles.td}>{card.business_name || <em>-</em>}</td>
                  <td style={styles.td}>
                    {card.destination_url ? (
                      <a href={card.destination_url} target="_blank" rel="noreferrer">
                        {card.destination_url.slice(0, 40)}...
                      </a>
                    ) : (
                      <em style={{ color: '#999' }}>belum di-assign</em>
                    )}
                  </td>
                </>
              )}

              <td style={styles.td}>{card.scan_logs?.[0]?.count ?? 0}</td>
              <td style={styles.td}>{card.is_active ? '🟢 Aktif' : '⚪ Nonaktif'}</td>
              <td style={styles.td}>
                {editingId === card.id ? (
                  <>
                    <button onClick={() => saveEdit(card.id)} style={styles.btnSmallPrimary}>Simpan</button>
                    <button onClick={() => setEditingId(null)} style={styles.btnSmall}>Batal</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(card)} style={styles.btnSmall}>Edit</button>
                    <button onClick={() => showQr(card.code)} style={styles.btnSmall}>QR</button>
                    <button onClick={() => toggleActive(card)} style={styles.btnSmall}>
                      {card.is_active ? 'Matikan' : 'Aktifkan'}
                    </button>
                    <button onClick={() => deleteCard(card.id)} style={styles.btnSmallDanger}>Hapus</button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {cards.length === 0 && !loading && (
            <tr><td colSpan={6} style={styles.td}>Belum ada kartu. Generate dulu di atas.</td></tr>
          )}
        </tbody>
      </table>

      {qrModal && (
        <div style={styles.modalOverlay} onClick={() => setQrModal(null)}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <h3>QR Code: {qrModal.code}</h3>
            <img src={qrModal.dataUrl} alt="QR Code" style={{ width: '100%', maxWidth: 300 }} />
            <p style={{ wordBreak: 'break-all', fontSize: 12, color: '#666' }}>{qrModal.url}</p>
            <a href={qrModal.dataUrl} download={`qr-${qrModal.code}.png`} style={styles.btnPrimary}>
              Download PNG
            </a>
            <button onClick={() => setQrModal(null)} style={styles.btnSecondary}>Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 1100, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  loginWrap: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'system-ui, sans-serif' },
  loginBox: { display: 'flex', flexDirection: 'column', gap: 10, width: 280, padding: 24, border: '1px solid #ddd', borderRadius: 8 },
  genBox: { marginBottom: 20, padding: 16, background: '#f7f7f7', borderRadius: 8, display: 'flex', gap: 10, alignItems: 'center' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { textAlign: 'left', borderBottom: '2px solid #ddd', padding: 8 },
  td: { borderBottom: '1px solid #eee', padding: 8, verticalAlign: 'middle' },
  input: { padding: 8, border: '1px solid #ccc', borderRadius: 4, width: '100%', boxSizing: 'border-box' },
  btnPrimary: { padding: '8px 16px', background: '#000', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' },
  btnSecondary: { padding: '8px 16px', background: '#eee', border: 'none', borderRadius: 4, cursor: 'pointer', marginLeft: 8 },
  btnSmall: { padding: '4px 8px', fontSize: 12, marginRight: 4, border: '1px solid #ccc', borderRadius: 4, background: '#fff', cursor: 'pointer' },
  btnSmallPrimary: { padding: '4px 8px', fontSize: 12, marginRight: 4, border: 'none', borderRadius: 4, background: '#000', color: '#fff', cursor: 'pointer' },
  btnSmallDanger: { padding: '4px 8px', fontSize: 12, border: '1px solid #f55', borderRadius: 4, background: '#fff', color: '#f55', cursor: 'pointer' },
  errorText: { color: '#c00' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modalBox: { background: '#fff', padding: 24, borderRadius: 8, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 },
};