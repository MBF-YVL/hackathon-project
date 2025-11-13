/**
 * Color scales for CSI visualization
 */

type ColorStop = [number, [number, number, number]];

export const CSI_COLOR_SCALE: ColorStop[] = [
  [0, [34, 139, 34]],      // 0-20: Dark green (low stress)
  [20, [144, 238, 144]],   // 20-40: Light green
  [40, [255, 255, 0]],     // 40-60: Yellow (moderate stress)
  [60, [255, 50, 0]],      // 60-70: Red-orange (HOT!)
  [70, [255, 0, 0]],       // 70-80: Pure red (HIGH STRESS!)
  [80, [200, 0, 0]],       // 80-90: Dark red
  [90, [139, 0, 0]],       // 90-100: Blood red (CRITICAL!)
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

