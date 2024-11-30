import os from 'os'
import _merge from 'lodash/merge'

import { padding } from '../utils'
import { type Position, TextAlign } from '../types'
import { Widget, type WidgetArgs } from '../widget'

export interface BoxArgs extends WidgetArgs {
  content?: string
}

const { EOL } = os

const DEFAULT_CONTENT = ''

export class Box extends Widget {
  public content: string

  protected scrollPosition: Position = { x: 0, y: 0 }

  constructor(options: BoxArgs) {
    super(options)

    const { content } = options

    this.content = content || DEFAULT_CONTENT
  }

  get lines(): string[] {
    const lines: string[] = []
    const visibleContentLines = this.visibleContentLines()

    for (let i = 0; i < this.height; i += 1) {
      if (i === 0 || i === this.height - 1) {
        lines.push('─'.repeat(this.width))
      } else {
        const content = visibleContentLines[i - 1] ?? ''

        if (this.style.textAlign === TextAlign.Center) {
          const paddingWidth = (this.width - content.length - 2) / 2

          lines.push(`|${padding(paddingWidth)}${content}${padding(paddingWidth, true)}|`)
        } else if (this.style.textAlign === TextAlign.Right) {
          lines.push(`|${padding(this.width - content.length - 2)}${content}|`)
        } else {

          lines.push(`|${content}${padding(this.width - content.length - 2)}|`)
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

