import Head from 'next/head';

const WHATSAPP_NUMBER = '6282229445559';
const WHATSAPP_MESSAGE = 'Halo, saya tertarik dengan Review Card untuk bisnis saya.';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M19.6 10.23c0-.68-.06-1.33-.17-1.96H10v3.7h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.9-1.75 2.99-4.32 2.99-7.26z" fill="#4285F4" />
      <path d="M10 20c2.7 0 4.96-.9 6.61-2.43l-3.23-2.5c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.75-5.59-4.11H1.06v2.59A10 10 0 0 0 10 20z" fill="#34A853" />
      <path d="M4.41 11.92a6 6 0 0 1 0-3.84V5.49H1.06a10 10 0 0 0 0 9.02l3.35-2.59z" fill="#FBBC05" />
      <path d="M10 3.96c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 10 0 10 10 0 0 0 1.06 5.49l3.35 2.59C5.2 5.71 7.4 3.96 10 3.96z" fill="#EA4335" />
    </svg>
  );
}

function NfcIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 14c-1.3-1.3-2-3-2-4.5S2.7 6.3 4 5" stroke="#0F6B5C" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 12c-.7-.7-1-1.6-1-2.5s.3-1.8 1-2.5" stroke="#0F6B5C" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="14" cy="9.5" r="4.2" stroke="#0F6B5C" strokeWidth="1.6" />
      <circle cx="14" cy="9.5" r="1.4" fill="#0F6B5C" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="6" height="6" rx="1" stroke="#0F6B5C" strokeWidth="1.6" />
      <rect x="12" y="2" width="6" height="6" rx="1" stroke="#0F6B5C" strokeWidth="1.6" />
      <rect x="2" y="12" width="6" height="6" rx="1" stroke="#0F6B5C" strokeWidth="1.6" />
      <rect x="4.3" y="4.3" width="1.4" height="1.4" fill="#0F6B5C" />
      <rect x="14.3" y="4.3" width="1.4" height="1.4" fill="#0F6B5C" />
      <rect x="4.3" y="14.3" width="1.4" height="1.4" fill="#0F6B5C" />
      <rect x="12" y="12" width="2.6" height="2.6" fill="#0F6B5C" />
      <rect x="15.4" y="15.4" width="2.6" height="2.6" fill="#0F6B5C" />
      <rect x="12" y="15.4" width="2" height="2" fill="#0F6B5C" />
      <rect x="15.4" y="12" width="2" height="2" fill="#0F6B5C" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="page">
      <Head>
        <title>Vertix Review — Ulasan Google lebih mudah, cukup satu tap</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Kartu tap NFC & scan QR yang membawa pelanggan langsung ke halaman ulasan Google Maps bisnis Anda."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* ---------- NAV ---------- */}
      <header className="nav">
        <div className="navBrand">
          <span className="navDot" />
          <span>Vertix-Review-One</span>
        </div>
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="navCta">
          Hubungi Kami
        </a>
      </header>

      {/* ---------- HERO ---------- */}
      <section className="hero">
        <span className="eyebrow">Untuk pemilik usaha</span>
        <h1 className="heroTitle">
          Satu tap.<br />Satu ulasan Google.
        </h1>
        <p className="heroText">
          Kartu meja yang membawa pelanggan langsung ke halaman ulasan Google
          Maps bisnis Anda — cukup tap NFC atau scan QR, tanpa perlu mencari
          manual di ponsel.
        </p>
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btnPrimary">
          Tanya via WhatsApp
        </a>

        <div className="trustRow">
          <div className="trustItem">
            <GoogleIcon />
            <span>Google Maps</span>
          </div>
          <div className="trustItem">
            <NfcIcon />
            <span>NFC</span>
          </div>
          <div className="trustItem">
            <QrIcon />
            <span>QR Code</span>
          </div>
        </div>

        <div className="heroCard">
          <div className="heroCardTop">
            <div className="tapCircle">
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="9" fill="#F4EFE4" />
                <path d="M16.5 20.2l2.6 2.6 5-5.4" stroke="#12211D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <div>
              <div className="heroCardBiz">Kopi Senja</div>
              <div className="heroCardStars">★★★★★ Ulasan baru saja masuk</div>
            </div>
          </div>
          <div className="heroCardBar" />
          <div className="heroCardBar short" />
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="section">
        <h2 className="sectionTitle">Cara kerjanya</h2>
        <div className="steps">
          <div className="step">
            <div className="stepNum">1</div>
            <div className="stepTitle">Pelanggan tap atau scan</div>
            <p className="stepText">Taruh kartu di meja kasir atau meja makan. Pelanggan tinggal tap NFC atau scan QR pakai kamera HP.</p>
          </div>
          <div className="step">
            <div className="stepNum">2</div>
            <div className="stepTitle">Langsung ke halaman ulasan</div>
            <p className="stepText">Tanpa perlu cari nama bisnis atau buka aplikasi Maps manual — halaman tulis ulasan langsung terbuka.</p>
          </div>
          <div className="step">
            <div className="stepNum">3</div>
            <div className="stepTitle">Ulasan bertambah</div>
            <p className="stepText">Semakin sedikit langkah, semakin banyak pelanggan yang jadi mau menulis ulasan untuk bisnis Anda.</p>
          </div>
        </div>
      </section>

      {/* ---------- BENEFITS ---------- */}
      <section className="section sectionAlt">
        <div className="sectionInner">
          <h2 className="sectionTitle">Kenapa pakai Review Card</h2>
          <div className="benefits">
            <div className="benefitCard">
              <div className="benefitTitle">Tautan bisa diganti</div>
              <p className="benefitText">Pindah lokasi atau ganti akun Google Bisnis? Tautan tujuan diperbarui dari sistem kami, kartu tidak perlu dicetak ulang.</p>
            </div>
            <div className="benefitCard">
              <div className="benefitTitle">NFC dan QR sekaligus</div>
              <p className="benefitText">Mendukung semua jenis HP — yang mendukung NFC tinggal tap, yang tidak bisa scan QR sebagai cadangan.</p>
            </div>
            <div className="benefitCard">
              <div className="benefitTitle">Laporan penggunaan</div>
              <p className="benefitText">Setiap tap dan scan tercatat, sehingga terlihat seberapa aktif kartu digunakan pelanggan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="finalCta">
        <h2 className="finalTitle">Siap menambah ulasan Google bisnis Anda?</h2>
        <p className="finalText">Ceritakan jenis usaha Anda, kami bantu siapkan kartunya.</p>
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btnPrimaryLight">
          Chat via WhatsApp
        </a>
      </section>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Review Card by VertixDigital</span>
      </footer>

      {/* Sticky WhatsApp button, muncul terutama di mobile */}
      <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="stickyWa" aria-label="Hubungi via WhatsApp">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.4-.1-.6.1s-.7.9-.9 1a.4.4 0 0 1-.5.1c-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9a.4.4 0 0 1 .1-.5c.1-.1.3-.3.4-.5.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3c-.2.3-.9.9-.9 2.1s1 2.5 1.1 2.6c.1.2 1.9 3 4.7 4.1.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.7-.7 1.9-1.3.2-.6.2-1.1.2-1.2 0-.1-.2-.2-.5-.3z"
            fill="#F4EFE4"
          />
          <path
            d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 1.8a8.2 8.2 0 0 1 6.9 12.6l-.2.3.3 1.9-2-.5-.3.2A8.2 8.2 0 1 1 12 3.8z"
            fill="#F4EFE4"
          />
        </svg>
      </a>

      <style jsx global>{`
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }
      `}</style>

      <style jsx>{`
        .page {
          font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
          background: #FBF8F2;
          color: #1A1A18;
          overflow-x: hidden;
        }

        .nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 20px;
          max-width: 960px;
          margin: 0 auto;
        }
        .navBrand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 15px;
        }
        .navDot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #0F6B5C;
        }
        .navCta {
          font-size: 13px;
          font-weight: 600;
          color: #12211D;
          text-decoration: none;
          border: 1px solid #DDD6C6;
          padding: 8px 14px;
          border-radius: 999px;
        }

        .hero {
          max-width: 640px;
          margin: 0 auto;
          padding: 28px 24px 40px;
          text-align: left;
        }
        .eyebrow {
          display: inline-block;
          font-size: 13px;
          font-weight: 600;
          color: #0F6B5C;
          margin-bottom: 14px;
        }
        .heroTitle {
          font-size: 40px;
          line-height: 1.1;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0 0 16px 0;
        }
        .heroText {
          font-size: 16px;
          line-height: 1.6;
          color: #4A4A44;
          max-width: 480px;
          margin: 0 0 24px 0;
        }

        .trustRow {
          display: flex;
          gap: 20px;
          margin-top: 24px;
          flex-wrap: wrap;
        }
        .trustItem {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #4A4A44;
        }

        .btnPrimary, .btnPrimaryLight {
          display: inline-block;
          padding: 14px 26px;
          font-size: 15px;
          font-weight: 600;
          border-radius: 8px;
          text-decoration: none;
          font-family: inherit;
        }
        .btnPrimary {
          background: #12211D;
          color: #F4EFE4;
        }
        .btnPrimaryLight {
          background: #0F6B5C;
          color: #fff;
        }

        .heroCard {
          margin-top: 40px;
          background: #12211D;
          border-radius: 16px;
          padding: 22px;
          max-width: 360px;
        }
        .heroCardTop {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
        }
        .tapCircle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #1B302A;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .heroCardBiz {
          color: #F4EFE4;
          font-weight: 600;
          font-size: 15px;
        }
        .heroCardStars {
          color: #B9C2BC;
          font-size: 12px;
          margin-top: 2px;
        }
        .heroCardBar {
          height: 8px;
          border-radius: 4px;
          background: #24382F;
          margin-bottom: 8px;
        }
        .heroCardBar.short { width: 60%; }

        .section {
          max-width: 960px;
          margin: 0 auto;
          padding: 48px 24px;
        }
        .sectionAlt {
          background: #F2EEE2;
          max-width: 100%;
          padding: 48px 0;
        }
        .sectionInner {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .sectionTitle {
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.01em;
          margin: 0 0 28px 0;
        }

        .steps, .benefits {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .step {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .benefitCard {
          background: #fff;
          border: 1px solid #E4DCC8;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .stepNum {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #E4F0EB;
          color: #0F6B5C;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 6px;
        }
        .stepTitle, .benefitTitle {
          font-size: 16px;
          font-weight: 600;
        }
        .stepText, .benefitText {
          font-size: 14px;
          line-height: 1.6;
          color: #6B6B64;
          margin: 0;
        }

        .finalCta {
          max-width: 560px;
          margin: 0 auto;
          padding: 56px 24px 40px;
          text-align: center;
        }
        .finalTitle {
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.01em;
          margin: 0 0 10px 0;
        }
        .finalText {
          font-size: 15px;
          color: #6B6B64;
          margin: 0 0 24px 0;
        }

        .footer {
          text-align: center;
          padding: 24px;
          font-size: 12px;
          color: #A6A69C;
        }

        .stickyWa {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #0F6B5C;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 18px rgba(18,33,29,0.25);
          z-index: 50;
        }

        @media (max-width: 720px) {
          .steps, .benefits {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .heroTitle { font-size: 32px; }
          .hero { padding-top: 20px; }
          .heroCard { max-width: 100%; }
          .trustRow { gap: 16px; }
          .section { padding: 36px 20px; }
          .sectionAlt { padding: 36px 0; }
        }
      `}</style>
    </div>
  );
}