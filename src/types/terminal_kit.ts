export interface TerminalKeyEvent {
  isCharacter: boolean
  codepoint: number
  code: number | Buffer
}

export interface TerminalMouseEvent {
  x: number
  y: number
  ctrl: boolean
  alt: boolean
  shift: boolean
  left: boolean
  right: boolean
  xFrom: number
  yFrom: number
}

export enum TerminalMouseEventName {
  MouseLeftButtonPressed = 'MOUSE_LEFT_BUTTON_PRESSED',
  MouseMiddleButtonPressed = 'MOUSE_MIDDLE_BUTTON_PRESSED',
  MouseRightButtonPressed = 'MOUSE_RIGHT_BUTTON_PRESSED',
  MouseOtherButtonPressed = 'MOUSE_OTHER_BUTTON_PRESSED',
  MouseLeftButtonReleased = 'MOUSE_LEFT_BUTTON_RELEASED',
  MouseMiddleButtonReleased = 'MOUSE_MIDDLE_BUTTON_RELEASED',
  MouseRightButtonReleased = 'MOUSE_RIGHT_BUTTON_RELEASED',
  MouseOtherButtonReleased = 'MOUSE_OTHER_BUTTON_RELEASED',
  MouseWheelUp = 'MOUSE_WHEEL_UP',
  MouseWheelDown = 'MOUSE_WHEEL_DOWN',
  MouseMotion = 'MOUSE_MOTION',
}
