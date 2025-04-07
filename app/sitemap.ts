import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://githubfolio.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    // You can add more URLs as your site grows
  ];
}
