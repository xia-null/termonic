import { EOL } from 'os'
import _max from 'lodash/max'
import _min from 'lodash/min'
import CLIBoxes, { type BoxStyle as CLIBoxesBoxStyle } from 'cli-boxes'

import { color, padding } from '../utils'
import { Widget, type WidgetArgs } from '../widget'
import { TextAlign, VerticalAlign, type Style, type Position } from '../types'

export interface BoxStyle extends Style {
  labelColor?: string
  borderColor?: string
  boxStyle?: CLIBoxesBoxStyle
}

export interface BoxArgs extends WidgetArgs {
  content?: string
  label?: string
}

export const DEFAULT_BOX_CONTENT = ''
export const DEFAULT_BOX_LABEL = ''
export const DEFAULT_BOX_LABEL_COLOR = color(63, 254, 63)
export const DEFAULT_BOX_COLOR = color(254, 254, 254)
export const DEFAULT_BOX_BORDER_COLOR = color(150, 150, 150)
export const DEFAULT_BOX_BACKGROUND_COLOR = color(0, 0, 0)
export const DEFAULT_BOX_STYLE = CLIBoxes.round

export const DEFAULT_BOX_BOX_STYLE_TOP = '─'
export const DEFAULT_BOX_BOX_STYLE_BOTTOM = '─'
export const DEFAULT_BOX_BOX_STYLE_LEFT = '│'
export const DEFAULT_BOX_BOX_STYLE_RIGHT = '│'
export const DEFAULT_BOX_BOX_STYLE_TOP_LEFT = '┌'
export const DEFAULT_BOX_BOX_STYLE_TOP_RIGHT = '┐'
export const DEFAULT_BOX_BOX_STYLE_BOTTOM_LEFT = '└'
export const DEFAULT_BOX_BOX_STYLE_BOTTOM_RIGHT = '┘'

export class Box extends Widget {
  declare protected _style: BoxStyle

  protected _content: string
  protected _label: string

  public scroll: Position = { x: 0, y: 0 }

  constructor(options: BoxArgs) {
    super({
      ...options,

      style: {
        color: DEFAULT_BOX_COLOR,
        borderColor: DEFAULT_BOX_BORDER_COLOR,
        backgroundColor: DEFAULT_BOX_BACKGROUND_COLOR,

        ...(options.style ?? {})
      }
    })

    const { content, label } = options

    this._content = content ?? DEFAULT_BOX_CONTENT
    this._label = label ?? DEFAULT_BOX_LABEL
  }

  get charBoxTopLeft(): string {
    return this._style.boxStyle?.topLeft ?? DEFAULT_BOX_BOX_STYLE_TOP_LEFT
  }

  get charBoxTopRight(): string {
    return this._style.boxStyle?.topRight ?? DEFAULT_BOX_BOX_STYLE_TOP_RIGHT
  }

  get charBoxBottomLeft(): string {
    return this._style.boxStyle?.bottomLeft ?? DEFAULT_BOX_BOX_STYLE_BOTTOM_LEFT
  }

  get charBoxBottomRight(): string {
    return this._style.boxStyle?.bottomRight ?? DEFAULT_BOX_BOX_STYLE_BOTTOM_RIGHT
  }

  get charBoxLeft(): string {
    return this._style.boxStyle?.left ?? DEFAULT_BOX_BOX_STYLE_LEFT
  }

  get charBoxRight(): string {
    return this._style.boxStyle?.right ?? DEFAULT_BOX_BOX_STYLE_RIGHT
  }

  get charBoxTop(): string {
    return this._style.boxStyle?.top ?? DEFAULT_BOX_BOX_STYLE_TOP
  }

  get charBoxBottom(): string {
    return this._style.boxStyle?.bottom ?? DEFAULT_BOX_BOX_STYLE_BOTTOM
  }

