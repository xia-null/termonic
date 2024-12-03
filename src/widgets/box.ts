import os from 'os'

import { color, padding } from '../utils'
import { Widget, type WidgetArgs } from '../widget'
import { TextAlign, VerticalAlign, type Position } from '../types'

export interface BoxArgs extends WidgetArgs {
  content?: string
}

const { EOL } = os

export const DEFAULT_BOX_CONTENT = ''
export const DEFAULT_BOX_COLOR = color(254, 254, 254)
export const DEFAULT_BOX_BORDER_COLOR = color(254, 0, 0)
export const DEFAULT_BOX_BACKGROUND_COLOR = color(0, 0, 0)

export class Box extends Widget {
  private _content: string

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

    const { content } = options

    this._content = content || DEFAULT_BOX_CONTENT
  }

  get renderableContent(): string[] {
    const lines: string[] = []
    const visibleContentLines = this.visibleContentLines()
    const totalPaddingHeight = this.height - visibleContentLines.length - 2

    // Add top border
    lines.push('─'.repeat(this.width))

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
      lines.push(`|${' '.repeat(this.width - 2)}|`)
    }

    // Add content lines with horizontal alignment
    for (const content of visibleContentLines) {
      if (this._style.textAlign === TextAlign.Center) {
        const paddingWidth = (this.width - content.length - 2) / 2
        const paddingLeft = padding(paddingWidth)
        const paddingRight = padding(paddingWidth, true)

        lines.push(
          `|${paddingLeft.length > 0 ? paddingLeft : ''}${content}${paddingRight.length > 0 ? paddingRight : ''}|`
        )
      } else if (this._style.textAlign === TextAlign.Right) {
        const p = padding(this.width - content.length - 2)
        lines.push(`|${p}${content}|`)
      } else {
        const p = padding(this.width - content.length - 2)
        lines.push(`|${content}${p}|`)
      }
    }

    // Add bottom padding
    for (let i = 0; i < paddingBottom; i++) {
      lines.push(`|${' '.repeat(this.width - 2)}|`)
    }

    // Add bottom border
    lines.push('─'.repeat(this.width))

    return lines
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
    return x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1
  }
}
