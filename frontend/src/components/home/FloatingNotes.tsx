'use client';

// src/components/home/FloatingNotes.tsx
// Floating animated love symbols and words using the floatUp keyframe from globals.css

const notes = [
  { symbol: '♥', label: 'heart' },
  { symbol: '❤', label: 'red heart' },
  { symbol: '💕', label: 'two hearts' },
  { symbol: 'love', label: 'love' },
  { symbol: 'us', label: 'us' },
  { symbol: 'always', label: 'always' },
  { symbol: '♥', label: 'heart' },
  { symbol: 'forever', label: 'forever' },
  { symbol: '💕', label: 'two hearts' },
  { symbol: 'you & me', label: 'you and me' },
];

// Fixed positions to avoid hydration mismatch (no Math.random at render time)
const positions: Array<{ left: string; duration: string; delay: string; size: string }> = [
  { left: '5%',  duration: '7s',  delay: '0s',    size: 'text-sm' },
  { left: '15%', duration: '9s',  delay: '1.2s',  size: 'text-base' },
  { left: '25%', duration: '6s',  delay: '2.4s',  size: 'text-xs' },
  { left: '38%', duration: '10s', delay: '0.8s',  size: 'text-sm' },
  { left: '50%', duration: '8s',  delay: '3.1s',  size: 'text-base' },
  { left: '62%', duration: '7s',  delay: '1.7s',  size: 'text-xs' },
  { left: '72%', duration: '9s',  delay: '0.4s',  size: 'text-sm' },
  { left: '80%', duration: '6s',  delay: '2.9s',  size: 'text-base' },
  { left: '88%', duration: '10s', delay: '1.5s',  size: 'text-xs' },
  { left: '93%', duration: '8s',  delay: '3.6s',  size: 'text-sm' },
];

export default function FloatingNotes() {
  return (
    // Pointer-events none so the notes never intercept clicks
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {notes.map((note, index) => {
        const pos = positions[index];
        return (
          <span
            key={index}
            className={`absolute bottom-0 font-serif italic text-pink-deep opacity-0 animate-floatUp select-none ${pos.size}`}
            style={{
              left: pos.left,
              animationDuration: pos.duration,
              animationDelay: pos.delay,
            }}
          >
            {note.symbol}
          </span>
        );
      })}
    </div>
  );
}
