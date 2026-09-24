import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import QRCode from 'qrcode';

// Ganti ini sesuai domain lo nanti pas udah deploy (atau tetap localhost buat testing)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://vertix-review-one.vercel.app';

export default function AdminDashboard() {
  const [adminKey, setAdminKey] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrModal, setQrModal] = useState(null); // { code, dataUrl, url }
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ business_name: '', destination_url: '' });
  const [search, setSearch] = useState('');
  const [genModalOpen, setGenModalOpen] = useState(false);
  const [genCount, setGenCount] = useState(5);
  const [isMobile, setIsMobile] = useState(false);

  // Deteksi ukuran layar, biar cuma 1 versi (tabel ATAU list mobile) yang di-render
  useEffect(() => {
    function checkSize() {
      setIsMobile(window.innerWidth <= 760);
    }
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

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
        setError('Kunci admin salah.');
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
    if (res.ok) {
      setGenModalOpen(false);
      setGenCount(5);
      fetchCards();
    } else {
      setError('Gagal generate kartu.');
    }
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

  // Filter kartu berdasarkan kode atau nama bisnis
  const filteredCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter((c) => {
      const code = (c.code || '').toLowerCase();
      const biz = (c.business_name || '').toLowerCase();
      return code.includes(q) || biz.includes(q);
    });
  }, [cards, search]);

  const fontLinks = (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
    </Head>
  );

  // ---------- LOGIN SCREEN ----------
  if (!loggedIn) {
    return (
      <div className="loginPage">
        {fontLinks}
        <div className="loginPanel">
          <div className="loginBrandMark"><TapIcon /></div>
          <h1 className="loginBrandTitle">Vertix-Review-One</h1>
          <p className="loginBrandText">
            Satu tap, satu scan &mdash; langsung ke ulasan Google bisnis Anda.
            Kelola semua kartu dan tujuan tautannya dari satu tempat.
          </p>
        </div>

        <div className="loginFormSide">
          <form onSubmit={handleLogin} className="loginForm">
            <span className="loginEyebrow">Panel admin</span>
            <h2 className="loginHeading">Masuk ke dashboard</h2>
            <p className="loginSubtext">Masukkan kunci admin untuk melanjutkan.</p>

            <label className="loginLabel" htmlFor="admin-key-input">Kunci admin</label>
            <input
              id="admin-key-input"
              type="password"
              placeholder="Masukkan kunci admin"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="loginInput"
              autoFocus
            />

            <button type="submit" className="loginBtn">Masuk</button>

            {error && <p className="loginError">{error}</p>}
          </form>
        </div>

        <style jsx global>{`* { box-sizing: border-box; } html, body { margin: 0; padding: 0; }`}</style>
        <style jsx>{`
          .loginPage {
            display: flex;
            min-height: 100vh;
            font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
            background: #FBF8F2;
          }
          .loginPanel {
            flex: 1 1 40%;
            background: #12211D;
            color: #F4EFE4;
            padding: 64px 48px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 18px;
          }
          .loginBrandMark { margin-bottom: 4px; }
          .loginBrandTitle { font-size: 32px; font-weight: 600; margin: 0; letter-spacing: -0.02em; }
          .loginBrandText { font-size: 15px; line-height: 1.6; color: #C9CFC9; max-width: 320px; margin: 0; }
          .loginFormSide {
            flex: 1 1 60%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }
          .loginForm { width: 100%; max-width: 340px; display: flex; flex-direction: column; }
          .loginEyebrow { font-size: 13px; color: #0F6B5C; font-weight: 600; margin-bottom: 8px; }
          .loginHeading { font-size: 26px; font-weight: 600; color: #1A1A18; margin: 0 0 6px 0; letter-spacing: -0.01em; }
          .loginSubtext { font-size: 14px; color: #6B6B64; margin: 0 0 28px 0; }
          .loginLabel { font-size: 13px; color: #3A3A35; font-weight: 500; margin-bottom: 6px; }
          .loginInput {
            padding: 12px 14px;
            font-size: 16px;
            border: 1px solid #DDD6C6;
            border-radius: 6px;
            background: #fff;
            margin-bottom: 20px;
            outline: none;
            font-family: inherit;
            width: 100%;
          }
          .loginBtn {
            padding: 13px 16px;
            font-size: 15px;
            font-weight: 600;
            background: #0F6B5C;
            color: #fff;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-family: inherit;
          }
          .loginError { color: #B3413B; font-size: 13px; margin-top: 14px; }

          @media (max-width: 760px) {
            .loginPage { flex-direction: column; }
            .loginPanel {
              flex: 0 0 auto;
              padding: 36px 24px 28px;
              gap: 10px;
            }
            .loginBrandTitle { font-size: 24px; }
            .loginBrandText { font-size: 14px; max-width: 100%; }
            .loginFormSide { flex: 1 1 auto; padding: 28px 20px 40px; }
            .loginForm { max-width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  // ---------- DASHBOARD ----------
  const totalCards = cards.length;
  const activeCards = cards.filter((c) => c.is_active).length;
  const unassignedCards = cards.filter((c) => !c.destination_url).length;

  return (
    <div className="dashPage">
      {fontLinks}

      <div className="dashShell">
        <div className="dashHeader">
          <div className="dashBrand">
            <div className="dashBrandDot" />
            <span className="dashBrandName">Vertix-Review-One</span>
          </div>
          <button onClick={handleLogout} className="logoutBtn">Keluar</button>
        </div>

        <div className="summaryRow">
          <div className="summaryCard">
            <span className="summaryValue">{totalCards}</span>
            <span className="summaryLabel">Total kartu</span>
          </div>
          <div className="summaryCard">
            <span className="summaryValue">{activeCards}</span>
            <span className="summaryLabel">Aktif</span>
          </div>
          <div className="summaryCard">
            <span className="summaryValue">{unassignedCards}</span>
            <span className="summaryLabel">Belum di-assign</span>
          </div>
        </div>

        <div className="toolbar">
          <div className="searchBox">
            <SearchIcon />
            <input
              type="text"
              placeholder="Cari kode atau nama bisnis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="searchInput"
            />
            {search && (
              <button className="searchClear" onClick={() => setSearch('')} aria-label="Bersihkan pencarian">
                &times;
              </button>
            )}
          </div>
          <button onClick={() => setGenModalOpen(true)} className="btnPrimary btnGenerate">
            + Generate Kartu
          </button>
        </div>

        {error && <p className="errorText">{error}</p>}
        {loading && <p className="mutedText">Memuat&hellip;</p>}
        {!loading && search && (
          <p className="mutedText resultCount">
            {filteredCards.length} hasil untuk &ldquo;{search}&rdquo;
          </p>
        )}

        {/* ---- Desktop table ---- */}
        {!isMobile && (
        <div className="tableCard">
          <table className="table">
            <thead>
              <tr>
                <th className="th">Kode</th>
                <th className="th">Nama bisnis</th>
                <th className="th">Tautan tujuan</th>
                <th className="th">Scan</th>
                <th className="th">Status</th>
                <th className="th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredCards.map((card) => (
                <tr key={card.id} className="tr">
                  <td className="td"><code className="codeChip">{card.code}</code></td>

                  {editingId === card.id ? (
                    <>
                      <td className="td">
                        <input
                          className="inlineInput"
                          value={editForm.business_name}
                          onChange={(e) => setEditForm({ ...editForm, business_name: e.target.value })}
                          placeholder="Nama bisnis klien"
                        />
                      </td>
                      <td className="td">
                        <input
                          className="inlineInput"
                          value={editForm.destination_url}
                          onChange={(e) => setEditForm({ ...editForm, destination_url: e.target.value })}
                          placeholder="https://search.google.com/local/writereview?placeid=..."
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="td">{card.business_name || <span className="mutedText">&mdash;</span>}</td>
                      <td className="td">
                        {card.destination_url ? (
                          <a href={card.destination_url} target="_blank" rel="noreferrer" className="linkText">
                            {card.destination_url.replace(/^https?:\/\//, '').slice(0, 36)}&hellip;
                          </a>
                        ) : (
                          <span className="mutedText">Belum di-assign</span>
                        )}
                      </td>
                    </>
                  )}

                  <td className="td">{card.scan_logs?.[0]?.count ?? 0}</td>
                  <td className="td">
                    <span className={card.is_active ? 'badgeActive' : 'badgeInactive'}>
                      {card.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="td">
                    {editingId === card.id ? (
                      <div className="actionRow">
                        <button onClick={() => saveEdit(card.id)} className="btnSmallPrimary">Simpan</button>
                        <button onClick={() => setEditingId(null)} className="btnSmall">Batal</button>
                      </div>
                    ) : (
                      <div className="actionRow">
                        <button onClick={() => startEdit(card)} className="btnSmall">Edit</button>
                        <button onClick={() => showQr(card.code)} className="btnSmall">QR</button>
                        <button onClick={() => toggleActive(card)} className="btnSmall">
                          {card.is_active ? 'Matikan' : 'Aktifkan'}
                        </button>
                        <button onClick={() => deleteCard(card.id)} className="btnSmallDanger">Hapus</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredCards.length === 0 && !loading && (
                <tr><td colSpan={6} className="emptyState">
                  {search ? 'Tidak ada kartu yang cocok.' : 'Belum ada kartu. Generate dulu di atas.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        )}

        {/* ---- Mobile card list ---- */}
        {isMobile && (
        <div className="cardList">
          {filteredCards.map((card) => (
            <div className="mobileCard" key={card.id}>
              <div className="mobileCardTop">
                <code className="codeChip">{card.code}</code>
                <span className={card.is_active ? 'badgeActive' : 'badgeInactive'}>
                  {card.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>

              {editingId === card.id ? (
                <div className="mobileEditFields">
                  <input
                    className="inlineInput"
                    value={editForm.business_name}
                    onChange={(e) => setEditForm({ ...editForm, business_name: e.target.value })}
                    placeholder="Nama bisnis klien"
                  />
                  <input
                    className="inlineInput"
                    value={editForm.destination_url}
                    onChange={(e) => setEditForm({ ...editForm, destination_url: e.target.value })}
                    placeholder="Tautan Google review"
                  />
                </div>
              ) : (
                <>
                  <div className="mobileCardRow">
                    <span className="mobileCardLabel">Bisnis</span>
                    <span>{card.business_name || <span className="mutedText">&mdash;</span>}</span>
                  </div>
                  <div className="mobileCardRow">
                    <span className="mobileCardLabel">Tautan</span>
                    {card.destination_url ? (
                      <a href={card.destination_url} target="_blank" rel="noreferrer" className="linkText">
                        {card.destination_url.replace(/^https?:\/\//, '').slice(0, 28)}&hellip;
                      </a>
                    ) : (
                      <span className="mutedText">Belum di-assign</span>
                    )}
                  </div>
                  <div className="mobileCardRow">
                    <span className="mobileCardLabel">Scan</span>
                    <span>{card.scan_logs?.[0]?.count ?? 0}</span>
                  </div>
                </>
              )}

              <div className="actionRow mobileActionRow">
                {editingId === card.id ? (
                  <>
                    <button onClick={() => saveEdit(card.id)} className="btnSmallPrimary">Simpan</button>
                    <button onClick={() => setEditingId(null)} className="btnSmall">Batal</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(card)} className="btnSmall">Edit</button>
                    <button onClick={() => showQr(card.code)} className="btnSmall">QR</button>
                    <button onClick={() => toggleActive(card)} className="btnSmall">
                      {card.is_active ? 'Matikan' : 'Aktifkan'}
                    </button>
                    <button onClick={() => deleteCard(card.id)} className="btnSmallDanger">Hapus</button>
                  </>
                )}
              </div>
            </div>
          ))}
          {filteredCards.length === 0 && !loading && (
            <div className="emptyState">
              {search ? 'Tidak ada kartu yang cocok.' : 'Belum ada kartu. Generate dulu di atas.'}
            </div>
          )}
        </div>
        )}
      </div>

      {/* ---- QR Modal ---- */}
      {qrModal && (
        <div className="modalOverlay" onClick={() => setQrModal(null)}>
          <div className="modalBox" onClick={(e) => e.stopPropagation()}>
            <span className="modalEyebrow">Kode {qrModal.code}</span>
            <h3 className="modalTitle">QR untuk kartu ini</h3>
            <img src={qrModal.dataUrl} alt="QR Code" className="modalQr" />
            <p className="modalUrl">{qrModal.url}</p>
            <div className="modalActions">
              <a href={qrModal.dataUrl} download={`qr-${qrModal.code}.png`} className="btnPrimary">Unduh PNG</a>
              <button onClick={() => setQrModal(null)} className="btnSecondary">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Generate Cards Modal ---- */}
      {genModalOpen && (
        <div className="modalOverlay" onClick={() => setGenModalOpen(false)}>
          <div className="modalBox" onClick={(e) => e.stopPropagation()}>
            <span className="modalEyebrow">Kartu baru</span>
            <h3 className="modalTitle">Berapa kartu mau dicetak?</h3>
            <p className="genModalHint">Kartu dibuat kosong, tautan diisi belakangan.</p>

            <div className="stepper">
              <button
                type="button"
                className="stepperBtn"
                onClick={() => setGenCount((n) => Math.max(1, Number(n) - 1))}
                aria-label="Kurangi"
              >
                &minus;
              </button>
              <input
                type="number"
                min="1"
                max="200"
                value={genCount}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '') return setGenCount('');
                  setGenCount(Math.max(1, Math.min(200, Number(v))));
                }}
                className="stepperInput"
              />
              <button
                type="button"
                className="stepperBtn"
                onClick={() => setGenCount((n) => Math.min(200, Number(n) + 1))}
                aria-label="Tambah"
              >
                +
              </button>
            </div>

            <div className="modalActions">
              <button onClick={handleGenerate} disabled={loading || !genCount} className="btnPrimary">
                {loading ? 'Memproses...' : `Tambah ${genCount || 0} Kartu`}
              </button>
              <button onClick={() => setGenModalOpen(false)} className="btnSecondary">Batal</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`* { box-sizing: border-box; } html, body { margin: 0; padding: 0; }`}</style>
      <style jsx>{`
        .dashPage {
          font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
          background: #FBF8F2;
          min-height: 100vh;
          color: #1A1A18;
        }
        .dashShell { max-width: 1080px; margin: 0 auto; padding: 32px 24px 64px; }
        .dashHeader { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
        .dashBrand { display: flex; align-items: center; gap: 10px; }
        .dashBrandDot { width: 12px; height: 12px; border-radius: 50%; background: #0F6B5C; }
        .dashBrandName { font-size: 17px; font-weight: 600; letter-spacing: -0.01em; }
        .logoutBtn {
          padding: 8px 16px; font-size: 13px; font-weight: 500;
          background: transparent; color: #6B6B64; border: 1px solid #DDD6C6;
          border-radius: 6px; cursor: pointer; font-family: inherit;
        }

        .summaryRow { display: flex; gap: 12px; margin-bottom: 20px; }
        .summaryCard {
          flex: 1; background: #fff; border: 1px solid #EDE7D8; border-radius: 10px;
          padding: 16px 20px; display: flex; flex-direction: column; gap: 4px;
        }
        .summaryValue { font-size: 28px; font-weight: 700; letter-spacing: -0.02em; }
        .summaryLabel { font-size: 13px; color: #6B6B64; }

        .toolbar { display: flex; gap: 12px; margin-bottom: 16px; align-items: center; }
        .searchBox {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: 1px solid #DDD6C6;
          border-radius: 8px;
          padding: 0 12px;
        }
        .searchInput {
          border: none;
          outline: none;
          padding: 11px 0;
          font-size: 14px;
          font-family: inherit;
          flex: 1;
          background: transparent;
          min-width: 0;
        }
        .searchClear {
          border: none;
          background: transparent;
          color: #A6A69C;
          font-size: 18px;
          cursor: pointer;
          line-height: 1;
          padding: 4px;
        }
        .resultCount { margin: -8px 0 12px; }

        .tableCard { background: #fff; border: 1px solid #EDE7D8; border-radius: 10px; overflow: hidden; overflow-x: auto; }
        .table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .th {
          text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 600;
          color: #8A8A80; border-bottom: 1px solid #EDE7D8; background: #FAF7F0; white-space: nowrap;
        }
        .td { padding: 12px 16px; border-bottom: 1px solid #F2EEE2; vertical-align: middle; }
        .codeChip {
          background: #F2EEE2; padding: 3px 8px; border-radius: 4px; font-size: 13px;
          font-family: ui-monospace, Menlo, monospace;
        }
        .linkText { color: #0F6B5C; text-decoration: none; }
        .mutedText { color: #A6A69C; font-size: 13px; }
        .emptyState { padding: 32px 16px; text-align: center; color: #A6A69C; }

        .badgeActive, .badgeInactive {
          display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600;
        }
        .badgeActive { background: #E4F0EB; color: #0F6B5C; }
        .badgeInactive { background: #F2EEE2; color: #8A8A80; }

        .actionRow { display: flex; gap: 6px; flex-wrap: wrap; }
        .inlineInput {
          padding: 7px 10px; font-size: 13px; border: 1px solid #DDD6C6; border-radius: 5px;
          width: 100%; box-sizing: border-box; font-family: inherit;
        }

        .btnPrimary {
          padding: 10px 18px; font-size: 14px; font-weight: 600; background: #0F6B5C; color: #fff;
          border: none; border-radius: 6px; cursor: pointer; text-decoration: none;
          display: inline-block; font-family: inherit; text-align: center;
        }
        .btnPrimary:disabled { opacity: 0.6; cursor: default; }
        .btnSecondary {
          padding: 10px 18px; font-size: 14px; font-weight: 500; background: transparent; color: #6B6B64;
          border: 1px solid #DDD6C6; border-radius: 6px; cursor: pointer; font-family: inherit;
        }
        .btnSmall {
          padding: 5px 10px; font-size: 12px; font-weight: 500; border: 1px solid #DDD6C6; border-radius: 5px;
          background: #fff; color: #3A3A35; cursor: pointer; font-family: inherit;
        }
        .btnSmallPrimary {
          padding: 5px 10px; font-size: 12px; font-weight: 600; border: none; border-radius: 5px;
          background: #0F6B5C; color: #fff; cursor: pointer; font-family: inherit;
        }
        .btnSmallDanger {
          padding: 5px 10px; font-size: 12px; font-weight: 500; border: 1px solid #E3B8B4; border-radius: 5px;
          background: #fff; color: #B3413B; cursor: pointer; font-family: inherit;
        }
        .errorText { color: #B3413B; font-size: 14px; margin-bottom: 12px; }

        .modalOverlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(18,33,29,0.55);
          display: flex; justify-content: center; align-items: center; padding: 20px; z-index: 100;
        }
        .modalBox {
          background: #fff; padding: 28px 28px 24px; border-radius: 12px; text-align: center;
          display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 340px;
        }
        .modalEyebrow { font-size: 12px; font-weight: 600; color: #0F6B5C; }
        .modalTitle { font-size: 18px; font-weight: 600; margin: 0 0 4px 0; }
        .modalQr { width: 100%; max-width: 260px; margin: 0 auto; border-radius: 6px; }
        .modalUrl { word-break: break-all; font-size: 12px; color: #8A8A80; margin: 8px 0 4px; }
        .modalActions { display: flex; gap: 8px; justify-content: center; margin-top: 8px; flex-wrap: wrap; }
        .modalActions > * { flex: 1; min-width: 120px; }

        .genModalHint { font-size: 13px; color: #6B6B64; margin: 0 0 16px 0; }
        .stepper { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 8px; }
        .stepperBtn {
          width: 40px; height: 40px; border-radius: 8px; border: 1px solid #DDD6C6; background: #FAF7F0;
          font-size: 18px; font-weight: 600; color: #12211D; cursor: pointer; font-family: inherit;
        }
        .stepperInput {
          width: 72px; text-align: center; font-size: 20px; font-weight: 700; padding: 8px 4px;
          border: 1px solid #DDD6C6; border-radius: 8px; font-family: inherit;
          -moz-appearance: textfield;
        }
        .stepperInput::-webkit-outer-spin-button,
        .stepperInput::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

        /* ---- Mobile card list ---- */
        .cardList { display: flex; flex-direction: column; gap: 12px; }
        .mobileCard {
          background: #fff; border: 1px solid #EDE7D8; border-radius: 10px; padding: 14px 16px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .mobileCardTop { display: flex; justify-content: space-between; align-items: center; }
        .mobileCardRow { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; }
        .mobileCardLabel { color: #8A8A80; flex-shrink: 0; }
        .mobileEditFields { display: flex; flex-direction: column; gap: 8px; margin: 4px 0; }
        .mobileActionRow { margin-top: 4px; }

        @media (max-width: 760px) {
          .dashShell { padding: 20px 16px 48px; }
          .dashHeader { margin-bottom: 20px; }
          .summaryRow { gap: 8px; }
          .summaryCard { padding: 12px 14px; }
          .summaryValue { font-size: 22px; }
          .summaryLabel { font-size: 11px; }
          .toolbar { flex-wrap: wrap; }
          .btnGenerate { width: 100%; }
          .searchBox { flex: 1 1 100%; }
        }
      `}</style>
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

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke="#A6A69C" strokeWidth="1.6" />
      <path d="M11 11l3.5 3.5" stroke="#A6A69C" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}