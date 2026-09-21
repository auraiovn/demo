import { NavLink } from 'react-router-dom';
import styles from './CommerceHeader.module.css';

export function CommerceHeader() {
  return (
    <header className={styles.header}>
      <NavLink className={styles.logo ?? ''} to="/category/all-products" aria-label="AURA shop home">
        AURA
      </NavLink>
      <nav className={styles.nav} aria-label="Shop navigation">
        <NavLink to="/category/all-products">SHOP</NavLink>
        <a href="#fit-guidance">FIND YOUR FIT</a>
        <span className={styles.liveLink}>LIVE TRY ON</span>
      </nav>
      <button type="button" className={styles.bagButton} aria-label="Open shopping bag">
        BAG <span aria-hidden="true">0</span>
      </button>
    </header>
  );
}
