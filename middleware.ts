import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // కుకీస్ ఉందో లేదో చూడండి
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // 🔥 FIX: రెండింటిలో ఏ ఒక్కటి ఉన్నా యూజర్ లాగిన్ అయ్యే ఛాన్స్ ఉంది
  const hasValidSession = accessToken || refreshToken;

  // 1. ప్రొటెక్టెడ్ రూట్స్ (Dashboard)
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!hasValidSession) {
      // టోకెన్స్ ఏవీ లేకపోతేనే లాగిన్ కి పంపు
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 2. పబ్లిక్ రూట్స్ (Login)
  if (request.nextUrl.pathname === "/login") {
    if (hasValidSession) {
      // టోకెన్ ఉంటే డాష్‌బోర్డ్ కి పంపు
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

// ఏయే పేజీలకు ఈ రూల్స్ వర్తించాలి?
export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
