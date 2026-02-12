import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 1. కుకీ ఉందా లేదా అని చెక్ చేస్తుంది
  // గమనిక: మీ కుకీ పేరు "accessToken" కాకపోతే ఇక్కడ మార్చండి
  const token = request.cookies.get("accessToken")?.value;

  // యూజర్ ఏ పేజీకి వెళ్తున్నాడో చూస్తుంది
  const { pathname } = request.nextUrl;

  // 2. లాగిన్ పేజీని పబ్లిక్ రూట్ గా సెట్ చేస్తున్నాం
  const isPublicPath = pathname === "/login";

  // 3. టోకెన్ లేదు, కానీ డాష్‌బోర్డ్ (Protected Route) కి వెళ్లాలని చూస్తే...
  // వెంటనే లాగిన్ పేజీకి గెంటేస్తుంది (Redirect)
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4. టోకెన్ ఉంది (Already Logged in), కానీ మళ్ళీ లాగిన్ పేజీకి వెళ్లాలని చూస్తే...
  // డాష్‌బోర్డ్ కి పంపించేస్తుంది
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// 5. ఈ మిడిల్‌వేర్ ఏయే పేజీలకు పని చేయాలో ఇక్కడ చెప్పాలి
export const config = {
  matcher: [
    "/dashboard/:path*", // డాష్‌బోర్డ్ లోపల ఉన్న అన్ని పేజీలను ప్రొటెక్ట్ చేస్తుంది
    "/login", // లాగిన్ పేజీ రీడైరెక్ట్ లాజిక్ కోసం
  ],
};
