import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cync — Social Fitness Accountability',
    short_name: 'Cync',
    description:
      'Stay consistent. Stay connected. Accountability, consistency, and shared progress for your squad.',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    background_color: '#0c0c0e',
    theme_color: '#10b981',
    orientation: 'portrait-primary',
    categories: ['fitness', 'health', 'social'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}

