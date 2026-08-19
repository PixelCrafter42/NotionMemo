/**
 * Vault UI locale for Notion database titles and property names.
 *
 * TypeScript keys stay stable (`NAME`, `STATUS`, …). The string values
 * are the Notion API / UI names and may be English or Chinese. Select
 * option values (`active`, `certain`, `uses`, …) stay English — they
 * are closed enums in application code.
 *
 * Existing vaults keep the language they were created with. New vaults
 * pick a locale at `lore init --locale`. `lore migrate --localize`
 * renames an existing vault in place.
 */

export const SCHEMA_LOCALES = ["en", "zh-CN"] as const
export type SchemaLocale = (typeof SCHEMA_LOCALES)[number]

export const DEFAULT_SCHEMA_LOCALE: SchemaLocale = "en"

export function isSchemaLocale(value: string): value is SchemaLocale {
  return (SCHEMA_LOCALES as readonly string[]).includes(value)
}

export function parseSchemaLocale(raw: string | undefined): SchemaLocale {
  if (raw === undefined || raw.trim() === "") return DEFAULT_SCHEMA_LOCALE
  const value = raw.trim()
  if (isSchemaLocale(value)) return value
  throw new Error(`Invalid locale "${raw}". Use ${SCHEMA_LOCALES.join(" or ")}.`)
}

// ---------------------------------------------------------------------------
// Database titles
// ---------------------------------------------------------------------------

export const DB_TITLES_EN = {
  projects: "Projects",
  topics: "Topics",
  memories: "Memories",
  entities: "Entities",
  facts: "Facts",
} as const

export const DB_TITLES_ZH = {
  projects: "项目",
  topics: "主题",
  memories: "记忆",
  entities: "实体",
  facts: "事实",
} as const

export type VaultDatabaseTitleKey = keyof typeof DB_TITLES_EN

export const DB_TITLE_ALIASES: Record<VaultDatabaseTitleKey, readonly string[]> = {
  projects: [DB_TITLES_EN.projects, DB_TITLES_ZH.projects],
  topics: [DB_TITLES_EN.topics, DB_TITLES_ZH.topics],
  memories: [DB_TITLES_EN.memories, DB_TITLES_ZH.memories],
  entities: [DB_TITLES_EN.entities, DB_TITLES_ZH.entities],
  facts: [DB_TITLES_EN.facts, DB_TITLES_ZH.facts],
}

export type VaultDbTitles = { readonly [K in VaultDatabaseTitleKey]: string }

export function dbTitlesFor(locale: SchemaLocale): VaultDbTitles {
  return locale === "zh-CN" ? DB_TITLES_ZH : DB_TITLES_EN
}

// ---------------------------------------------------------------------------
// Property names
// ---------------------------------------------------------------------------

export const PROJECT_PROPS_EN = {
  NAME: "Name",
  TYPE: "Type",
  PATH: "Path",
  STATUS: "Status",
  DESCRIPTION: "Description",
} as const

export const PROJECT_PROPS_ZH = {
  NAME: "名称",
  TYPE: "类型",
  PATH: "路径",
  STATUS: "状态",
  DESCRIPTION: "描述",
} as const satisfies { [K in keyof typeof PROJECT_PROPS_EN]: string }

export const TOPIC_PROPS_EN = {
  NAME: "Name",
  PROJECT: "Project",
  DESCRIPTION: "Description",
} as const

export const TOPIC_PROPS_ZH = {
  NAME: "名称",
  PROJECT: "项目",
  DESCRIPTION: "描述",
} as const satisfies { [K in keyof typeof TOPIC_PROPS_EN]: string }

