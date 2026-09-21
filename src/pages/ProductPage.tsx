import { useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { findProduct } from '../data/products';
import { formatVnd, toVtoSelection } from '../types/product';
import { useVirtualTryOn } from '../components/VirtualTryOn/VirtualTryOnContext';
import styles from './CommercePages.module.css';

export function ProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const product = findProduct(productId);
  const { openVirtualTryOn } = useVirtualTryOn();
  const [selectedColour, setSelectedColour] = useState(product?.variants[0]?.colour ?? '');
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] ?? '');
  const [bagStatus, setBagStatus] = useState('');

  const gallery = useMemo(
    () => product?.gallery.slice(0, 4) ?? [],
    [product],
  );

  if (!product) {
    return <Navigate replace to="/product/stone-open-collar-set" />;
  }

  return (
    <main className={styles.productPage}>
      <section className={styles.gallery} aria-label={`${product.name} gallery`}>
        {gallery.map((image, index) => (
          <figure key={`${image}-${index}`} className={styles.galleryItem}>
            <img src={image} alt={`${product.name} view ${index + 1}`} />
          </figure>
        ))}
      </section>

      <section className={styles.productDetails}>
        <p className={styles.productEyebrow}>AURA PRODUCT</p>
        <h1>{product.name}</h1>
        <p className={styles.productPrice}>{formatVnd(product.price)}</p>
        <p className={styles.rating}>{product.rating} / 5 · Early customer feedback</p>
        <p className={styles.description}>{product.description}</p>
        <p className={styles.stock}>
          <span aria-hidden="true" /> {product.stock} pieces in stock
        </p>

        {product.variants.length > 0 ? (
          <fieldset className={styles.optionGroup}>
            <legend>Colour</legend>
            <div className={styles.optionRow}>
              {product.variants.map((variant) => (
                <button
                  key={variant.colour}
                  type="button"
                  className={variant.colour === selectedColour ? styles.selectedOption : undefined}
                  onClick={() => setSelectedColour(variant.colour)}
                  aria-pressed={variant.colour === selectedColour}
                >
                  {variant.colour}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        <fieldset className={styles.optionGroup}>
          <legend>Size</legend>
          <div className={styles.sizeRow}>
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                className={size === selectedSize ? styles.selectedOption : undefined}
                onClick={() => setSelectedSize(size)}
                aria-pressed={size === selectedSize}
              >
                {size}
              </button>
            ))}
          </div>
        </fieldset>

        <button
          type="button"
          className={styles.addToBag}
          onClick={() => {
            setBagStatus(`${product.name} added to your bag.`);
            window.setTimeout(() => setBagStatus(''), 2500);
          }}
        >
          ADD TO BAG
        </button>
        <p className={styles.visuallyHidden} role="status" aria-live="polite">
          {bagStatus}
        </p>

        <div className={styles.secondaryActions}>
          {product.virtualTryOnEnabled ? (
            <button
              type="button"
              className={styles.productTryButton}
              onClick={(event) =>
                openVirtualTryOn(
                  toVtoSelection(product, selectedColour, selectedSize),
                  event.currentTarget,
                )
              }
            >
              TRY IT LIVE
            </button>
          ) : null}
          <button type="button" className={styles.deliveryButton}>
            DELIVERY INFO
          </button>
        </div>

        <p className={styles.tryOnNote}>
          Live Try On helps compare proportion and colour. It does not replace garment measurements.
        </p>

        <details id="fit-guidance" className={styles.fitGuidance} open>
          <summary>Fit guidance</summary>
          <p>
            Relaxed fit. The knit sits close at the shoulder with room through the body and a straight trouser line.
          </p>
        </details>
      </section>
    </main>
  );
}
