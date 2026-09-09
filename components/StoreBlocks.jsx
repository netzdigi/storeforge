export function formatPrice(cents) {
  return (cents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

export function ProductGrid({ products }) {
  if (products.length === 0) {
    return <div className="empty-state">Dieser Shop hat noch keine Produkte.</div>;
  }
  return (
    <div className="product-grid">
      {products.map((product) => (
        <div key={product.id} className="product-card">
          {product.image_url && <img src={product.image_url} alt={product.name} />}
          <div className="product-body">
            <h3>{product.name}</h3>
            {product.description && <p>{product.description}</p>}
            <div className="price">{formatPrice(product.price_cents)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function StoreBlock({ block, products }) {
  if (block.type === 'heading') {
    return (
      <div className="container block-section">
        <h2>{block.content.text}</h2>
      </div>
    );
  }
  if (block.type === 'text') {
    return (
      <div className="container block-section">
        <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted)' }}>{block.content.text}</p>
      </div>
    );
  }
  if (block.type === 'image') {
    return (
      <div className="container block-section">
        {block.content.url && (
          <img
            src={block.content.url}
            alt={block.content.alt || ''}
            style={{ maxWidth: '100%', borderRadius: 'var(--radius)' }}
          />
        )}
      </div>
    );
  }
  if (block.type === 'products') {
    return (
      <div className="container">
        <ProductGrid products={products} />
      </div>
    );
  }
  return null;
}

export function StorefrontBody({ shopName, tagline, blocks, products }) {
  return (
    <>
      <div className="storefront-header container">
        <h1>{shopName}</h1>
        {tagline && <p>{tagline}</p>}
      </div>

      {blocks.length === 0 ? (
        <div className="container">
          <ProductGrid products={products} />
        </div>
      ) : (
        blocks.map((block) => <StoreBlock key={block.id} block={block} products={products} />)
      )}

      <footer className="footer">Powered by Storeforge</footer>
    </>
  );
}
