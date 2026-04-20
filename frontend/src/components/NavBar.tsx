'use client';

import Image from 'next/image';

const navLinks = [
  { label: '首页', href: '#', active: true },
  { label: '职位', href: '#', active: false },
  { label: '公司', href: '#', active: false },
  { label: '能力图谱', href: '#', active: false },
];

export default function NavBar() {
  return (
    <nav className="bg-surface sticky top-0 z-50 shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.05)]">
      <div className="max-w-[1440px] mx-auto px-8 py-4 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-12">
          <div className="text-2xl font-black tracking-tighter text-primary font-headline">
            图谱智聘
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 font-headline antialiased tracking-tight text-sm">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`
                  pb-1 border-b-2 transition-all duration-300
                  ${link.active
                    ? 'text-primary border-primary font-bold'
                    : 'text-tertiary border-transparent hover:text-primary hover:border-primary/30'
                  }
                `}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Trailing Actions */}
        <div className="flex items-center gap-6">
          <button className="text-primary hover:bg-blue-50/50 p-2 rounded-full transition-all duration-300 active:scale-95 opacity-80">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="text-primary hover:bg-blue-50/50 p-2 rounded-full transition-all duration-300 active:scale-95 opacity-80">
            <span className="material-symbols-outlined">chat_bubble</span>
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high ml-2 cursor-pointer hover:ring-2 ring-primary-fixed transition-all">
            <Image
              alt="用户头像"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1pg2_T8-Yp2oXmIyqc_sGB_1ggd-DCbwqxVaK6W0_6D5WDMd5S0DxP8LHu6HZWV125g4zPSfZuaPIWOxZjuCEju-l2ZuSFw6yqd-hd8oxJeKi7wdOuAdC7HX4bX7Xa0Pb13ud7y0p-kLmXOilasdKlhKK4fC0z5jUTa2QK76m_46iKC2zqjipV5V4KLre7sCcdbxSVNRlU4vNmZkUYb2wcj40jphx3lcTym7Mz6Qin9mr7Iq7aaGDCQkvJlQJPKCcck3dBdrY7sb8"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
