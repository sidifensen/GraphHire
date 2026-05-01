'use client';

import styles from './loading-text-loader.module.css';

type LoadingTextLoaderProps = {
  className?: string;
  label?: string;
};

export default function LoadingTextLoader({ className, label = 'Loading' }: LoadingTextLoaderProps) {
  const mergedClassName = className ? `${styles.loader} ${className}` : styles.loader;

  return (
    <div className={mergedClassName} role="status" aria-label={label} aria-live="polite">
      {Array.from({ length: 9 }).map((_, index) => (
        <div key={index} className={styles.text}>
          <span>{label}</span>
        </div>
      ))}
      <div className={styles.line} />
    </div>
  );
}
