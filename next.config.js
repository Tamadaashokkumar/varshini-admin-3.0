/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "example.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  // 🔥 ఈ REWRITES భాగం కొత్తగా యాడ్ చేయండి 🔥
  async rewrites() {
    return [
      {
        source: "/api/:path*", // ఫ్రంటెండ్ నుండి '/api' అని కాల్ వెళ్తే...
        destination: "https://varshini-backend-3-0-1.onrender.com/api/:path*", // ...దాన్ని Render కి మళ్ళించు
      },
    ];
  },
};

export default nextConfig;
