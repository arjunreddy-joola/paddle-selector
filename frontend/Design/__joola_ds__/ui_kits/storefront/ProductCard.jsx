// ProductCard.jsx — single tile used in grids
function ProductCard({ p, onClick }) {
  return (
    <div onClick={() => onClick(p)} style={{ border: '1px solid #e5e5e5', background: '#fff', position: 'relative', cursor: 'pointer', transition: 'border-color 120ms' }}
         onMouseOver={e => e.currentTarget.style.borderColor = '#000'}
         onMouseOut={e => e.currentTarget.style.borderColor = '#e5e5e5'}>
      {p.isNew && <div style={{ position: 'absolute', top: 12, left: 12, background: '#000', color: '#fff', padding: '5px 12px', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', zIndex: 2 }}>NEW</div>}
      <div style={{ aspectRatio: '1', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <img src={p.image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
      <div style={{ padding: '16px 18px 20px', borderTop: '1px solid #f4f4f4' }}>
        <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 15, lineHeight: 1.2, marginBottom: 6 }}>{p.name}</div>
        <div style={{ fontSize: 14, color: '#000', fontWeight: 600, marginBottom: 12 }}>${p.price.toFixed(2)}</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {p.colors.map((c, i) => (
            <div key={i} title={c.name} style={{ width: 20, height: 20, background: c.hex, border: '1px solid #e5e5e5', cursor: 'pointer' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
window.ProductCard = ProductCard;
