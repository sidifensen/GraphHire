"use client";

import Link from "next/link";
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
} from "next/navigation";
import type { ComponentProps, ReactNode } from "react";
import { mapMobilePathToEnterprisePath } from "@/lib/device-routing";

type LinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  to: string;
  children: ReactNode;
};

type NavLinkProps = {
  to: string;
  className?: string | ((state: { isActive: boolean }) => string);
  children: ReactNode | ((state: { isActive: boolean }) => ReactNode);
};

function toPublicEnterprisePath(pathname: string): string {
  return mapMobilePathToEnterprisePath(pathname);
}

export function useNavigate() {
  const router = useRouter();

  return (to: string | number) => {
    if (typeof to === "number") {
      if (to < 0) {
        router.back();
      }
      return;
    }

    router.push(toPublicEnterprisePath(to));
  };
}

export function useLocation() {
  const pathname = usePathname();
  return { pathname: toPublicEnterprisePath(pathname) };
}

export function useParams() {
  return useNextParams<Record<string, string>>();
}

export function LinkRouter({ to, children, ...rest }: LinkProps) {
  return (
    <Link href={toPublicEnterprisePath(to)} {...rest}>
      {children}
    </Link>
  );
}

export function NavLink({ to, className, children }: NavLinkProps) {
  const pathname = toPublicEnterprisePath(usePathname());
  const targetPathname = toPublicEnterprisePath(to);
  const isActive = pathname === targetPathname;
  const resolvedClassName =
    typeof className === "function" ? className({ isActive }) : className;

  return (
    <Link href={targetPathname} className={resolvedClassName}>
      {typeof children === "function" ? children({ isActive }) : children}
    </Link>
  );
}

export { LinkRouter as Link };