  getRendered(): string[] {
    const lines: string[] = []
    const visibleContentLines = this.visibleContentLines()
    const totalPaddingHeight = this.height - visibleContentLines.length - 2

    // Add top border
    lines.push([
      this.charBoxTopLeft,
      this._label.slice(0, this.labelWidth),
      this.charBoxTop.repeat(Math.max(0, this.width - this._label.length - 2)),
      this.charBoxTopRight
    ].join(''))

    // Calculate padding based on vertical alignment
    let paddingTop = 0
    let paddingBottom = 0

    switch (this._style.verticalAlign) {
      case VerticalAlign.Center:
        paddingTop = Math.floor(totalPaddingHeight / 2)
        paddingBottom = totalPaddingHeight - paddingTop
        break
      case VerticalAlign.Bottom:
        paddingTop = totalPaddingHeight
        paddingBottom = 0
        break
      case VerticalAlign.Top:
      default:
        paddingTop = 0
        paddingBottom = totalPaddingHeight
        break
    }

    // Add top padding
    for (let i = 0; i < paddingTop; i++) {
      lines.push(`${this.charBoxLeft}${' '.repeat(this.width - 2)}${this.charBoxRight}`)
    }

    // Add content lines with horizontal alignment
    for (const content of visibleContentLines) {
      if (this._style.textAlign === TextAlign.Center) {
        const paddingWidth = (this.width - content.length - 2) / 2
        const paddingLeft = padding(paddingWidth)
        const paddingRight = padding(paddingWidth, true)

        lines.push([
          this.charBoxLeft,
          paddingLeft.length > 0 ? paddingLeft : '',
          content,
          paddingRight.length > 0 ? paddingRight : '',
          this.charBoxRight
        ].join(''))
      } else if (this._style.textAlign === TextAlign.Right) {
        const p = padding(this.width - content.length - 2)
        lines.push(`${this.charBoxLeft}${p}${content}${this.charBoxRight}`)
      } else {
        const p = padding(this.width - content.length - 2)
        lines.push(`${this.charBoxLeft}${content}${p}${this.charBoxRight}`)
      }
    }

    // Add bottom padding
    for (let i = 0; i < paddingBottom; i++) {
      lines.push(`${this.charBoxLeft}${' '.repeat(this.width - 2)}${this.charBoxRight}`)
    }

    // Add bottom border
    lines.push(`${this.charBoxBottomLeft}${this.charBoxBottom.repeat(this.width - 2)}${this.charBoxBottomRight}`)

    return lines
  }

  get labelColor(): string {
    return this._style.labelColor ?? DEFAULT_BOX_LABEL_COLOR
  }

  get borderColor(): string {
    return this._style.borderColor ?? DEFAULT_BOX_BORDER_COLOR
  }

  get contentWidth(): number {
    return this.width - 2
  }

  get contentHeight(): number {
    return this.height - 2
  }

  set content(content: string) {
    this._content = content
  }

  get content(): string {
    return this._content
  }

  get contentLines(): string[] {
    return this._content.split(EOL)
  }

  get contentLineLengths(): number[] {
    return this.contentLines.map((l: string): number => l.length)
  }

  get maxContentLineLength(): number {
    return _max(this.contentLineLengths) ?? 0
  }

  get minContentLineLength(): number {
    return _min(this.contentLineLengths) ?? 0
  }

  get label(): string {
    return this._label
  }

  get labelWidth(): number {
    return Math.min(this.contentWidth, this._label.length)
  }

  visibleContentLines(): string[] {
    const { x: scrollX = 0, y: scrollY = 0 } = this.scroll
    const lines = this._content.split(EOL)

    return lines
      .slice(scrollY, Math.min(scrollY + this.contentHeight, lines.length))
      .map((line: string): string => (
        line.slice(
          scrollX,
          Math.min(scrollX + this.contentWidth, line.length)
        )
      ))
  }

  isBorder(x: number, y: number): boolean {
    return y === 0
      ? x === 0 || x > this.labelWidth
      : x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1
  }

  isLabel(x: number, y: number): boolean {
    return y === 0 && (x > 0 && x <= this.labelWidth)
  }

  getCharColor(char: string, x: number, y: number): string {
    if (this.isBorder(x, y)) {
      return this.borderColor
    } else if (this.isLabel(x, y)) {
      return this.labelColor
    }

    return super.getCharColor(char, x, y)
  }
}
