export const color = (r: number, g: number, b: number): string => (
  `\x1b[38;2;${r};${g};${b}m`
)
