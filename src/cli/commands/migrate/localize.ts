import type { Client } from "@notionhq/client"
import type { LoreServices } from "../../../services.js"
import type { Vault, VaultDatabases } from "../../../types.js"
import { throwIfNotionErrorEnvelope } from "../../../notion/client.js"
import {
  allPropertyRenames,
  bindSchemaLocale,
  dbTitlesFor,
  detectSchemaLocaleFromPropertySets,
  type SchemaLocale,
  type VaultDatabaseTitleKey,
} from "../../../notion/schema-locale.js"

export type LocalizeRenameKind = "property" | "title"

export interface LocalizeRename {
  database: VaultDatabaseTitleKey
  kind: LocalizeRenameKind
  from: string
  to: string
}

export interface LocalizePlan {
  from: SchemaLocale
  to: SchemaLocale
  renames: LocalizeRename[]
}

const DATABASE_KEYS: VaultDatabaseTitleKey[] = [
  "projects",
  "topics",
  "memories",
  "entities",
  "facts",
]

function extractDatabaseTitle(record: Record<string, unknown>): string {
  const title = record["title"]
  if (!Array.isArray(title)) return ""
  return title
    .map((block) => {
      if (!block || typeof block !== "object") return ""
      const plain = (block as { plain_text?: unknown }).plain_text
      if (typeof plain === "string") return plain
      const text = (block as { text?: { content?: unknown } }).text
      return typeof text?.content === "string" ? text.content : ""
    })
    .join("")
}

export function planLocalizeRenames(
  liveProperties: Partial<Record<VaultDatabaseTitleKey, Record<string, unknown>>>,
  liveTitles: Partial<Record<VaultDatabaseTitleKey, string>>,
  from: SchemaLocale,
  to: SchemaLocale
): LocalizeRename[] {
  if (from === to) return []
  const renames: LocalizeRename[] = []
  const sourceTitles = dbTitlesFor(from)
  const targetTitles = dbTitlesFor(to)
  const propertyRenames = allPropertyRenames(from, to)

  for (const database of DATABASE_KEYS) {
    const liveTitle = liveTitles[database]
    if (
      liveTitle &&
      liveTitle === sourceTitles[database] &&
      liveTitle !== targetTitles[database]
    ) {
      renames.push({
        database,
        kind: "title",
        from: liveTitle,
        to: targetTitles[database],
      })
    }

    const properties = liveProperties[database]
    if (!properties) continue
    for (const pair of propertyRenames[database]) {
      if (pair.from in properties && !(pair.to in properties)) {
        renames.push({
          database,
          kind: "property",
          from: pair.from,
          to: pair.to,
        })
      }
    }
  }

  return renames
}

async function retrieveLiveSchema(
  client: Client,
  vault: Vault
): Promise<{
  liveProperties: Partial<Record<VaultDatabaseTitleKey, Record<string, unknown>>>
  liveTitles: Partial<Record<VaultDatabaseTitleKey, string>>
}> {
  const liveProperties: Partial<Record<VaultDatabaseTitleKey, Record<string, unknown>>> =
    {}
  const liveTitles: Partial<Record<VaultDatabaseTitleKey, string>> = {}
  const db = vault.databases as Partial<VaultDatabases>

  await Promise.all(
    DATABASE_KEYS.map(async (key) => {
      const ref = db[key]
      if (!ref) return
      const record = (await client.databases.retrieve({
        database_id: ref.databaseId,
      })) as unknown as Record<string, unknown>
      throwIfNotionErrorEnvelope(record)
      liveTitles[key] = extractDatabaseTitle(record)
      const live = await client.dataSources.retrieve({
        data_source_id: ref.dataSourceId,
      })
      throwIfNotionErrorEnvelope(live)
      liveProperties[key] = (live as { properties: Record<string, unknown> }).properties
    })
  )

  return { liveProperties, liveTitles }
}

async function applyLocalizeRenames(
  client: Client,
  vault: Vault,
  renames: LocalizeRename[]
): Promise<void> {
  const db = vault.databases as Partial<VaultDatabases>
  for (const rename of renames) {
    const ref = db[rename.database]
    if (!ref) continue
    if (rename.kind === "title") {
      const result = await client.databases.update({
        database_id: ref.databaseId,
        title: [{ text: { content: rename.to } }],
      })
      throwIfNotionErrorEnvelope(result)
      continue
    }
    const result = await client.dataSources.update({
      data_source_id: ref.dataSourceId,
      properties: {
        [rename.from]: { name: rename.to },
      } as Parameters<Client["dataSources"]["update"]>[0]["properties"],
    })
    throwIfNotionErrorEnvelope(result)
  }
}

export async function runLocalizeMigration(
  services: LoreServices,
  options: { target: SchemaLocale; apply: boolean; dryRun?: boolean }
): Promise<LocalizePlan> {
  const planOnly = !options.apply || options.dryRun === true
  const { liveProperties, liveTitles } = await retrieveLiveSchema(
    services.client,
    services.vault.get()
  )
  const from = detectSchemaLocaleFromPropertySets(Object.values(liveProperties))
  const renames = planLocalizeRenames(liveProperties, liveTitles, from, options.target)
  const plan: LocalizePlan = { from, to: options.target, renames }

  if (renames.length === 0) {
    if (from === options.target) {
      console.log(
        `\nVault schema locale is already ${options.target}. Nothing to rename.`
      )
    } else {
      console.log(
        `\nNo database titles or property names to rename from ${from} to ${options.target}.`
      )
    }
    return plan
  }

  if (!planOnly) {
    await applyLocalizeRenames(services.client, services.vault.get(), renames)
    bindSchemaLocale(options.target)
  }

  const verb = planOnly ? "Would rename" : "Renamed"
  const titles = renames.filter((r) => r.kind === "title")
  const properties = renames.filter((r) => r.kind === "property")
  console.log(
    `\n${verb} vault UI language ${from} → ${options.target}: ` +
      `${titles.length} database title${titles.length === 1 ? "" : "s"}, ` +
      `${properties.length} propert${properties.length === 1 ? "y" : "ies"}.`
  )
  for (const rename of renames) {
    console.log(`  ${rename.database}.${rename.kind}: "${rename.from}" → "${rename.to}"`)
  }
  if (planOnly) {
    console.log(
      "\nPlan only — no changes written. Re-run with `--localize " +
        `${options.target} --yes` +
        "` to apply."
    )
  }
  return plan
}
