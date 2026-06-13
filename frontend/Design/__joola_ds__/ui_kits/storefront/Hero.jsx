// Hero.jsx — full-bleed image hero with oversized display headline
function Hero({ onShopClick }) {
  return (
    <section style={{ position: 'relative', background: '#000', color: '#fff', overflow: 'hidden', height: 560 }}>
      <img
        src="../../assets/imagery/paddle-perseus-red.jpg"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45, filter: 'grayscale(30%)' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.1) 100%)' }} />
      <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', padding: '96px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16, color: '#fff' }}>Now Available</div>
        <h1 style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 'clamp(64px, 9vw, 128px)', letterSpacing: '-0.02em', lineHeight: 0.95, textTransform: 'uppercase', marginBottom: 24 }}>
          Energy<br/>Unlocked
        </h1>
        <p style={{ fontSize: 16, color: '#cfcfcf', maxWidth: 440, marginBottom: 32 }}>Order your Pro V now for free two-day shipping.</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onShopClick} style={{ background: '#fff', color: '#000', border: '1px solid #fff', padding: '16px 32px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2 }}>Shop Pro V</button>
          <button style={{ background: 'transparent', color: '#fff', border: '1px solid #fff', padding: '16px 32px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2 }}>Explore</button>
        </div>
      </div>
    </section>
  );
}
window.Hero = Hero;
