/**
 * RainbowDecorations
 * ISO/IEC 25010 - SRP: Decorative elements only
 */

export function RainbowDecorations() {
  return (
    <>
      <div className="rainbow-corner rainbow-corner-top" />
      <div className="rainbow-corner rainbow-corner-bottom" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-900/40 to-transparent pointer-events-none" />
    </>
  );
}
