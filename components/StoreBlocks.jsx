import Link from 'next/link';

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
  if (block.type === 'hero') {
    const { heading, subtext, imageUrl, buttonLabel, buttonUrl } = block.content;
    return (
      <div className="container block-section hero-block">
        {imageUrl && <img src={imageUrl} alt="" className="hero-image" />}
        {heading && <h2>{heading}</h2>}
        {subtext && <p>{subtext}</p>}
        {buttonLabel && buttonUrl && (
          <a href={buttonUrl} className="btn btn-primary">{buttonLabel}</a>
        )}
      </div>
    );
  }
  if (block.type === 'button') {
    if (!block.content.label || !block.content.url) return null;
    return (
      <div className="container block-section" style={{ textAlign: 'center' }}>
        <a href={block.content.url} className="btn btn-primary">{block.content.label}</a>
      </div>
    );
  }
  if (block.type === 'gallery') {
    const images = block.content.images || [];
    if (images.length === 0) return null;
    return (
      <div className="container block-section">
        <div className="gallery-grid">
          {images.map((img, i) => (
            <img key={i} src={img.url} alt={img.alt || ''} />
          ))}
        </div>
      </div>
    );
  }
  if (block.type === 'features') {
    const items = block.content.items || [];
    if (items.length === 0) return null;
    return (
      <div className="container block-section">
        <div className="features-grid">
          {items.map((item, i) => (
            <div key={i} className="feature-item">
              {item.icon && <div className="feature-icon">{item.icon}</div>}
              <h3>{item.title}</h3>
              {item.text && <p>{item.text}</p>}
            </div>
          ))}
        </div>
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

export function StorefrontNav({ shopSlug, pages, currentPageId }) {
  if (!pages || pages.length <= 1) return null;
  return (
    <nav className="storefront-nav container">
      {pages.map((page) => (
        <Link
          key={page.id}
          href={page.is_home ? `/s/${shopSlug}` : `/s/${shopSlug}/${page.slug}`}
          className={page.id === currentPageId ? 'storefront-nav-link active' : 'storefront-nav-link'}
        >
          {page.title}
        </Link>
      ))}
    </nav>
  );
}

export function StorefrontBody({ shopName, tagline, shopSlug, pages, currentPageId, blocks, products }) {
  return (
    <>
      <div className="storefront-header container">
        <h1>{shopName}</h1>
        {tagline && <p>{tagline}</p>}
      </div>

      <StorefrontNav shopSlug={shopSlug} pages={pages} currentPageId={currentPageId} />

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
