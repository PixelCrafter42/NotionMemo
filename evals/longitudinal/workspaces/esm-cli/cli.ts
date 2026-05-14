import { status } from "./commands/status.js"

const commands = new Map<string, () => string>([["status", status]])

export function registerCommand(name: string, run: () => string): void {
  commands.set(name, run)
}

export function runCommand(name: string): string {
  const command = commands.get(name)
  if (!command) return `unknown command: ${name}`
  return command()
}
