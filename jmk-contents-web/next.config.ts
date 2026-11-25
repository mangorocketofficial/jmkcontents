import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 미용사(네일)은 기존 '미용사' 종목(/exams/miyongsa)으로 합쳤다 (2026-11-25).
      {
        source: '/exams/miyongsa-nail',
        destination: '/exams/miyongsa',
        permanent: true,
      },
      {
        source: '/exams/miyongsa-nail/:path*',
        destination: '/exams/miyongsa/:path*',
        permanent: true,
      },
      // 예상문제 목록은 종목 게시판(/exams/<종목>) 첫 화면이다.
      {
        source: '/exams/:bundle_id/questions',
        destination: '/exams/:bundle_id',
        permanent: true,
      },
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
