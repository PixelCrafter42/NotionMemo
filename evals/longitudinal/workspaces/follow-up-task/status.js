export function statusText() {
  throw new Error("status output is not implemented yet")
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(statusText())
}