export const MEMORY_PROPS_EN = {
  TITLE: "Title",
  PROJECT: "Project",
  TOPIC: "Topic",
  SOURCE: "Source",
  KIND: "Kind",
  TASK_STATE: "Task State",
  BLOCKED_BY: "Blocked By",
  ENTITY: "Entity",
  STATUS: "Status",
  CONFIDENCE: "Confidence",
  CONFIDENCE_SCORE: "Confidence Score",
  TOPIC_KEY: "Topic Key",
  REVISION_COUNT: "Revision Count",
  COMPARE_NOTES: "Compare Notes",
  PROMOTION_SOURCE_KEY: "Promotion Source Key",
  REVIEW_BY: "Review By",
  DONE_AT: "Done At",
  DECIDED_AT: "Decided At",
  LAST_REFERENCED_AT: "Last Referenced At",
  ALTERNATIVES: "Alternatives",
  CONSEQUENCES: "Consequences",
  AUTHOR: "Author",
  AGENT: "Agent",
  TAGS: "Tags",
  KEYWORDS: "Keywords",
  SYNOPSIS: "Synopsis",
  EXPIRES_ON: "Expires On",
  SESSION: "Session",
  SUPERSEDES: "Supersedes",
  AFFECTS: "Affects",
  COMPARED_WITH: "Compared With",
  SCOPE_KIND: "Scope Kind",
  SCOPE_KEY: "Scope Key",
  AUDIENCE: "Audience",
  LIFETIME: "Lifetime",
  EXPIRES_AT: "Expires At",
  PINNED: "Pinned",
  PINNED_PRIORITY: "Pinned Priority",
  MUTABILITY: "Mutability",
} as const

export const MEMORY_PROPS_ZH = {
  TITLE: "标题",
  PROJECT: "项目",
  TOPIC: "主题",
  SOURCE: "来源",
  KIND: "种类",
  TASK_STATE: "任务状态",
  BLOCKED_BY: "阻塞原因",
  ENTITY: "实体",
  STATUS: "状态",
  CONFIDENCE: "置信度",
  CONFIDENCE_SCORE: "置信分数",
  TOPIC_KEY: "主题键",
  REVISION_COUNT: "修订次数",
  COMPARE_NOTES: "比较备注",
  PROMOTION_SOURCE_KEY: "晋升源键",
  REVIEW_BY: "复查日期",
  DONE_AT: "完成于",
  DECIDED_AT: "决定于",
  LAST_REFERENCED_AT: "最近引用",
  ALTERNATIVES: "备选方案",
  CONSEQUENCES: "后果",
  AUTHOR: "作者",
  AGENT: "智能体",
  TAGS: "标签",
  KEYWORDS: "关键词",
  SYNOPSIS: "摘要",
  EXPIRES_ON: "过期日",
  SESSION: "会话",
  SUPERSEDES: "取代",
  AFFECTS: "影响",
  COMPARED_WITH: "比较对象",
  SCOPE_KIND: "作用域种类",
  SCOPE_KEY: "作用域键",
  AUDIENCE: "受众",
  LIFETIME: "生命周期",
  EXPIRES_AT: "过期于",
  PINNED: "已固定",
  PINNED_PRIORITY: "固定优先级",
  MUTABILITY: "可变性",
} as const satisfies { [K in keyof typeof MEMORY_PROPS_EN]: string }

export const ENTITY_PROPS_EN = {
  NAME: "Name",
  ALIASES: "Aliases",
  KIND: "Kind",
  DESCRIPTION: "Description",
  PROJECT: "Project",
  SOURCE: "Source",
} as const

export const ENTITY_PROPS_ZH = {
  NAME: "名称",
  ALIASES: "别名",
  KIND: "种类",
  DESCRIPTION: "描述",
  PROJECT: "项目",
  SOURCE: "来源",
} as const satisfies { [K in keyof typeof ENTITY_PROPS_EN]: string }

export const FACT_PROPS_EN = {
  SUBJECT: "Subject",
  PREDICATE: "Predicate",
  OBJECT: "Object",
  PROJECT: "Project",
  SOURCE: "Source",
  CONFIDENCE: "Confidence",
  CONFIDENCE_SCORE: "Confidence Score",
  VALID_FROM: "Valid From",
  VALID_UNTIL: "Valid Until",
  OBSERVED_AT: "Observed At",
  INVALIDATED_AT: "Invalidated At",
  INVALIDATED_BY: "Invalidated By",
  REVIEW_BY: "Review By",
  LAST_REFERENCED_AT: "Last Referenced At",
  DEDUP_KEY: "DedupKey",
  SUBJECT_KEY: "SubjectKey",
  SUBJECT_ENTITY: "SubjectEntity",
  OBJECT_ENTITY: "ObjectEntity",
  SCOPE_KIND: "Scope Kind",
  SCOPE_KEY: "Scope Key",
  AUDIENCE: "Audience",
  LIFETIME: "Lifetime",
  EXPIRES_AT: "Expires At",
} as const

