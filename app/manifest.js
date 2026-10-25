export default function manifest() {
  return {
    name: 'Aurest Biotech',
    short_name: 'Aurest',
    description: 'Advanced biotechnology for the moments when medicine has seconds to act.',
    start_url: '/',
    display: 'standalone',
    background_color: '#e2eefa',
    theme_color: '#e2eefa',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
