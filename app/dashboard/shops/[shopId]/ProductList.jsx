'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function formatPrice(cents) {
  return (cents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

export default function ProductList({ shopId, initialProducts }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  async function handleDelete(productId) {
    setDeletingId(productId);
    try {
      const res = await fetch(`/api/shops/${shopId}/products/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  }

  if (products.length === 0) {
    return <div className="empty-state">Noch keine Produkte. Füge unten dein erstes Produkt hinzu.</div>;
  }

  return (
    <div className="product-list">
      {products.map((product) => (
        <div key={product.id} className="product-row">
          <div>
            <strong>{product.name}</strong>
            {product.description && (
              <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>{product.description}</p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span className="price">{formatPrice(product.price_cents)}</span>
            <button
              className="btn btn-danger"
              onClick={() => handleDelete(product.id)}
              disabled={deletingId === product.id}
            >
              Löschen
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
