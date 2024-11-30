import os from 'os'
import _merge from 'lodash/merge'

import { padding } from '../utils'
import { type Position, TextAlign } from '../types'
import { Widget, type WidgetRenderableContent, type WidgetArgs, type WidgetRenderableContentColor } from '../widget'

export interface BoxArgs extends WidgetArgs {
  content?: string
}

const { EOL } = os

export const DEFAULT_CONTENT = ''

export class Box extends Widget {
  public content: string

  protected scrollPosition: Position = { x: 0, y: 0 }

  constructor(options: BoxArgs) {
    super(options)

    const { content } = options

    this.content = content || DEFAULT_CONTENT
  }

  get renderableContent(): WidgetRenderableContent {
    const lines: string[] = []
    const colors: WidgetRenderableContentColor[] = []

    const visibleContentLines = this.visibleContentLines()

    for (let i = 0; i < this.height; i += 1) {
      if (i === 0 || i === this.height - 1) {
        lines.push('─'.repeat(this.width))

        colors.push(this.borderColor)
      } else {
        const content = (visibleContentLines[i - 1] ?? '').trimEnd()

        if (this.style.textAlign === TextAlign.Center) {
          const paddingWidth = (this.width - content.length - 2) / 2
          const paddingLeft = padding(paddingWidth)
          const paddingRight = padding(paddingWidth, true)

          lines.push(`|${paddingLeft.length > 0 ? paddingLeft : ''}${content}${paddingRight.length > 0 ? paddingRight : ''}|`)
          colors.push([
            this.borderColor,
            ...(paddingLeft.length > 0 ? [[paddingLeft.length, this.backgroundColor]] : []) as any,
            ...(content.length > 0 ? [[content.length, this.color]] : []) as any,
            ...(paddingRight.length > 0 ? [[paddingRight.length, this.backgroundColor]] : []) as any,
            this.borderColor,
          ])
        } else if (this.style.textAlign === TextAlign.Right) {
          const p = padding(this.width - content.length - 2)

          lines.push(`|${p}${content}|`)
          colors.push([
            this.borderColor,
            ...(p.length > 0 ? [[p.length, this.backgroundColor]] : []) as any,
            ...(content.length > 0 ? [[content.length, this.color]] : []) as any,
            this.borderColor,
          ])
        } else {
          const p = padding(this.width - content.length - 2)

          lines.push(`|${content}${p}|`)
          colors.push([
            this.borderColor,
            ...(content.length > 0 ? [[content.length, this.color]] : []) as any,
            ...(p.length > 0 ? [[p.length, this.backgroundColor]] : []) as any,
            this.borderColor,
          ])
        }
      }
    }

    return { lines, colors }
  }

  get contentWidth(): number {
    return this.width - 2
  }

  get contentHeight(): number {
    return this.height - 2
  }

  visibleContentLines(): string[] {
    const {
      x: scrollX,
      y: scrollY,
    } = this.scrollPosition

    const lines: string[] = []
    const contentLines = this.content.split(EOL).slice(scrollY, scrollY + this.contentHeight)

    contentLines.forEach((line: string): void => {
      const trimmedLine = line.trimEnd()
      const visibileTrimmedLine = trimmedLine
        .split('')
        .slice(scrollX, Math.min(this.contentWidth - scrollX, trimmedLine.length - scrollX))
        .join('')

      if (scrollX === 0) {
        lines.push(visibileTrimmedLine)
      } else {
        lines.push(`${padding(scrollX)}${visibileTrimmedLine}`)
      }
    })

    return lines
  }
}
