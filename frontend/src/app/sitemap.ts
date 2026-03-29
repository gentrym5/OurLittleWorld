// src/app/sitemap.ts
// Next.js sitemap generation — public routes only.
// Private routes (/secure, /admin) are intentionally excluded.

import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: '/', lastModified: new Date() },
    { url: '/qa', lastModified: new Date() },
    { url: '/feelings', lastModified: new Date() },
    { url: '/photos', lastModified: new Date() },
    { url: '/timeline', lastModified: new Date() },
    { url: '/privacy', lastModified: new Date() },
  ];
}
