/**
 * RainbowDecorations
 * ISO/IEC 25010 - SRP: Decorative elements only
 */

export function RainbowDecorations() {
  return (
    <>
      <div
        className="absolute top-0 left-0 w-64 h-64 opacity-30 pointer-events-none"
        style={{
          background:
            'conic-gradient(from 180deg, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0080ff, #8000ff, #ff0080, #ff0000)',
          borderRadius: '0 0 100% 0',
          filter: 'blur(30px)',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-64 h-64 opacity-30 pointer-events-none"
        style={{
          background:
            'conic-gradient(from 0deg, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0080ff, #8000ff, #ff0080, #ff0000)',
          borderRadius: '100% 0 0 0',
          filter: 'blur(30px)',
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-900/40 to-transparent pointer-events-none" />
    </>
  );
}
