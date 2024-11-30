export const ANSI_RESET = '\x1b[0m'
export const ANSI_BOLD = '\x1b[1m'
export const ANSI_UNDERLINE = '\x1b[4m'
export const ANSI_INVERSE = '\x1b[7m'
export const ANSI_HIDDEN = '\x1b[8m'
export const ANSI_STRIKETHROUGH = '\x1b[9m'

export const ANSI_BLACK = '\x1b[30m'
export const ANSI_RED = '\x1b[31m'
export const ANSI_GREEN = '\x1b[32m'
export const ANSI_YELLOW = '\x1b[33m'
export const ANSI_BLUE = '\x1b[34m'
export const ANSI_MAGENTA = '\x1b[35m'
export const ANSI_CYAN = '\x1b[36m'
export const ANSI_WHITE = '\x1b[37m'
export const ANSI_DEFAULT_FOREGROUND = '\x1b[39m'

export const ANSI_BLACK_BACKGROUND = '\x1b[40m'
export const ANSI_RED_BACKGROUND = '\x1b[41m'
export const ANSI_GREEN_BACKGROUND = '\x1b[42m'
export const ANSI_YELLOW_BACKGROUND = '\x1b[43m'
export const ANSI_BLUE_BACKGROUND = '\x1b[44m'
export const ANSI_MAGENTA_BACKGROUND = '\x1b[45m'
export const ANSI_CYAN_BACKGROUND = '\x1b[46m'
export const ANSI_WHITE_BACKGROUND = '\x1b[47m'
export const ANSI_DEFAULT_BACKGROUND = '\x1b[49m'

export const ANSI_CURSOR_UP = '\x1b[A'
export const ANSI_CURSOR_DOWN = '\x1b[B'
export const ANSI_CURSOR_RIGHT = '\x1b[C'
export const ANSI_CURSOR_LEFT = '\x1b[D'
export const ANSI_CURSOR_NEXT_LINE = '\x1b[E'
export const ANSI_CURSOR_PREVIOUS_LINE = '\x1b[F'
export const ANSI_CURSOR_POSITION = (x: number, y: number): string => (
  `\x1b[${y + 1};${x + 1}H`
)

export const ANSI_CLEAR_SCREEN = '\x1b[2J'
export const ANSI_CLEAR_LINE = '\x1b[2K'
export const ANSI_CLEAR_LINE_START = '\x1b[1K'
export const ANSI_CLEAR_LINE_END = '\x1b[0K'

export const ANSI_SCROLL_UP = '\x1b[S'
export const ANSI_SCROLL_DOWN = '\x1b[T'

export const ANSI_HIDE_CURSOR = '\x1b[?25l'
export const ANSI_SHOW_CURSOR = '\x1b[?25h'

export const ANSI_SAVE_CURSOR_POSITION = '\x1b[s'
export const ANSI_RESTORE_CURSOR_POSITION = '\x1b[u'

export const ANSI_BOLD_OFF = '\x1b[22m'
