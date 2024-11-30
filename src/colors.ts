export const COLORS: Record<string, string> = {}

for (let i = 0; i < 256; i++) {
  COLORS[`COLOR_${i}`] = `\x1b[38;5;${i}m ${i.toString().padStart(3, ' ')}`
}
