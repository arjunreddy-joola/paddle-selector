// Footer.jsx — dark footer with column links
function Footer() {
  const cols = [
    { title: 'Pickleball', links: ['Pro V', 'Pro IV', '3S', 'Gen 1', 'All paddles'] },
    { title: 'Table Tennis', links: ['Tables', 'Rackets', 'Blades', 'Rubbers', 'Robots'] },
    { title: 'Support', links: ['Contact', 'Authorized Retailers', 'Returns', 'Warranty'] },
    { title: 'Company', links: ['About', 'Athletes', 'Press', 'Careers'] },
  ];
  return (
    <footer style={{ background: '#000', color: '#fff', padding: '80px 32px 32px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 48, marginBottom: 64 }}>
          <div>
            <img src="../../assets/logos/joola-lockup-white.svg" style={{ height: 36, marginBottom: 20 }} />
            <p style={{ fontSize: 13, color: '#cfcfcf', maxWidth: 280, lineHeight: 1.5 }}>Racket sports, engineered for energy. Since 1952.</p>
          </div>
          {cols.map(c => (
            <div key={c.title}>
              <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>{c.title}</div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {c.links.map(l => <li key={l} style={{ fontSize: 13, color: '#cfcfcf', cursor: 'pointer' }}>{l}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #3a3a3a', paddingTop: 24, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b6b6b' }}>
          <span>© 2026 JOOLA USA. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 14 }}>
            <i data-lucide="instagram" style={{ width: 18, height: 18 }}></i>
            <i data-lucide="facebook" style={{ width: 18, height: 18 }}></i>
            <i data-lucide="youtube" style={{ width: 18, height: 18 }}></i>
          </div>
        </div>
      </div>
    </footer>
  );
}
window.Footer = Footer;
