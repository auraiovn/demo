import { Link } from 'react-router-dom';
import type { Product } from '../types/product';
import { formatVnd, toVtoSelection } from '../types/product';
import { useVirtualTryOn } from './VirtualTryOn/VirtualTryOnContext';
import styles from './ProductCard.module.css';

export function ProductCard({ product }: { readonly product: Product }) {
  const { openVirtualTryOn } = useVirtualTryOn();

  return (
    <article className={styles.card}>
      <Link
        className={styles.imageLink}
        to={`/product/${product.id}`}
        aria-label={`View ${product.name}`}
      >
        <img src={product.image} alt={product.name} />
      </Link>
      <div className={styles.body}>
        <Link className={styles.name} to={`/product/${product.id}`}>
          {product.name}
        </Link>
        <div className={styles.metaRow}>
          <div>
            <p className={styles.collection}>{product.collection}</p>
            <div className={styles.swatches} aria-label="Available colours">
              {product.variants.length > 0 ? (
                product.variants.map((variant) => (
                  <span
                    key={variant.colour}
                    className={styles.swatch}
                    style={{ backgroundColor: variant.swatch }}
                    title={variant.colour}
                  />
                ))
              ) : (
                <span className={styles.swatch} style={{ backgroundColor: '#ef651f' }} />
              )}
            </div>
          </div>
          <p className={styles.price}>{formatVnd(product.price)}</p>
          {product.virtualTryOnEnabled ? (
            <button
              type="button"
              className={styles.tryButton}
              onClick={(event) =>
                openVirtualTryOn(
                  toVtoSelection(product),
                  event.currentTarget,
                )
              }
              aria-label={`Try ${product.name} live`}
            >
              TRY IT LIVE
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
