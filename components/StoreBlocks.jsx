import Link from 'next/link';
import ContactFormBlock from './ContactFormBlock';
import NewsletterBlock from './NewsletterBlock';
import CountdownBlock from './CountdownBlock';
import BeforeAfterBlock from './BeforeAfterBlock';
import StickyCtaBlock from './StickyCtaBlock';
import OrderButton from './OrderButton';

export function formatPrice(cents) {
  return (cents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

export function ProductGrid({ products, shopId }) {
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
            <OrderButton shopId={shopId} productId={product.id} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StoreBlock({ block, products, shopId }) {
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
  if (block.type === 'countdown') {
    return <CountdownBlock {...block.content} />;
  }
  if (block.type === 'stats') {
    const items = block.content.items || [];
    if (items.length === 0) return null;
    return (
      <div className="container block-section">
        <div className="stats-grid">
          {items.map((item, i) => (
            <div key={i} className="stat-item">
              <div className="stat-value">{item.value}</div>
              <div className="stat-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (block.type === 'pricing') {
    const plans = block.content.plans || [];
    if (plans.length === 0) return null;
    return (
      <div className="container block-section">
        <div className="pricing-grid">
          {plans.map((plan, i) => (
            <div key={i} className={plan.highlighted ? 'pricing-card highlighted' : 'pricing-card'}>
              {plan.highlighted && <div className="pricing-badge">Beliebt</div>}
              <h3>{plan.name}</h3>
              <div className="pricing-price">
                {plan.price}
                {plan.period && <span>{plan.period}</span>}
              </div>
              <ul className="pricing-features">
                {(plan.features || '')
                  .split('\n')
                  .map((f) => f.trim())
                  .filter(Boolean)
                  .map((f, j) => <li key={j}>{f}</li>)}
              </ul>
              {plan.buttonLabel && plan.buttonUrl && (
                <a href={plan.buttonUrl} className="btn btn-primary" style={{ width: '100%' }}>{plan.buttonLabel}</a>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (block.type === 'before_after') {
    return <BeforeAfterBlock {...block.content} />;
  }
  if (block.type === 'sticky_cta') {
    return <StickyCtaBlock {...block.content} />;
  }
  if (block.type === 'testimonials') {
    const items = block.content.items || [];
    if (items.length === 0) return null;
    return (
      <div className="container block-section">
        <div className="testimonial-grid">
          {items.map((item, i) => (
            <figure key={i} className="testimonial-card">
              <blockquote>&ldquo;{item.quote}&rdquo;</blockquote>
              <figcaption>
                <strong>{item.author}</strong>
                {item.role && <span> — {item.role}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    );
  }
  if (block.type === 'faq') {
    const items = block.content.items || [];
    if (items.length === 0) return null;
    return (
      <div className="container block-section">
        <div className="faq-list">
          {items.map((item, i) => (
            <details key={i} className="faq-item">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    );
  }
  if (block.type === 'social') {
    const links = (block.content.links || []).filter((l) => l.platform && l.url);
    if (links.length === 0) return null;
    return (
      <div className="container block-section">
        <div className="social-links">
          {links.map((link, i) => (
            <a key={i} href={link.url} className="social-link" target="_blank" rel="noopener noreferrer">
              {link.platform}
            </a>
          ))}
        </div>
      </div>
    );
  }
  if (block.type === 'contact') {
    return <ContactFormBlock shopId={shopId} heading={block.content.heading} buttonLabel={block.content.buttonLabel} />;
  }
  if (block.type === 'newsletter') {
    return <NewsletterBlock shopId={shopId} heading={block.content.heading} buttonLabel={block.content.buttonLabel} />;
  }
  if (block.type === 'products') {
    return (
      <div className="container">
        <ProductGrid products={products} shopId={shopId} />
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

export function StorefrontBody({ shopId, shopName, tagline, shopSlug, pages, currentPageId, blocks, products }) {
  return (
    <>
      <div className="storefront-header container">
        <h1>{shopName}</h1>
        {tagline && <p>{tagline}</p>}
      </div>

      <StorefrontNav shopSlug={shopSlug} pages={pages} currentPageId={currentPageId} />

      {blocks.length === 0 ? (
        <div className="container">
          <ProductGrid products={products} shopId={shopId} />
        </div>
      ) : (
        blocks.map((block) => <StoreBlock key={block.id} block={block} products={products} shopId={shopId} />)
      )}

      <footer className="footer">Powered by Storeforge</footer>
    </>
  );
}
