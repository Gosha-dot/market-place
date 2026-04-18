import type { MetadataRoute } from 'next';
import { mockProducts } from '@/lib/mockData';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now },
    { url: `${siteUrl}/products`, lastModified: now },
    { url: `${siteUrl}/cart`, lastModified: now },
    { url: `${siteUrl}/wishlist`, lastModified: now },
    { url: `${siteUrl}/compare`, lastModified: now },
    { url: `${siteUrl}/checkout`, lastModified: now },
    { url: `${siteUrl}/auth/login`, lastModified: now },
    { url: `${siteUrl}/auth/register`, lastModified: now }
  ];

  const productRoutes: MetadataRoute.Sitemap = (mockProducts as unknown as { _id: string }[]).map((p) => ({
    url: `${siteUrl}/products/${encodeURIComponent(p._id)}`,
    lastModified: now
  }));

  return [...staticRoutes, ...productRoutes];
}

