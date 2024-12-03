export enum TextAlign {
  Left = 'left',
  Right = 'right',
  Center = 'center',
  Justify = 'justify',
  Start = 'start',
  End = 'end'
}

export enum VerticalAlign {
  Top = 'top',
  Center = 'center',
  Bottom = 'bottom'
}

export interface Style {
  color?: string
  borderColor?: string
  textAlign?: TextAlign
  verticalAlign?: VerticalAlign
  backgroundColor?: string
}
