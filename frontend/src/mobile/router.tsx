"use client";

import Link from "next/link";
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
} from "next/navigation";
import type { ComponentProps, ReactNode } from "react";

type LinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  to: string;
  children: ReactNode;
};

type NavLinkProps = {
  to: string;
  className?: string | ((state: { isActive: boolean }) => string);
  children: ReactNode | ((state: { isActive: boolean }) => ReactNode);
};

export function useNavigate() {
  const router = useRouter();

  return (to: string | number) => {
    if (typeof to === "number") {
      if (to < 0) {
        router.back();
      }
      return;
    }

    router.push(to);
  };
}

export function useLocation() {
  const pathname = usePathname();
  return { pathname };
}

export function useParams() {
  return useNextParams<Record<string, string>>();
}

export function LinkRouter({ to, children, ...rest }: LinkProps) {
  return (
    <Link href={to} {...rest}>
      {children}
    </Link>
  );
}

export function NavLink({ to, className, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === to;
  const resolvedClassName =
    typeof className === "function" ? className({ isActive }) : className;

  return (
    <Link href={to} className={resolvedClassName}>
      {typeof children === "function" ? children({ isActive }) : children}
    </Link>
  );
}

export { LinkRouter as Link };
