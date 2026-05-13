import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { readFileSync } from "node:fs"

function runStatus(...args) {
  const result = spawnSync(process.execPath, ["status.js", ...args], {
    cwd: new URL(".", import.meta.url).pathname,
    encoding: "utf8",
  })
  assert.equal(result.status, 0, result.stderr)
  return result.stdout
}

const text = runStatus()
assert.equal(text, "status: ok\n")

const source = readFileSync(new URL("./status.js", import.meta.url), "utf8")
if (source.includes("--json")) {
  const json = runStatus("--json")
  const parsed = JSON.parse(json)
  assert.equal(parsed.status, "ok")
  assert.equal(parsed.service, "profile-service")
  assert.equal(parsed.mode, "automation")
}

assert.equal(runStatus(), "status: ok\n")
