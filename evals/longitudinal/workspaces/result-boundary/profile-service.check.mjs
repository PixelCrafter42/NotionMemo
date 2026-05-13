import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const source = readFileSync(new URL("./profile-service.ts", import.meta.url), "utf8")

assert.match(
  source,
  /export\s+(?:async\s+)?function\s+fetchUserProfile/,
  "fetchUserProfile must be exported"
)
assert.match(
  source,
  /return\s+(?:ok|err)\(/,
  "service-boundary functions must return Result helpers"
)
assert.doesNotMatch(
  source,
  /throw\s+new\s+Error/,
  "service-boundary functions must not throw new Error"
)
