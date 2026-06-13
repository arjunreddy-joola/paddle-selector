// ProductDetail.jsx — PDP with gallery + buy column
function ProductDetail({ p, onAddToCart, onBack }) {
  const [size, setSize] = React.useState('16mm');
  const [colorIdx, setColorIdx] = React.useState(0);
  const [qty, setQty] = React.useState(1);
  const [added, setAdded] = React.useState(false);

  const handleAdd = () => {
    onAddToCart({ ...p, size, color: p.colors[colorIdx].name, qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 32px 96px' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginBottom: 32, color: '#6b6b6b', display: 'flex', alignItems: 'center', gap: 6 }}>
        <i data-lucide="chevron-left" style={{ width: 14, height: 14 }}></i> Back to all paddles
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>
        <div style={{ background: '#fafafa', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
          <img src={p.image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div>
          {p.isNew && <div style={{ display: 'inline-block', background: '#000', color: '#fff', padding: '5px 12px', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>New</div>}
          <h1 style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 40, lineHeight: 1.05, letterSpacing: '-0.01em', marginBottom: 12 }}>{p.name}</h1>
          <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 28 }}>${p.price.toFixed(2)}</div>
          <p style={{ color: '#3a3a3a', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>{p.description}</p>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Size: {size}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['16mm', '14mm'].map(s => (
                <button key={s} onClick={() => setSize(s)}
                        style={{ padding: '12px 20px', background: size === s ? '#000' : '#fff', color: size === s ? '#fff' : '#000', border: '1px solid #000', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2 }}>{s}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Color: {p.colors[colorIdx].name}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {p.colors.map((c, i) => (
                <button key={i} onClick={() => setColorIdx(i)}
                        style={{ width: 36, height: 36, background: c.hex, border: colorIdx === i ? '2px solid #000' : '1px solid #cfcfcf', cursor: 'pointer', padding: 0, outline: colorIdx === i ? '2px solid #fff' : 'none', outlineOffset: -4 }}/>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ display: 'inline-flex', border: '1px solid #000' }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ padding: '14px 16px', border: 'none', background: '#fff', cursor: 'pointer', fontSize: 16 }}>−</button>
              <div style={{ padding: '14px 20px', borderLeft: '1px solid #000', borderRight: '1px solid #000', fontWeight: 600, minWidth: 48, textAlign: 'center' }}>{qty}</div>
              <button onClick={() => setQty(q => q + 1)} style={{ padding: '14px 16px', border: 'none', background: '#fff', cursor: 'pointer', fontSize: 16 }}>+</button>
            </div>
            <button onClick={handleAdd}
                    style={{ flex: 1, background: added ? '#7CB342' : '#000', color: '#fff', border: `1px solid ${added ? '#7CB342' : '#000'}`, padding: '15px 32px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2, transition: 'all 200ms' }}>
              {added ? 'Added ✓' : 'Add To Cart'}
            </button>
          </div>

          <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: 20, fontSize: 12, color: '#6b6b6b', display: 'flex', gap: 24 }}>
            <span>Free 2-day shipping</span><span>USAPA/UPA approved</span><span>90-day returns</span>
          </div>
        </div>
      </div>
    </section>
  );
}
window.ProductDetail = ProductDetail;
