// ProductGrid.jsx — "PRO PADDLE SERIES" tabbed section
function ProductGrid({ products, onProductClick }) {
  const [tab, setTab] = React.useState('Pro V');
  const tabs = ['Pro V', 'Pro IV', '3S'];
  return (
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 32px' }}>
      <h2 style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 48, letterSpacing: '-0.02em', textTransform: 'uppercase', marginBottom: 32, lineHeight: 1 }}>Pro Paddle Series</h2>
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e5e5e5', marginBottom: 40 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
                  style={{ background: 'transparent', border: 'none', padding: '14px 24px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer',
                           color: tab === t ? '#000' : '#9a9a9a',
                           borderBottom: tab === t ? '2px solid #000' : '2px solid transparent',
                           marginBottom: -1 }}>{t}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        {products.map(p => <ProductCard key={p.id} p={p} onClick={onProductClick} />)}
      </div>
    </section>
  );
}
window.ProductGrid = ProductGrid;
