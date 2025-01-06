import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

const protectedRoutes = ["/academia", "/courses", "/wrapped", "/auth/oauth"];
const home = ["/"];
const MAINTENANCE = false;

const isAuthenticated = (request: NextRequest): boolean => {
  const token = request.cookies.get("key");

  return !!token;
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (MAINTENANCE && pathname !== "/maintenance") {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  } else if (!MAINTENANCE && pathname === "/maintenance") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAuthenticated(request) && home.includes(pathname)) {
    return NextResponse.redirect(new URL("/academia", request.url));
  } else if (!isAuthenticated(request) && home.includes(pathname)) {
    return NextResponse.redirect(new URL("/home", request.url));
  }
  if (protectedRoutes.includes(pathname) && !isAuthenticated(request)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
