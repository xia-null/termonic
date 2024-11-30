import os from 'os'
import _merge from 'lodash/merge'

import { TerminalMouseEvent, TextAlign } from '../types'
import { ANSI_BLACK, ANSI_GREEN, ANSI_WHITE, ANSI_YELLOW } from '../ansi'
import { DEFAULT_CONTENT as DEFAULT_BOX_CONTENT, Box, type BoxArgs } from './box'

export enum ButtonType {
  Solid = 'SOLID',
  Outline = 'OUTLINE',
}

export interface ButtonArgs extends BoxArgs {
  disabled?: boolean
  type?: ButtonType
}

const { EOL } = os

const PADDING_X = 5
const PADDING_Y = 3

export const DEFAULT_DISABLED = false
export const DEFAULT_TYPE = ButtonType.Solid
export const DEFAULT_TEXT_ALIGN = TextAlign.Center

export class Button extends Box {
  protected disabled: boolean
  protected type: ButtonType

  constructor(args: ButtonArgs) {
    const { content = DEFAULT_BOX_CONTENT, width, height, ...otherArgs } = args
    const contentWidth = content.length + PADDING_X * 2
    const contentHeight = content.split(EOL).length + PADDING_Y * 2

    super({
      content,
      width: typeof width === 'undefined'
        ? contentWidth
        : Math.max(width, contentWidth),

      height: typeof height === 'undefined'
        ? contentHeight
        : Math.max(height, contentHeight),

      style: {
        ...(otherArgs.style ?? {}),

        textAlign: DEFAULT_TEXT_ALIGN,
      },

      ...otherArgs,
    })

    const { disabled, type } = args

    this.type = type ?? DEFAULT_TYPE
    this.disabled = disabled ?? DEFAULT_DISABLED
  }

  onHoverStart(_: TerminalMouseEvent): void {
    this.style.backgroundColor = this.disabled
      ? ANSI_YELLOW
      : ANSI_WHITE

    this.style.borderColor = ANSI_YELLOW
    this.style.color = ANSI_BLACK
    this.render()
  }

  onHoverEnd(_: TerminalMouseEvent): void {
    this.style.backgroundColor = ANSI_BLACK
    this.style.borderColor = ANSI_GREEN
    this.style.color = ANSI_WHITE
    this.render()
  }
}
