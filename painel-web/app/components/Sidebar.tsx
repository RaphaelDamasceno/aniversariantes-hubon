"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', href: '/' },
  { icon: 'calendar_month', label: 'Calendário', href: '/calendario' },
  { icon: 'mail', label: 'E-mail', href: '/#email-settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Checkbox toggle (pure CSS mobile drawer) */}
      <input type="checkbox" id="sidebar-toggle" className={styles.toggleInput} aria-label="Toggle menu" />

      <aside className={styles.sidebar} aria-label="Menu principal">
        {/* Logo */}
        <div className={styles.logoArea}>
          <div className={styles.logoIcon} aria-hidden="true">
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-on-primary)' }}>
              auto_awesome
            </span>
          </div>
          <span className={styles.logoLabel}>Aniversariantes</span>
        </div>

        {/* Nav */}
        <nav className={styles.nav} aria-label="Navegação principal">
          {navItems.map((item) => {
            // Check if current item is active
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }} aria-hidden="true">
                  {item.icon}
                </span>
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={styles.sidebarFooter}>
          <div className={styles.footerBadge}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">
              verified
            </span>
            <span>Hubon © 2026</span>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      <label htmlFor="sidebar-toggle" className={styles.overlay} aria-hidden="true" />
    </>
  );
}
