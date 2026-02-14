import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/apps',
        destination: '/exams',
        permanent: true,
      },
      {
        source: '/apps/:bundle_id',
        destination: '/exams/:bundle_id',
        permanent: true,
      },
      {
        source: '/apps/:bundle_id/concepts',
        destination: '/exams/:bundle_id/concepts',
        permanent: true,
      },
      {
        source: '/apps/:bundle_id/lectures',
        destination: '/exams/:bundle_id/lectures',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
