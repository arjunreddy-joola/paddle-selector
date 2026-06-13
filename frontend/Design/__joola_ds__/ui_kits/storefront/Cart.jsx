// Cart.jsx — simple cart view
function Cart({ items, onBack, onRemove }) {
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  return (
    <section style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 96px' }}>
      <h1 style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 48, textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: 32 }}>Your Cart</h1>
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#6b6b6b' }}>
          <p style={{ marginBottom: 24 }}>Your cart is empty.</p>
          <button onClick={onBack} style={{ background: '#000', color: '#fff', border: 'none', padding: '14px 28px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Shop Paddles</button>
        </div>
      ) : (
        <>
          {items.map((it, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto auto', gap: 20, alignItems: 'center', padding: '20px 0', borderBottom: '1px solid #e5e5e5' }}>
              <img src={it.image} style={{ width: 80, height: 80, objectFit: 'contain', background: '#fafafa' }} />
              <div>
                <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 15 }}>{it.name}</div>
                <div style={{ fontSize: 12, color: '#6b6b6b', marginTop: 4 }}>{it.size} · {it.color} · Qty {it.qty}</div>
              </div>
              <div style={{ fontWeight: 600 }}>${(it.price * it.qty).toFixed(2)}</div>
              <button onClick={() => onRemove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b6b', fontSize: 12, textDecoration: 'underline' }}>Remove</button>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32, gap: 40, alignItems: 'center' }}>
            <div style={{ fontSize: 14, color: '#6b6b6b' }}>Subtotal</div>
            <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 32 }}>${subtotal.toFixed(2)}</div>
          </div>
          <button style={{ width: '100%', marginTop: 24, background: '#000', color: '#fff', border: 'none', padding: '18px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Checkout</button>
        </>
      )}
    </section>
  );
}
window.Cart = Cart;
