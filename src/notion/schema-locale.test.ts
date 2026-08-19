import { afterEach, describe, expect, it } from "vitest"
import {
  MEMORY_PROPS,
  MEMORY_PROPS_EN,
  MEMORY_PROPS_ZH,
  PROJECT_PROPS,
  PROJECT_PROPS_EN,
  PROJECT_PROPS_ZH,
  PROJECTS_DB_TITLE,
  allPropertyRenames,
  bindSchemaLocale,
  detectSchemaLocaleFromProperties,
  parseSchemaLocale,
  resetSchemaLocale,
} from "./schema-locale.js"

afterEach(() => {
  resetSchemaLocale()
})

describe("parseSchemaLocale", () => {
  it("defaults omitted and blank values to en", () => {
    expect(parseSchemaLocale(undefined)).toBe("en")
    expect(parseSchemaLocale("")).toBe("en")
    expect(parseSchemaLocale("  ")).toBe("en")
  })

  it("accepts en and zh-CN", () => {
    expect(parseSchemaLocale("en")).toBe("en")
    expect(parseSchemaLocale("zh-CN")).toBe("zh-CN")
  })

  it("rejects unknown locales", () => {
    expect(() => parseSchemaLocale("zh")).toThrow(/Invalid locale/)
    expect(() => parseSchemaLocale("fr")).toThrow(/zh-CN/)
  })
})

describe("bindSchemaLocale", () => {
  it("switches live property names and database titles", () => {
    bindSchemaLocale("zh-CN")
    expect(PROJECT_PROPS.NAME).toBe(PROJECT_PROPS_ZH.NAME)
    expect(MEMORY_PROPS.TITLE).toBe(MEMORY_PROPS_ZH.TITLE)
    expect(PROJECTS_DB_TITLE).toBe("项目")

    resetSchemaLocale()
    expect(PROJECT_PROPS.NAME).toBe(PROJECT_PROPS_EN.NAME)
    expect(MEMORY_PROPS.TITLE).toBe(MEMORY_PROPS_EN.TITLE)
    expect(PROJECTS_DB_TITLE).toBe("Projects")
  })
})

describe("detectSchemaLocaleFromProperties", () => {
  it("detects a Chinese Projects schema", () => {
    expect(detectSchemaLocaleFromProperties({ 路径: { rich_text: {} } })).toBe("zh-CN")
  })

  it("detects an English Projects schema", () => {
    expect(detectSchemaLocaleFromProperties({ Path: { rich_text: {} } })).toBe("en")
  })

  it("returns null when no discriminator is present", () => {
    expect(detectSchemaLocaleFromProperties({ Tags: { multi_select: {} } })).toBeNull()
  })
})

describe("allPropertyRenames", () => {
  it("maps every English property onto a distinct Chinese name", () => {
    const renames = allPropertyRenames("en", "zh-CN")
    for (const [database, pairs] of Object.entries(renames)) {
      const fromNames = pairs.map((pair) => pair.from)
      const toNames = pairs.map((pair) => pair.to)
      expect(new Set(fromNames).size, database).toBe(fromNames.length)
      expect(new Set(toNames).size, database).toBe(toNames.length)
      expect(pairs.length, database).toBeGreaterThan(0)
      for (const pair of pairs) {
        expect(pair.from).not.toBe(pair.to)
      }
    }
  })

  it("is empty when the source and target locale match", () => {
    expect(allPropertyRenames("en", "en").projects).toEqual([])
  })
})
