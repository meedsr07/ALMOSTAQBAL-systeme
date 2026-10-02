import path from "path";

// Address of the Go backend.
// Change it in .env.local if the backend runs somewhere else:
// NEXT_PUBLIC_API_URL=http://localhost:8080
const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // keep the build root inside this folder
  turbopack: {
    root: path.resolve("."),
  },

  // The API is called with a relative url (/api/players) so the browser stays on
  // the same origin and the Go backend does not need CORS headers.
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${backendUrl}/api/:path*` },
    ];
  },
};

export default nextConfig;
