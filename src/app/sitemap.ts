import type { MetadataRoute } from 'next';

const BASE = 'https://www.zion-online.com';
const PATHS = ['/', '/music', '/apps', '/apps/zion', '/apps/daw'];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((p) => ({
    url: p === '/' ? `${BASE}/` : `${BASE}${p}`,
    changeFrequency: 'weekly',
    priority: p === '/' ? 1 : 0.8,
  }));
}
