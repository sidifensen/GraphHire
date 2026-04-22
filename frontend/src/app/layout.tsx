import type { Metadata } from 'next';
import { Manrope, Inter } from 'next/font/google';
import '@/styles/globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-headline',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GraphHire 图谱智聘 - AI驱动的认知导视招聘系统',
  description: '基于AI智能匹配与能力图谱的招聘平台，精准匹配理想职业节点',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${manrope.variable} ${inter.variable} bg-background text-on-background min-h-screen flex flex-col antialiased selection:bg-primary-fixed selection:text-on-primary-fixed font-body`}>
        {children}
      </body>
    </html>
  );
}
