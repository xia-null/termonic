// eslint-disable no-control-regex

import { EOL } from 'os'
import readline from 'readline'

import { color } from '../utils'
import { Box, type BoxArgs } from './box'
import { TerminalKeyEvent } from '../types'

export interface TextAreaArgs extends BoxArgs {
  terminationKeyNames?: string[]
}

export type TextAreaReadCallback = (
  name: string,
  matches: string[],
  data: TerminalKeyEvent
) => void

readline.emitKeypressEvents(process.stdin)

export const DEFAULT_TERMINATION_KEY_NAMES: string[] = ['CTRL_C', 'ESCAPE']

export class TextArea extends Box {
  protected terminationKeyNames: string[]

  constructor(args: TextAreaArgs) {
    super(args)

    const { terminationKeyNames } = args

    this.terminationKeyNames =
      terminationKeyNames ?? DEFAULT_TERMINATION_KEY_NAMES
  }

  get borderColor(): string {
    return this.isFocused ? color(0, 128, 0) : color(128, 128, 128)
  }

  get color(): string {
    return this.isFocused ? color(254, 254, 254) : color(128, 128, 128)
  }

  moveCursorToContentEnd(): void {
    const contentLines = this.content.split(EOL)
    const lastContentLine = contentLines[contentLines.length - 1]

    this.ui.moveCursor({
      x: this.position.x + 1 + lastContentLine.length,
      y:
        this.position.y +
        1 +
        Math.min(this.height - 3, contentLines.length - 1)
    })
  }

  onKey(name: string, _: string[], data: TerminalKeyEvent): void {
    const oldContent = this.content

    let ch = String.fromCharCode(data.codepoint)

    if (name === 'ENTER' || name === 'RETURN') {
      ch = EOL

      if (this.content.split(EOL).length + 1 > this.height - 2) {
        this.scroll.y += 1
      }
    }

    if (this.terminationKeyNames.includes(name)) {
      this.blur()
    } else if (name === 'BACKSPACE') {
      const lastContentChar = this.content[this.content.length - 1]

      this.content = this.content.slice(0, -1)

      if (lastContentChar === EOL && this.scroll.y > 0) {
        this.scroll.y -= 1
      }

      // See https://github.com/xia-null/reblessed/blob/master/src/lib/widgets/textarea.js#L247
    } else if (ch && !/^[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]$/.test(ch)) {
      const lastContentLine = this.content.split(EOL).pop() ?? ''

      if ((lastContentLine + ch).length > this.contentWidth) {
        this.content += EOL

        if (ch === EOL && this.scroll.y > 0) {
          this.scroll.y += 1
        }
      }

      this.content += ch
    }

    this.moveCursorToContentEnd()

    if (this.content !== oldContent) {
      this.render()
    }
  }
}
