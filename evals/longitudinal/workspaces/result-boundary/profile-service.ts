import { err, ok, type Result } from "./result.js"

export interface UserProfile {
  id: string
  name: string
  email?: string
}

export interface CreateUserProfileInput {
  name?: string
  email?: string
}

const profiles = new Map<string, UserProfile>()

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ")
}

export function saveProfile(profile: UserProfile): Result<UserProfile> {
  if (!profile.id) return err("missing id")
  profiles.set(profile.id, profile)
  return ok(profile)
}
