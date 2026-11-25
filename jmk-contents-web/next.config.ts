import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 스토어에 등록된 마케팅 URL 중 종목 페이지가 없어 404이던 주소 (2026-11-24 확인).
      {
        source: '/apps/indsafetyind',
        destination: '/exams/saneobanjeonsaneobgisa',
        permanent: false,
      },
      {
        source: '/apps/driverexam',
        destination: '/exams',
        permanent: false,
      },
      {
        source: '/apps/takkenapp',
        destination: '/exams',
        permanent: false,
      },
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
