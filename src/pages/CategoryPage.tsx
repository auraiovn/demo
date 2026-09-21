import { useMemo, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { categoryLabels, isProductCategory, productsForCategory } from '../data/products';
import type { ProductCategory } from '../types/product';
import { ProductCard } from '../components/ProductCard';
import styles from './CommercePages.module.css';

type SortValue = 'featured' | 'price-ascending' | 'price-descending';

const categoryOrder: readonly ProductCategory[] = [
  'all-products',
  'clothing',
  'tailoring',
  'accessories',
];

export function CategoryPage() {
  const params = useParams<{ category?: string }>();
  const category: ProductCategory = isProductCategory(params.category)
    ? params.category
    : 'all-products';
  const [sort, setSort] = useState<SortValue>('featured');

  const visibleProducts = useMemo(() => {
    const source = [...productsForCategory(category)];
    if (sort === 'price-ascending') {
      return source.sort((first, second) => first.price - second.price);
    }
    if (sort === 'price-descending') {
      return source.sort((first, second) => second.price - first.price);
    }
    return source;
  }, [category, sort]);

  return (
    <main className={styles.categoryPage}>
      <nav className={styles.categoryTabs} aria-label="Product categories">
        {categoryOrder.map((item) => (
          <NavLink
            key={item}
            to={`/category/${item}`}
            className={item === category ? (styles.activeCategory ?? '') : ''}
          >
            {categoryLabels[item]}
          </NavLink>
        ))}
      </nav>

      <div className={styles.categoryToolbar}>
        <p>{visibleProducts.length} products</p>
        <label className={styles.sortControl}>
          <span className={styles.visuallyHidden}>Sort products</span>
          <select value={sort} onChange={(event) => setSort(event.currentTarget.value as SortValue)}>
            <option value="featured">Featured</option>
            <option value="price-ascending">Price: low to high</option>
            <option value="price-descending">Price: high to low</option>
          </select>
        </label>
      </div>

      <section className={styles.productGrid} aria-label={`${categoryLabels[category]} products`}>
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </main>
  );
}
