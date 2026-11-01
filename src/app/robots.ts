import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/manage',
    },
    sitemap: 'https://www.zion-online.com/sitemap.xml',
  };
}
