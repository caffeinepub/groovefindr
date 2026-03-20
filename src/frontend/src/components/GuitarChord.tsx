import type { Chord } from "../backend.d";

const NOTE_SEMITONES: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

const CHORD_INTERVALS: Record<string, number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  "7": [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
};

const OPEN_STRINGS = [40, 45, 50, 55, 59, 64];

function getChordTones(chordName: string): Set<number> {
  const match = chordName.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return new Set([0, 4, 7]);
  const rootName = match[1];
  let type = match[2] || "maj";
  if (type === "" || type === "M") type = "maj";
  if (type === "m") type = "min";
  const root = NOTE_SEMITONES[rootName] ?? 0;
  const intervals = CHORD_INTERVALS[type] ?? CHORD_INTERVALS.maj;
  return new Set(intervals.map((i) => (root + i) % 12));
}

interface Props {
  chord: Chord;
}

export function GuitarChord({ chord }: Props) {
  const tones = getChordTones(chord.name);
  const frets = OPEN_STRINGS.map((openNote) => {
    for (let f = 0; f <= 4; f++) {
      const semitone = (openNote + f) % 12;
      if (tones.has(semitone)) return f;
    }
    return -1;
  });

  const W = 80;
  const H = 100;
  const nutY = 18;
  const fretH = (H - nutY - 10) / 4;
  const stringX = (i: number) => 10 + (i * (W - 20)) / 5;
  const STRING_NAMES = ["E", "A", "D", "G", "B", "e"];

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-muted-foreground font-body">
        {chord.name}
      </span>
      <svg
        width={W}
        height={H}
        className="overflow-visible"
        role="img"
        aria-label={`Guitar chord diagram for ${chord.name}`}
      >
        <title>Guitar chord diagram for {chord.name}</title>
        <rect
          x={8}
          y={nutY - 3}
          width={W - 16}
          height={3}
          fill="oklch(var(--foreground))"
          rx={1}
        />
        {[0, 1, 2, 3, 4].map((f) => (
          <line
            key={f}
            x1={8}
            x2={W - 8}
            y1={nutY + f * fretH}
            y2={nutY + f * fretH}
            stroke="oklch(var(--border))"
            strokeWidth={1}
          />
        ))}
        {[0, 1, 2, 3, 4, 5].map((s) => (
          <line
            key={STRING_NAMES[s]}
            x1={stringX(s)}
            x2={stringX(s)}
            y1={nutY}
            y2={H - 10}
            stroke="oklch(var(--muted-foreground) / 0.6)"
            strokeWidth={1}
          />
        ))}
        {frets.map((f, s) =>
          f >= 0 ? (
            <circle
              key={`dot-${STRING_NAMES[s]}`}
              cx={stringX(s)}
              cy={nutY + (f === 0 ? -8 : (f - 0.5) * fretH)}
              r={5}
              fill={f === 0 ? "oklch(var(--accent))" : "oklch(var(--primary))"}
            />
          ) : (
            <text
              key={`mute-${STRING_NAMES[s]}`}
              x={stringX(s)}
              y={nutY - 8}
              textAnchor="middle"
              fontSize={10}
              fill="oklch(var(--muted-foreground))"
            >
              ✕
            </text>
          ),
        )}
      </svg>
    </div>
  );
}
