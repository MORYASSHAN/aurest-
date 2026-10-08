import { ImageResponse } from 'next/og';

// Preview image shown when the site link is shared (WhatsApp, LinkedIn, X, …)
export const alt = 'Aurest Biotech. Engineering the future of medicine.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #c9def3 0%, #e2eefa 55%, #f4f8fd 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Earth horizon */}
        <div
          style={{
            position: 'absolute',
            left: -300,
            right: -300,
            top: 440,
            height: 900,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 20%, #3f7fc0 0%, #1d4a7a 45%, #0f2a47 75%)',
            boxShadow: '0 -20px 80px rgba(255,255,255,0.9)',
          }}
        />
        <div style={{ fontSize: 120, fontWeight: 300, letterSpacing: 36, color: '#3f4c5a', marginTop: -120 }}>
          AUREST
        </div>
        <div style={{ fontSize: 40, color: '#2f3d4c', marginTop: 24 }}>Engineering the future of medicine.</div>
        <div style={{ fontSize: 26, color: '#556476', marginTop: 16 }}>
          Advanced biotechnology for the moments when medicine has seconds to act.
        </div>
      </div>
    ),
    size
  );
}
