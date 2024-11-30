export const escapeControlCodes = (input: string): string => (
  input.replace(/[\x00-\x1b]/g, (char: string): string => (
    `\\x${char.charCodeAt(0).toString(16).padStart(2, '0')}`
  ))
)
