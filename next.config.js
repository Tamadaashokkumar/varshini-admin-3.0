/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // పాత పద్ధతి (domains) బదులు remotePatterns వాడటం మంచిది
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // మీ Cloudinary Images కోసం
      },
      {
        protocol: "https",
        hostname: "example.com", // మీ డమ్మీ డేటాలో ఉన్న లింక్స్ కోసం
      },
      {
        protocol: "https",
        hostname: "placehold.co", // డమ్మీ ఇమేజెస్ కోసం (Optional)
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Unsplash ఇమేజెస్ కోసం (Optional)
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org", // 👈 IDI ADD CHEYANDI
      },
    ],
  },
};

module.exports = nextConfig;