export const FACT_PROPS_ZH = {
  SUBJECT: "主语",
  PREDICATE: "谓语",
  OBJECT: "宾语",
  PROJECT: "项目",
  SOURCE: "来源",
  CONFIDENCE: "置信度",
  CONFIDENCE_SCORE: "置信分数",
  VALID_FROM: "生效自",
  VALID_UNTIL: "生效至",
  OBSERVED_AT: "观察于",
  INVALIDATED_AT: "作废于",
  INVALIDATED_BY: "作废依据",
  REVIEW_BY: "复查日期",
  LAST_REFERENCED_AT: "最近引用",
  DEDUP_KEY: "去重键",
  SUBJECT_KEY: "主语键",
  SUBJECT_ENTITY: "主语实体",
  OBJECT_ENTITY: "宾语实体",
  SCOPE_KIND: "作用域种类",
  SCOPE_KEY: "作用域键",
  AUDIENCE: "受众",
  LIFETIME: "生命周期",
  EXPIRES_AT: "过期于",
} as const satisfies { [K in keyof typeof FACT_PROPS_EN]: string }

export type ProjectPropNames = { readonly [K in keyof typeof PROJECT_PROPS_EN]: string }
export type TopicPropNames = { readonly [K in keyof typeof TOPIC_PROPS_EN]: string }
export type MemoryPropNames = { readonly [K in keyof typeof MEMORY_PROPS_EN]: string }
export type EntityPropNames = { readonly [K in keyof typeof ENTITY_PROPS_EN]: string }
export type FactPropNames = { readonly [K in keyof typeof FACT_PROPS_EN]: string }

export function projectPropsFor(locale: SchemaLocale): ProjectPropNames {
  return locale === "zh-CN" ? PROJECT_PROPS_ZH : PROJECT_PROPS_EN
}

export function topicPropsFor(locale: SchemaLocale): TopicPropNames {
  return locale === "zh-CN" ? TOPIC_PROPS_ZH : TOPIC_PROPS_EN
}

export function memoryPropsFor(locale: SchemaLocale): MemoryPropNames {
  return locale === "zh-CN" ? MEMORY_PROPS_ZH : MEMORY_PROPS_EN
}

export function entityPropsFor(locale: SchemaLocale): EntityPropNames {
  return locale === "zh-CN" ? ENTITY_PROPS_ZH : ENTITY_PROPS_EN
}

export function factPropsFor(locale: SchemaLocale): FactPropNames {
  return locale === "zh-CN" ? FACT_PROPS_ZH : FACT_PROPS_EN
}

// ---------------------------------------------------------------------------
// Live bindings
// ---------------------------------------------------------------------------

let activeLocale: SchemaLocale = DEFAULT_SCHEMA_LOCALE

export let PROJECT_PROPS: typeof PROJECT_PROPS_EN = PROJECT_PROPS_EN
export let TOPIC_PROPS: typeof TOPIC_PROPS_EN = TOPIC_PROPS_EN
export let MEMORY_PROPS: typeof MEMORY_PROPS_EN = MEMORY_PROPS_EN
export let ENTITY_PROPS: typeof ENTITY_PROPS_EN = ENTITY_PROPS_EN
export let FACT_PROPS: typeof FACT_PROPS_EN = FACT_PROPS_EN

export let PROJECTS_DB_TITLE: string = DB_TITLES_EN.projects
export let TOPICS_DB_TITLE: string = DB_TITLES_EN.topics
export let MEMORIES_DB_TITLE: string = DB_TITLES_EN.memories
export let ENTITIES_DB_TITLE: string = DB_TITLES_EN.entities
export let FACTS_DB_TITLE: string = DB_TITLES_EN.facts

