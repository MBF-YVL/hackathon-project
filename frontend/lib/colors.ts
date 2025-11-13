/**
 * Color scales for CSI visualization
 */

export const CSI_COLOR_SCALE = [
  [0, [50, 120, 50]], // 0-20: Muted dark green (low stress)
  [20, [100, 180, 100]], // 20-40: Muted light green
  [40, [220, 200, 70]], // 40-60: Muted yellow (moderate stress)
  [60, [255, 140, 0]], // 60-70: Bright orange (more orange!)
  [70, [255, 50, 0]], // 70-80: Red-orange 
  [80, [220, 0, 0]], // 80-90: Bright red (more red!)
  [90, [180, 0, 0]], // 90-100: Dark red (CRITICAL!)
];

export function getCSIColor(csi: number): [number, number, number, number] {
  // Interpolate between color stops
  for (let i = 0; i < CSI_COLOR_SCALE.length - 1; i++) {
    const [value1, color1] = CSI_COLOR_SCALE[i];
    const [value2, color2] = CSI_COLOR_SCALE[i + 1];

    if (csi >= value1 && csi <= value2) {
      const t = (csi - value1) / (value2 - value1);
      return [
        Math.round(color1[0] + t * (color2[0] - color1[0])),
        Math.round(color1[1] + t * (color2[1] - color1[1])),
        Math.round(color1[2] + t * (color2[2] - color1[2])),
        180, // Alpha
      ];
    }
  }

  // Default to last color if CSI > 90
  const lastColor = CSI_COLOR_SCALE[CSI_COLOR_SCALE.length - 1][1];
  return [...lastColor, 180] as [number, number, number, number];
}
