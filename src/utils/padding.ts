export const padding = (width: number, ceil?: boolean): string => (
  ' '.repeat(Math[!!ceil ? 'ceil' : 'floor'](width))
)