export function activeSchemaLocale(): SchemaLocale {
  return activeLocale
}

export function bindSchemaLocale(locale: SchemaLocale): void {
  activeLocale = locale
  const titles = dbTitlesFor(locale)
  PROJECT_PROPS = projectPropsFor(locale) as typeof PROJECT_PROPS_EN
  TOPIC_PROPS = topicPropsFor(locale) as typeof TOPIC_PROPS_EN
  MEMORY_PROPS = memoryPropsFor(locale) as typeof MEMORY_PROPS_EN
  ENTITY_PROPS = entityPropsFor(locale) as typeof ENTITY_PROPS_EN
  FACT_PROPS = factPropsFor(locale) as typeof FACT_PROPS_EN
  PROJECTS_DB_TITLE = titles.projects
  TOPICS_DB_TITLE = titles.topics
  MEMORIES_DB_TITLE = titles.memories
  ENTITIES_DB_TITLE = titles.entities
  FACTS_DB_TITLE = titles.facts
}

export function resetSchemaLocale(): void {
  bindSchemaLocale(DEFAULT_SCHEMA_LOCALE)
}

/**
 * Discriminators that appear on only one core database, so a single
 * properties object can identify the vault language.
 */
const LOCALE_DISCRIMINATORS: Array<{ zh: string; en: string }> = [
  { zh: PROJECT_PROPS_ZH.PATH, en: PROJECT_PROPS_EN.PATH },
  { zh: MEMORY_PROPS_ZH.TITLE, en: MEMORY_PROPS_EN.TITLE },
  { zh: FACT_PROPS_ZH.SUBJECT, en: FACT_PROPS_EN.SUBJECT },
  { zh: ENTITY_PROPS_ZH.ALIASES, en: ENTITY_PROPS_EN.ALIASES },
  { zh: TOPIC_PROPS_ZH.PROJECT, en: TOPIC_PROPS_EN.PROJECT },
]

export function detectSchemaLocaleFromProperties(
  properties: Record<string, unknown> | undefined
): SchemaLocale | null {
  if (!properties) return null
  for (const { zh, en } of LOCALE_DISCRIMINATORS) {
    if (zh in properties) return "zh-CN"
    if (en in properties) return "en"
  }
  return null
}

export function detectSchemaLocaleFromPropertySets(
  propertySets: Array<Record<string, unknown> | undefined>
): SchemaLocale {
  for (const properties of propertySets) {
    const detected = detectSchemaLocaleFromProperties(properties)
    if (detected) return detected
  }
  return DEFAULT_SCHEMA_LOCALE
}

export function propertyRenamesFor(
  from: SchemaLocale,
  to: SchemaLocale,
  source: Record<string, string>,
  target: Record<string, string>
): Array<{ from: string; to: string }> {
  if (from === to) return []
  const renames: Array<{ from: string; to: string }> = []
  const seen = new Set<string>()
  for (const key of Object.keys(source)) {
    const fromName = source[key]
    const toName = target[key]
    if (!fromName || !toName || fromName === toName) continue
    const pair = `${fromName}\u0000${toName}`
    if (seen.has(pair)) continue
    seen.add(pair)
    renames.push({ from: fromName, to: toName })
  }
  return renames
}

export function allPropertyRenames(
  from: SchemaLocale,
  to: SchemaLocale
): Record<VaultDatabaseTitleKey, Array<{ from: string; to: string }>> {
  return {
    projects: propertyRenamesFor(from, to, projectPropsFor(from), projectPropsFor(to)),
    topics: propertyRenamesFor(from, to, topicPropsFor(from), topicPropsFor(to)),
    memories: propertyRenamesFor(from, to, memoryPropsFor(from), memoryPropsFor(to)),
    entities: propertyRenamesFor(from, to, entityPropsFor(from), entityPropsFor(to)),
    facts: propertyRenamesFor(from, to, factPropsFor(from), factPropsFor(to)),
  }
}
