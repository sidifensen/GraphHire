'use client';

import Link from 'next/link';
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
} from 'next/navigation';
import type { ComponentProps, MouseEventHandler, PropsWithChildren, ReactNode } from 'react';

type ToValue = string;

type NavState = {
  isActive: boolean;
};

type LinkProps = PropsWithChildren<{
  to: ToValue;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}>;

type NavLinkProps = PropsWithChildren<{
  to: ToValue;
  className?: string | ((state: NavState) => string);
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}>;

function normalizePathname(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function mapPublicPathToPrototypePath(pathname: string) {
  const normalized = normalizePathname(pathname);

  if (normalized === '/resume/manage' || normalized === '/resume/upload') {
    return '/resume';
  }

  if (normalized === '/skill-graph') {
    return '/graph';
  }

  if (normalized === '/enterprise/dashboard') {
    return '/';
  }

  if (normalized === '/enterprise/jobs/new') {
    return '/jobs/create';
  }

  if (normalized.startsWith('/enterprise/jobs/')) {
    return normalized.replace('/enterprise', '');
  }

  if (normalized === '/enterprise/jobs') {
    return '/jobs';
  }

  if (normalized === '/enterprise/recommendations') {
    return '/recommendations';
  }

  if (normalized === '/enterprise/employees') {
    return '/team';
  }

  if (normalized === '/enterprise/notifications') {
    return '/messages';
  }

  if (normalized.startsWith('/enterprise/candidates/')) {
    return normalized.replace('/enterprise/candidates/', '/candidate/');
  }

  return normalized;
}

function mapPrototypePathToPublicPath(to: string, currentPathname: string) {
  const normalizedTo = normalizePathname(to);
  const current = normalizePathname(currentPathname);
  const inEnterprise = current.startsWith('/enterprise');

  if (!inEnterprise) {
    if (normalizedTo === '/resume') {
      return '/resume/manage';
    }
    if (normalizedTo === '/graph') {
      return '/skill-graph';
    }
    return normalizedTo;
  }

  if (normalizedTo === '/') {
    return '/enterprise/dashboard';
  }
  if (normalizedTo === '/jobs') {
    return '/enterprise/jobs';
  }
  if (normalizedTo === '/jobs/create') {
    return '/enterprise/jobs/new';
  }
  if (normalizedTo === '/recommendations') {
    return '/enterprise/recommendations';
  }
  if (normalizedTo === '/team') {
    return '/enterprise/employees';
  }
  if (normalizedTo === '/messages') {
    return '/enterprise/notifications';
  }
  if (normalizedTo.startsWith('/candidate/')) {
    return normalizedTo.replace('/candidate/', '/enterprise/candidates/');
  }
  if (normalizedTo.startsWith('/jobs/')) {
    return `/enterprise${normalizedTo}`;
  }
  if (normalizedTo === '/interviews' || normalizedTo === '/talent' || normalizedTo === '/analytics') {
    return '/enterprise/dashboard';
  }
  return normalizedTo;
}

function isHashLink(to: string) {
  return to.startsWith('#');
}

function isExternalLink(to: string) {
  return /^https?:\/\//.test(to);
}

export function BrowserRouter({ children }: PropsWithChildren) {
  return <>{children}</>;
}

export const Router = BrowserRouter;

export function Routes({ children }: PropsWithChildren) {
  return <>{children}</>;
}

export function Route({ element }: { element?: ReactNode }) {
  return <>{element ?? null}</>;
}

export function Outlet() {
  return null;
}

export function LinkShim({ to, className, children, onClick }: LinkProps) {
  const pathname = usePathname() ?? '/';
  if (isHashLink(to) || isExternalLink(to)) {
    return (
      <a href={to} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <Link href={mapPrototypePathToPublicPath(to, pathname)} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

export { LinkShim as Link };

export function NavLink({ to, className, children, onClick }: NavLinkProps) {
  const currentPathname = usePathname() ?? '/';
  const pathname = normalizePathname(mapPublicPathToPrototypePath(currentPathname));
  const href = normalizePathname(to);
  const isActive = href === '/'
    ? pathname === '/'
    : pathname === href || pathname.startsWith(`${href}/`);
  const resolvedClassName =
    typeof className === 'function' ? className({ isActive }) : className;

  return (
    <LinkShim to={to} className={resolvedClassName} onClick={onClick}>
      {typeof children === 'function' ? (children as (state: NavState) => ReactNode)({ isActive }) : children}
    </LinkShim>
  );
}

export function useNavigate() {
  const router = useRouter();
  const pathname = usePathname() ?? '/';
  return (to: number | string) => {
    if (typeof to === 'number') {
      if (to < 0) {
        router.back();
      }
      return;
    }
    router.push(mapPrototypePathToPublicPath(to, pathname));
  };
}

export function useLocation() {
  const pathname = mapPublicPathToPrototypePath(usePathname() ?? '/');
  const search = typeof window !== 'undefined' ? window.location.search : '';
  return {
    pathname,
    search,
    hash: '',
    state: null,
    key: pathname,
  };
}

export function useParams<T extends Record<string, string | undefined>>() {
  return useNextParams<T>();
}

export function useSearchParams() {
  const search = typeof window !== 'undefined' ? window.location.search : '';
  return [new URLSearchParams(search), () => undefined] as const;
}

export type NavigateFunction = ReturnType<typeof useNavigate>;
export type LinkComponentProps = ComponentProps<typeof LinkShim>;
