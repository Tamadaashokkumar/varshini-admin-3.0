import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // కుకీ ఉందో లేదో చూడండి
  const token = request.cookies.get("access_token")?.value;

  // 1. ప్రొటెక్టెడ్ రూట్స్ (Dashboard)
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!token) {
      // టోకెన్ లేకపోతే లాగిన్ కి పంపు
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 2. పబ్లిక్ రూట్స్ (Login)
  if (request.nextUrl.pathname === "/login") {
    if (token) {
      // ఆల్రెడీ లాగిన్ అయి ఉంటే డాష్‌బోర్డ్ కి పంపు
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

// ఏయే పేజీలకు ఈ రూల్స్ వర్తించాలి?
export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
