// Routes rendered by the public marketing shell (src/app/(public)) instead of
// the dashboard shell. AppLayout uses this to skip the sidebar and header.
// "/" is the landing page; the admin dashboard lives at "/dashboard".
export const PUBLIC_ROUTES = ["/features", "/pricing", "/about", "/contact", "/privacy", "/terms"];

// Auth screens render full-bleed without the dashboard shell too.
export const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];

export const isPublicRoute = (pathname = "") =>
  pathname === "/" ||
  PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

export const isAuthRoute = (pathname = "") => AUTH_ROUTES.includes(pathname);
