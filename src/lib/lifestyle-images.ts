export const LIFESTYLE_IMAGES = ["kit-pcb.png", "kit-pcb-2.png"] as const;

export function isLifestyle(src?: string): boolean {
  if (!src) return false;
  return LIFESTYLE_IMAGES.some(name => src.includes(name));
}
