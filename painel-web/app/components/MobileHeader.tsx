import styles from './MobileHeader.module.css';

export default function MobileHeader() {
  return (
    <header className={styles.header} aria-label="Cabeçalho mobile">
      <div className={styles.brand}>
        <div className={styles.brandIcon} aria-hidden="true">
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-on-primary)' }}>
            auto_awesome
          </span>
        </div>
        <span className={styles.brandName}>Hubon</span>
      </div>

      <label htmlFor="sidebar-toggle" className={styles.menuBtn} aria-label="Abrir menu">
        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>menu</span>
      </label>
    </header>
  );
}
