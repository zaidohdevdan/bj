import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 64,
  height: 64,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 34,
          background: 'rgba(56, 189, 248, 0.1)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgb(56, 189, 248)',
          fontFamily: 'monospace',
          fontWeight: 900,
          border: '4px solid rgba(56, 189, 248, 0.4)',
          borderRadius: '16px',
        }}
      >
        {'<?'}
      </div>
    ),
    {
      ...size,
    }
  );
}
