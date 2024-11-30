// eslint-disable no-control-regex

import os from 'os'
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

const { EOL } = os
const { stdin } = process

export class TextArea extends Box {
  protected terminationKeyNames: string[]

  private stopReadingCb: ((data?: string) => void) | null = null

  constructor(args: TextAreaArgs) {
    super(args)

    const { terminationKeyNames } = args

    this.terminationKeyNames =
      terminationKeyNames ?? DEFAULT_TERMINATION_KEY_NAMES
  }

  focus(): void {
    super.focus()

    if (this.stopReadingCb === null) {
      this.read()
    }
  }

  blur(): void {
    super.blur()

    if (this.stopReadingCb !== null) {
      this.stopReadingCb()
    }
  }

  async read(cb?: TextAreaReadCallback): Promise<string> {
    const wasRaw = stdin.isRaw

    if (!wasRaw) {
      stdin.setRawMode(true)
    }

    const updateCursorPosition = () => {
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

    updateCursorPosition()

    let readData = ''

    return new Promise((resolve): void => {
      if (this.stopReadingCb !== null) {
        this.stopReadingCb(readData)
      }

      this.stopReadingCb = (data?: string): void => {
        this.stopReadingCb = null
        this.ui.off('key', keypressEventHandler)

        if (this._isFocused) {
          this.blur()
        }

        resolve(data ?? '')
      }

      if (!this._isFocused) {
        this.focus()
      }

      const keypressEventHandler = (
        name: string,
        matches: string[],
        data: TerminalKeyEvent
      ): void => {
        const oldContent = this.content

        let ch = String.fromCharCode(data.codepoint)

        if (name === 'ENTER' || name === 'RETURN') {
          ch = EOL

          if (this.content.split(EOL).length + 1 > this.height - 2) {
            this.scroll.y += 1
          }
        }

        if (this.terminationKeyNames.includes(name)) {
          if (this.stopReadingCb !== null) {
            this.stopReadingCb(readData)
          }
        } else if (name === 'BACKSPACE') {
          const lastContentChar = this.content[this.content.length - 1]

          if (readData[readData.length - 1] === lastContentChar) {
            readData = readData.slice(0, -1)
          }

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

          readData += ch
          this.content += ch
        }

        updateCursorPosition()

        if (this.content !== oldContent) {
          this.render()
        }

        if (typeof cb !== 'undefined') {
          cb(name, matches, data)
        }
      }

      this.ui.on('key', keypressEventHandler)
    })
  }

  get borderColor(): string {
    return this.isFocused ? color(0, 128, 0) : color(128, 128, 128)
  }

  get color(): string {
    return this.isFocused ? color(254, 254, 254) : color(128, 128, 128)
  }
}
