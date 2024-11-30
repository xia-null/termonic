export enum TextAlign {
  Left = 'left',
  Right = 'right',
  Center = 'center',
  Justify = 'justify',
  Start = 'start',
  End = 'end'
}

export interface Style {
  color?: string
  borderColor?: string
  textAlign?: TextAlign
  backgroundColor?: string
}
