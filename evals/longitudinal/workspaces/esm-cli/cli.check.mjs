import assert from "node:assert/strict"
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

const root = new URL(".", import.meta.url).pathname
const commandsDir = join(root, "commands")
const commandFiles = readdirSync(commandsDir).filter((file) => file.endsWith(".ts"))

assert.ok(commandFiles.includes("status.ts"), "status command must exist")

for (const file of commandFiles) {
  const source = readFileSync(join(commandsDir, file), "utf8")
  const imports = [...source.matchAll(/from\s+["'](\.{1,2}\/[^"']+)["']/g)]
  for (const match of imports) {
    const specifier = match[1]
    assert.ok(
      specifier.endsWith(".js"),
      `${file} uses extensionless relative import ${specifier}`
    )
  }
}

if (commandFiles.includes("sync.ts")) {
  const cliSource = readFileSync(join(root, "cli.ts"), "utf8")
  assert.match(cliSource, /sync/, "cli.ts must wire the sync command")
}
