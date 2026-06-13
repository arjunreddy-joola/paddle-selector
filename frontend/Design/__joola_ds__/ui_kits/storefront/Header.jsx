// Header.jsx — marquee + logo + nav + icons
function Header({ onNavigate, cartCount }) {
  const announcements = [
    'Get free balls with any full-price pro paddle',
    'Just dropped: New pickleball accessories',
    'Order your Pro V now for free two-day shipping',
  ];
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % announcements.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#fff' }}>
      <div style={{ background: '#000', color: '#fff', padding: '8px 0', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'center' }}>
        {announcements[idx]}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 40, padding: '18px 32px', borderBottom: '1px solid #e5e5e5' }}>
        <a onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
          <img src="../../assets/logos/joola-logo-primary.png" style={{ height: 30, display: 'block' }} />
        </a>
        <nav style={{ display: 'flex', gap: 26, fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          <a onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>Pickleball Paddles</a>
          <a>Apparel</a>
          <a>Accessories</a>
          <a>Table Tennis</a>
          <a style={{ color: '#D9232B' }}>New</a>
          <a style={{ color: '#D9232B' }}>Sale</a>
        </nav>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, alignItems: 'center' }}>
          <i data-lucide="search" style={{ width: 20, height: 20 }}></i>
          <i data-lucide="user" style={{ width: 20, height: 20 }}></i>
          <a onClick={() => onNavigate('cart')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <i data-lucide="shopping-bag" style={{ width: 20, height: 20 }}></i>
            <span style={{ fontSize: 12, fontWeight: 600 }}>({cartCount})</span>
          </a>
        </div>
      </div>
    </header>
  );
}
window.Header = Header;
