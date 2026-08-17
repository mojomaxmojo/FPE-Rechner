/**
 * Extended insulin bolus duration based on FPE (Fat-Protein-Units).
 *
 * Source: common diabetes-care guideline for fat-protein units.
 */
export const EXTENDED_BOLUS_DURATION: Record<number, string> = {
  1: "mehr als 3 Stunden",
  2: "mehr als 4 Stunden",
  3: "mehr als 5 Stunden",
  4: "mehr als 8 Stunden",
};

/**
 * Return the recommended extended bolus duration text for a given FPE value.
 * Falls back to the highest matching entry if FPE is between two thresholds.
 */
export function getExtendedBolusDuration(fpe: number): string {
  const thresholds = Object.keys(EXTENDED_BOLUS_DURATION)
    .map(Number)
    .sort((a, b) => a - b);

  let matched = thresholds[0];
  for (const threshold of thresholds) {
    if (fpe >= threshold) {
      matched = threshold;
    }
  }

  return EXTENDED_BOLUS_DURATION[matched] ?? EXTENDED_BOLUS_DURATION[thresholds[0]];
}
