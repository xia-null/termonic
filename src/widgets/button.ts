import os from 'os'
import _merge from 'lodash/merge'

import { COLORS } from '../colors'
import { TerminalMouseEvent, TextAlign } from '../types'
import { DEFAULT_BOX_CONTENT, Box, type BoxArgs } from './box'

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

export const DEFAULT_BUTTON_DISABLED = false
export const DEFAULT_BUTTON_TYPE = ButtonType.Solid
export const DEFAULT_BUTTON_TEXT_ALIGN = TextAlign.Center

export const DEFAULT_BUTTON_COLOR = COLORS.COLOR_255
export const DEFAULT_BUTTON_BORDER_COLOR = COLORS.COLOR_40
export const DEFAULT_BUTTON_BACKGROUND_COLOR = COLORS.COLOR_16

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
        color: DEFAULT_BUTTON_COLOR,
        textAlign: DEFAULT_BUTTON_TEXT_ALIGN,
        borderColor: DEFAULT_BUTTON_BORDER_COLOR,
        backgroundColor: DEFAULT_BUTTON_BACKGROUND_COLOR,

        ...(otherArgs.style ?? {}),
      },

      ...otherArgs,
    })

    const { disabled, type } = args

    this.type = type ?? DEFAULT_BUTTON_TYPE
    this.disabled = disabled ?? DEFAULT_BUTTON_DISABLED
  }

  setStyleHovered(): void {
    this.style.backgroundColor = this.disabled
      ? COLORS.COLOR_11
      : COLORS.COLOR_255

    this.style.borderColor = COLORS.COLOR_11
    this.style.color = COLORS.COLOR_16
  }

  setStyleDefault(): void {
    this.style.backgroundColor = COLORS.COLOR_16
    this.style.borderColor = COLORS.COLOR_40
    this.style.color = COLORS.COLOR_255
  }

  setStyleClicked(): void {
    this.style.color = COLORS.COLOR_16
    this.style.borderColor = COLORS.COLOR_255
    this.style.backgroundColor = COLORS.COLOR_240
  }

  onHoverStart(_: TerminalMouseEvent): void {
    this.setStyleHovered()
    this.render()
  }

  onHoverEnd(_: TerminalMouseEvent): void {
    this.setStyleDefault()
    this.render()
  }

  onClickStart(_: TerminalMouseEvent): void {
    this.setStyleClicked()
    this.render()
  }

  onClickEnd(_: TerminalMouseEvent): void {
    this.setStyleDefault()
    this.render()
  }
}
