import { readStatus } from "../status-store"

export function status(): string {
  return readStatus()
}
