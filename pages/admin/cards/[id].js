import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function detectDevice(ua) {
  if (!ua) return 'Tidak diketahui';
  if (/iphone/i.test(ua)) return 'iPhone';
  if (/ipad/i.test(ua)) return 'iPad';
  if (/android/i.test(ua)) return 'Android';
  if (/windows/i.test(ua)) return 'Windows';
  if (/macintosh/i.test(ua)) return 'Mac';
  return 'Lainnya';
}

function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function CardDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [adminKey, setAdminKey] = useState('');
  const [card, setCard] = useState(null);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('admin_key');
    if (!saved) {
      router.replace('/admin');
      return;
    }
    setAdminKey(saved);
  }, []);

  useEffect(() => {
    if (adminKey && id) fetchData();
  }, [adminKey, id]);

  async function fetchData() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/cards/${id}/scans`, {
        headers: { 'x-admin-key': adminKey },
      });
      if (res.status === 401) {
        router.replace('/admin');
        return;
      }
      if (res.status === 404) {
        setError('Kartu tidak ditemukan.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setCard(data.card);
      setScans(data.scans || []);
    } catch (e) {
      setError('Gagal memuat data.');
    }
    setLoading(false);
  }

  // Hitung statistik dari data scan
  const stats = useMemo(() => {
    if (!scans.length) return null;

    const hourCounts = new Array(24).fill(0);
    const dayCounts = new Array(7).fill(0);
    const deviceCounts = {};

    scans.forEach((s) => {
      const d = new Date(s.scanned_at);
      hourCounts[d.getHours()]++;
      dayCounts[d.getDay()]++;
      const dev = detectDevice(s.user_agent);
      deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;
    });

    const busiestHourIdx = hourCounts.indexOf(Math.max(...hourCounts));
    const busiestDayIdx = dayCounts.indexOf(Math.max(...dayCounts));

    const last7Days = scans.filter((s) => {
      const diff = Date.now() - new Date(s.scanned_at).getTime();
      return diff <= 7 * 24 * 60 * 60 * 1000;
    }).length;

    const deviceList = Object.entries(deviceCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count, pct: Math.round((count / scans.length) * 100) }));

    return {
      total: scans.length,
      last7Days,
      busiestHour: busiestHourIdx,
      busiestHourCount: hourCounts[busiestHourIdx],
      busiestDay: DAY_NAMES[busiestDayIdx],
      busiestDayCount: dayCounts[busiestDayIdx],
      hourCounts,
      deviceList,
    };
  }, [scans]);

  const maxHourCount = stats ? Math.max(...stats.hourCounts) : 0;

  return (
    <div className="page">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="shell">
        <Link href="/admin" className="backLink">&larr; Kembali ke dashboard</Link>

        {loading && <p className="mutedText">Memuat&hellip;</p>}
        {error && <p className="errorText">{error}</p>}

        {card && (
          <>
            <div className="header">
              <div>
                <code className="codeChip">{card.code}</code>
                <h1 className="title">{card.business_name || 'Belum ada nama bisnis'}</h1>
              </div>
              <span className={card.is_active ? 'badgeActive' : 'badgeInactive'}>
                {card.is_active ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>

            {!stats && (
              <div className="emptyBox">Belum ada aktivitas scan untuk kartu ini.</div>
            )}

            {stats && (
              <>
                <div className="summaryRow">
                  <div className="summaryCard">
                    <span className="summaryValue">{stats.total}</span>
                    <span className="summaryLabel">Total scan</span>
                  </div>
                  <div className="summaryCard">
                    <span className="summaryValue">{stats.last7Days}</span>
                    <span className="summaryLabel">7 hari terakhir</span>
                  </div>
                  <div className="summaryCard">
                    <span className="summaryValue">{stats.busiestHour}:00</span>
                    <span className="summaryLabel">Jam paling ramai</span>
                  </div>
                  <div className="summaryCard">
                    <span className="summaryValue">{stats.busiestDay}</span>
                    <span className="summaryLabel">Hari paling ramai</span>
                  </div>
                </div>

                <div className="panel">
                  <h2 className="panelTitle">Distribusi jam scan</h2>
                  <div className="hourChart">
                    {stats.hourCounts.map((count, hour) => (
                      <div key={hour} className="hourBarWrap" title={`${hour}:00 — ${count} scan`}>
                        <div
                          className="hourBar"
                          style={{ height: maxHourCount ? `${Math.max(4, (count / maxHourCount) * 100)}%` : '4%' }}
                        />
                        {hour % 3 === 0 && <span className="hourLabel">{hour}</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel">
                  <h2 className="panelTitle">Perangkat</h2>
                  <div className="deviceList">
                    {stats.deviceList.map((d) => (
                      <div key={d.name} className="deviceRow">
                        <span className="deviceName">{d.name}</span>
                        <div className="deviceBarTrack">
                          <div className="deviceBarFill" style={{ width: `${d.pct}%` }} />
                        </div>
                        <span className="devicePct">{d.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel">
                  <h2 className="panelTitle">Riwayat scan terbaru</h2>
                  <div className="historyList">
                    {scans.slice(0, 50).map((s, i) => (
                      <div key={i} className="historyRow">
                        <span className="historyTime">{formatDateTime(s.scanned_at)}</span>
                        <span className="historyDevice">{detectDevice(s.user_agent)}</span>
                      </div>
                    ))}
                  </div>
                  {scans.length > 50 && (
                    <p className="mutedText" style={{ marginTop: 10 }}>
                      Menampilkan 50 dari {scans.length} scan.
                    </p>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <style jsx global>{`* { box-sizing: border-box; } html, body { margin: 0; padding: 0; }`}</style>
      <style jsx>{`
        .page {
          font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
          background: #FBF8F2;
          min-height: 100vh;
          color: #1A1A18;
        }
        .shell { max-width: 800px; margin: 0 auto; padding: 24px 20px 64px; }
        .backLink { font-size: 13px; color: #6B6B64; text-decoration: none; display: inline-block; margin-bottom: 20px; }

        .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
        .codeChip {
          background: #F2EEE2; padding: 3px 8px; border-radius: 4px; font-size: 13px;
          font-family: ui-monospace, Menlo, monospace; display: inline-block; margin-bottom: 8px;
        }
        .title { font-size: 24px; font-weight: 700; letter-spacing: -0.01em; margin: 0; }
        .badgeActive, .badgeInactive {
          display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; flex-shrink: 0;
        }
        .badgeActive { background: #E4F0EB; color: #0F6B5C; }
        .badgeInactive { background: #F2EEE2; color: #8A8A80; }

        .summaryRow { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 24px; }
        .summaryCard {
          background: #fff; border: 1px solid #EDE7D8; border-radius: 10px; padding: 14px 12px;
          display: flex; flex-direction: column; gap: 2px;
        }
        .summaryValue { font-size: 20px; font-weight: 700; letter-spacing: -0.01em; }
        .summaryLabel { font-size: 11px; color: #6B6B64; }

        .panel { background: #fff; border: 1px solid #EDE7D8; border-radius: 10px; padding: 20px; margin-bottom: 16px; }
        .panelTitle { font-size: 15px; font-weight: 600; margin: 0 0 16px 0; }

        .hourChart { display: flex; align-items: flex-end; gap: 3px; height: 110px; }
        .hourBarWrap { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; gap: 4px; }
        .hourBar { width: 100%; max-width: 14px; background: #0F6B5C; border-radius: 3px 3px 0 0; min-height: 3px; }
        .hourLabel { font-size: 9px; color: #A6A69C; }

        .deviceList { display: flex; flex-direction: column; gap: 12px; }
        .deviceRow { display: flex; align-items: center; gap: 10px; font-size: 13px; }
        .deviceName { width: 80px; flex-shrink: 0; color: #3A3A35; }
        .deviceBarTrack { flex: 1; height: 8px; background: #F2EEE2; border-radius: 4px; overflow: hidden; }
        .deviceBarFill { height: 100%; background: #0F6B5C; border-radius: 4px; }
        .devicePct { width: 36px; text-align: right; color: #6B6B64; flex-shrink: 0; }

        .historyList { display: flex; flex-direction: column; }
        .historyRow {
          display: flex; justify-content: space-between; padding: 9px 0; font-size: 13px;
          border-bottom: 1px solid #F2EEE2;
        }
        .historyRow:last-child { border-bottom: none; }
        .historyTime { color: #1A1A18; }
        .historyDevice { color: #8A8A80; }

        .emptyBox { background: #fff; border: 1px solid #EDE7D8; border-radius: 10px; padding: 32px; text-align: center; color: #A6A69C; }
        .mutedText { color: #A6A69C; font-size: 13px; }
        .errorText { color: #B3413B; font-size: 14px; }

        @media (max-width: 600px) {
          .summaryRow { grid-template-columns: repeat(2, 1fr); }
          .title { font-size: 20px; }
          .deviceName { width: 64px; font-size: 12px; }
        }
      `}</style>
    </div>
  );
}