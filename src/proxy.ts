import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

const publicRoutes = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const isPublic =
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith("/api/auth");

  if (!session?.user && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session?.user && publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
