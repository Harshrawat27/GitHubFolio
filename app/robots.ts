import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://githubfolio.com/sitemap.xml',
    host: 'https://githubfolio.com',
  };
}
