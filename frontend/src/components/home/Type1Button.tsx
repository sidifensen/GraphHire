import Link from 'next/link';
import styles from './Type1Button.module.css';

interface Type1ButtonProps {
  href: string;
  text: string;
}

export default function Type1Button({ href, text }: Type1ButtonProps) {
  return (
    <Link href={href} className={styles.button}>
      <span className={styles.btnTxt}>{text}</span>
    </Link>
  );
}

