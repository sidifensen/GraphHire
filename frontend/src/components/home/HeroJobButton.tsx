import Link from 'next/link';

interface HeroJobButtonProps {
  href: string;
  text?: string;
}

export default function HeroJobButton({ href, text = "Let's get started" }: HeroJobButtonProps) {
  return (
    <div className="relative group">
      <Link
        href={href}
        className="relative inline-block rounded-xl bg-gray-800 p-px font-semibold leading-6 text-white shadow-2xl shadow-zinc-900 transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95"
      >
        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 p-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="relative z-10 block rounded-xl bg-gray-950 px-6 py-3">
          <span className="relative z-10 flex items-center space-x-2">
            <span className="transition-all duration-500 group-hover:translate-x-1">{text}</span>
            <svg
              className="h-6 w-6 transition-transform duration-500 group-hover:translate-x-1"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                fillRule="evenodd"
              />
            </svg>
          </span>
        </span>
      </Link>
    </div>
  );
}
