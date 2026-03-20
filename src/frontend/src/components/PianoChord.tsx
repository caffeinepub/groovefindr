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

const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];
const WHITE_KEY_NAMES = ["C", "D", "E", "F", "G", "A", "B"];
const BLACK_KEYS = [1, 3, null, 6, 8, 10];

interface Props {
  chord: Chord;
}

export function PianoChord({ chord }: Props) {
  const tones = getChordTones(chord.name);
  const KW = 14;
  const KH = 50;
  const W = WHITE_KEYS.length * KW;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={W}
        height={KH + 4}
        className="overflow-visible"
        role="img"
        aria-label={`Piano chord diagram for ${chord.name}`}
      >
        <title>Piano chord diagram for {chord.name}</title>
        {WHITE_KEYS.map((note, i) => (
          <rect
            key={WHITE_KEY_NAMES[i]}
            x={i * KW}
            y={0}
            width={KW - 1}
            height={KH}
            rx={2}
            fill={
              tones.has(note)
                ? "oklch(var(--primary))"
                : "oklch(var(--foreground))"
            }
            stroke="oklch(var(--border))"
            strokeWidth={0.5}
          />
        ))}
        {[0, 1, 2, 3, 4, 5, 6].map((wi) => {
          if (wi === 2 || wi === 6) return null;
          const bkIndex = wi > 2 ? wi - 1 : wi;
          const note = BLACK_KEYS[bkIndex];
          if (note === null || note === undefined) return null;
          return (
            <rect
              key={`bk-${note}`}
              x={wi * KW + KW * 0.6}
              y={0}
              width={KW * 0.7}
              height={KH * 0.6}
              rx={1}
              fill={
                tones.has(note) ? "oklch(var(--accent))" : "oklch(0.1 0.01 270)"
              }
              stroke="oklch(var(--border))"
              strokeWidth={0.5}
            />
          );
        })}
      </svg>
    </div>
  );
}
