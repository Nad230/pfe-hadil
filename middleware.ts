import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: Request) {
  const url = new URL(request.url);
  const isAuthPage = url.pathname.startsWith("/auth");

  // Define pages that should be accessible without authentication
  const exceptionPages = ["/", "/forgotpassword"];
  const isExceptionPage = exceptionPages.includes(url.pathname);

  // Allow access to auth-related pages and exceptions without checking the token
  if (isAuthPage || isExceptionPage) {
    return NextResponse.next();
  }

  // Get token from cookies
  const cookieHeader = request.headers.get("cookie");
  const token = cookieHeader?.split(";").find((c) => c.trim().startsWith("token="))?.split("=")[1];

  console.log("Token from cookies:", token);

  if (token) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
      return NextResponse.next();
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }

  // Redirect unauthorized users to login
  return NextResponse.redirect(new URL("/auth", request.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
