import path from 'path'
import { EOL } from 'os'
import { promises as fs, Dirent } from 'fs'

import { UI } from '../ui'
import { Box } from '../widgets'
import { TerminalMouseEvent } from 'types'

const run = async (): Promise<void> => {
  const ui = new UI(process.stdout)

  const fileListBox = new Box({
    ui,
    width: 50,
    height: process.stdout.rows,
    position: { x: 0, y: 0 },
  })

  const fileContentsBox = new Box({
    ui,
    width: process.stdout.columns - 50 - 1,
    height: process.stdout.rows,
    position: { x: 51, y: 0 },
  })

  const getFileListBoxContent = async (): Promise<string> => {
    const lines: string[] = []

    await Promise.all(dirContents.map(async (dirEntry: Dirent, i: number): Promise<void> => {
      lines.push(dirEntry.name)

      if (directories.includes(dirEntry) && dirExpansionFlags[i]) {
        const nestedDirContents = await fs.readdir(path.join(__dirname, '../', `${dirEntry.name}/`))
        const nestedDirListing = nestedDirContents.map((fileName: string): string => (
          `  ${path.join(dirEntry.name, fileName)}`
        ))

        lines.push(...nestedDirListing)
      }
    }))

    return lines.join(EOL)
  }

  const dirContents = await fs.readdir(path.join(__dirname, '../'), { withFileTypes: true })
  const directories = dirContents.filter((dirEntry: Dirent): boolean => dirEntry.isDirectory())
  const dirExpansionFlags: boolean[] = directories.map(() => false)

  fileListBox.on('click:start', async (data: TerminalMouseEvent): Promise<void> => {
    if (data.x < fileListBox.position.x || data.x > fileListBox.position.x + fileListBox.width) {
      return
    }

    const lines = fileListBox.content.split(EOL)
    const lineN = data.y - fileListBox.position.y

    if (lineN < 0 || lineN > lines.length - 1) {
      return
    }

    const fileName = lines[lineN].trim()
    const dirN = directories.map(({ name }: Dirent): string => name).indexOf(fileName)

    if (dirN > -1) {
      dirExpansionFlags[dirN] = !!!dirExpansionFlags[dirN]

      fileListBox.content = await getFileListBoxContent()
      fileListBox.render()
    } else {
      fileContentsBox.content = await fs.readFile(path.join(__dirname, '../', dirContents[lineN].name), 'utf-8')
      fileContentsBox.render()
    }
  })

  fileListBox.content = await getFileListBoxContent()
  fileContentsBox.content = await fs.readFile(path.join(__dirname, '../', dirContents[0].name), 'utf-8')

  ui.render(true)
}

run().catch(console.error)