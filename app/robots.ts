import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/account/', '/my-profiles/', '/admin/', '/pay/'],
    },
    sitemap: 'https://heesara.lk/sitemap.xml',
  }
}
