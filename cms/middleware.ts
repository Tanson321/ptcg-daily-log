import { NextRequest, NextResponse } from "next/server";

const USERNAME = "luka";
const PASSWORD = process.env.CMS_PASSWORD;

export function middleware(request: NextRequest) {
  if (!PASSWORD) {
    return new NextResponse("CMS_PASSWORD is not set", { status: 500 });
  }

  const authHeader = request.headers.get("authorization");

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");

    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const [username, password] = decoded.split(":");

      if (username === USERNAME && password === PASSWORD) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Luka CMS"',
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
