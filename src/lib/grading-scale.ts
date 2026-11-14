export const GRADING_SCALES = ["percent", "ten", "letter_us"] as const;

export type GradingScale = (typeof GRADING_SCALES)[number];

export const US_LETTERS = ["A", "B", "C", "D", "F"] as const;

export type UsLetter = (typeof US_LETTERS)[number];

export const GRADING_SCALE_INFO: Record<
  GradingScale,
  { label: string; letters?: readonly UsLetter[] }
> = {
  percent: { label: "0–100" },
  ten: { label: "0–10" },
  letter_us: {
    label: "A–F",
    letters: US_LETTERS,
  },
};

// Midpoint of each band, so a letter round-trips through its threshold.
const LETTER_SCORES: Record<UsLetter, number> = {
  A: 95,
  B: 85,
  C: 75,
  D: 65,
  F: 30,
};

const LETTER_MIN_SCORES: readonly [UsLetter, number][] = [
  ["A", 90],
  ["B", 80],
  ["C", 70],
  ["D", 60],
];

function parseDecimal(input: string, max: number): number | null {
  const normalized = input.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  // Integer hundredths avoid float noise from multiplying decimals.
  const hundredths = Math.round(Number(normalized) * 100);
  return hundredths <= max * 100 ? hundredths : null;
}

function formatNumber(n: number): string {
  return Number(n.toFixed(2)).toString();
}

export function parseScore(scale: GradingScale, input: string): number | null {
  switch (scale) {
    case "percent": {
      const hundredths = parseDecimal(input, 100);
      return hundredths === null ? null : hundredths / 100;
    }
    case "ten": {
      const hundredths = parseDecimal(input, 10);
      return hundredths === null ? null : hundredths / 10;
    }
    case "letter_us": {
      const letter = input.trim().toUpperCase();
      return Object.hasOwn(LETTER_SCORES, letter)
        ? LETTER_SCORES[letter as UsLetter]
        : null;
    }
  }
}

export function formatScore(scale: GradingScale, score: number): string {
  switch (scale) {
    case "percent":
      return formatNumber(Math.round(score * 100) / 100);
    case "ten":
      return formatNumber(Math.round(score * 10) / 100);
    case "letter_us":
      return LETTER_MIN_SCORES.find(([, min]) => score >= min)?.[0] ?? "F";
  }
}
