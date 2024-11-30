import os from 'os'

import { color, padding } from '../utils'
import { TextAlign, type Position } from '../types'
import { Widget, type WidgetArgs } from '../widget'

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

    for (let i = 0; i < this.height; i += 1) {
      if (i === 0 || i === this.height - 1) {
        lines.push('─'.repeat(this.width))
      } else {
        const content = visibleContentLines[i - 1] ?? ''

        if (this.style.textAlign === TextAlign.Center) {
          const paddingWidth = (this.width - content.length - 2) / 2
          const paddingLeft = padding(paddingWidth)
          const paddingRight = padding(paddingWidth, true)

          lines.push(
            `|${paddingLeft.length > 0 ? paddingLeft : ''}${content}${paddingRight.length > 0 ? paddingRight : ''}|`
          )
        } else if (this.style.textAlign === TextAlign.Right) {
          const p = padding(this.width - content.length - 2)

          lines.push(`|${p}${content}|`)
        } else {
          const p = padding(this.width - content.length - 2)

          lines.push(`|${content}${p}|`)
        }
      }
    }

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
    const { x: rawScrollX = 0, y: rawScrollY = 0 } = this.scroll

    const scrollX = Math.min(this.contentWidth, rawScrollX)
    const scrollY = Math.min(this.contentHeight, rawScrollY)

    const allContentLines = this._content.split(EOL)
    const contentLines = allContentLines.slice(
      scrollY,
      Math.min(allContentLines.length, scrollY + this.contentHeight)
    )

    return contentLines.map((line: string): string => {
      const trimmedLine = line.trimEnd()
      const visibileTrimmedLine = trimmedLine.slice(
        scrollX,
        Math.min(this.contentWidth - scrollX, trimmedLine.length - scrollX)
      )

      if (scrollX === 0) {
        return visibileTrimmedLine
      } else {
        return `${padding(scrollX)}${visibileTrimmedLine}`
      }
    })
  }

  isBorder(x: number, y: number): boolean {
    return x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1
  }
}
