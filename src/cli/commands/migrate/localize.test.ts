import { describe, expect, it } from "vitest"
import { planLocalizeRenames } from "./localize.js"
import {
  DB_TITLES_EN,
  DB_TITLES_ZH,
  MEMORY_PROPS_EN,
  MEMORY_PROPS_ZH,
  PROJECT_PROPS_EN,
  PROJECT_PROPS_ZH,
} from "../../../notion/schema-locale.js"

describe("planLocalizeRenames", () => {
  it("renames English titles and properties to Chinese", () => {
    const renames = planLocalizeRenames(
      {
        projects: {
          [PROJECT_PROPS_EN.NAME]: { title: {} },
          [PROJECT_PROPS_EN.PATH]: { rich_text: {} },
        },
        memories: {
          [MEMORY_PROPS_EN.TITLE]: { title: {} },
        },
      },
      {
        projects: DB_TITLES_EN.projects,
        memories: DB_TITLES_EN.memories,
      },
      "en",
      "zh-CN"
    )

    expect(renames).toContainEqual({
      database: "projects",
      kind: "title",
      from: "Projects",
      to: "项目",
    })
    expect(renames).toContainEqual({
      database: "projects",
      kind: "property",
      from: PROJECT_PROPS_EN.NAME,
      to: PROJECT_PROPS_ZH.NAME,
    })
    expect(renames).toContainEqual({
      database: "memories",
      kind: "property",
      from: MEMORY_PROPS_EN.TITLE,
      to: MEMORY_PROPS_ZH.TITLE,
    })
  })

  it("skips properties that already have the target name", () => {
    const renames = planLocalizeRenames(
      {
        projects: {
          [PROJECT_PROPS_ZH.NAME]: { title: {} },
          [PROJECT_PROPS_EN.PATH]: { rich_text: {} },
        },
      },
      { projects: DB_TITLES_ZH.projects },
      "en",
      "zh-CN"
    )

    expect(renames.find((row) => row.kind === "title")).toBeUndefined()
    expect(renames).toContainEqual({
      database: "projects",
      kind: "property",
      from: PROJECT_PROPS_EN.PATH,
      to: PROJECT_PROPS_ZH.PATH,
    })
    expect(
      renames.find((row) => row.kind === "property" && row.from === PROJECT_PROPS_EN.NAME)
    ).toBeUndefined()
  })

  it("is a no-op when the vault is already in the target locale", () => {
    expect(
      planLocalizeRenames(
        { projects: { [PROJECT_PROPS_ZH.PATH]: { rich_text: {} } } },
        { projects: DB_TITLES_ZH.projects },
        "zh-CN",
        "zh-CN"
      )
    ).toEqual([])
  })
})
