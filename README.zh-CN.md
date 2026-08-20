**Language / 语言:** [English](README.md) | [简体中文](README.zh-CN.md)

# Lore

基于 Notion 的 AI 记忆系统。

Lore 给 AI 助手一套持久、可共享的记忆：它把对话、决策、后续任务和稳定关系存成 Notion 页面，团队成员和任意 agent 会话都能再读回来。凡是走 [Model Context Protocol](https://modelcontextprotocol.io) 的环境（Claude Code、Codex、Cursor、OMP 以及其他 MCP 宿主）都可以在同一座 vault 里回忆、保存和推理，所以上下文能扛住 `/clear`、新分支，以及人与人之间的交接。

底层上，Lore 把一座 vault 组织成五个核心 Notion 数据库：项目（Projects）、主题（Topics）、记忆（Memories）、实体（Entities，规范句柄解析）和事实（Facts）。同一套领域服务支撑三个入口：给 AI 助手用的 MCP 服务器、给人用的 CLI，以及在受支持宿主里自动加载上下文、保存会话的 hook 命令。

## 中文界面

新建 vault 时加上 `--locale zh-CN`，五个数据库的**标题和字段名**会建成中文（例如「项目」「名称」「状态」）。下拉选项值（`active`、`certain`、`uses` 等）仍保持英文，因为它们是程序里的枚举，改掉会破坏读写。

```bash
lore init --locale zh-CN
# 或指定已有页面：
lore init <page-id> --locale zh-CN
```

已经建成的英文 vault 不要重跑 `lore init`。先预览再改名：

```bash
lore migrate --localize zh-CN
lore migrate --localize zh-CN --yes
```

也可以写回英文：`lore migrate --localize en`（同样默认只预览，加 `--yes` 才执行）。

`.lore.yaml` 里的 `locale: zh-CN` 只记录意图；真正读写用的字段名以 Notion 里现有 schema 为准。

## 快速开始

### 1. 安装 Lore

#### 从 npm 安装（推荐）

```bash
npm install -g @notionhq/lore
# 或
npm install -D @notionhq/lore
```

公共 npm 不需要配置 registry，也不需要 package token。

#### 从源码构建

```bash
git clone https://github.com/makenotion/lore.git
cd lore && npm install && npm run build && npm link
```

`npm link` 会把当前克隆里的 `lore` 挂到全局 `PATH`。用 `lore --version` 确认安装成功，然后继续下面第 2 步。

项目本地安装时，在项目里跑 `npx lore <command>`，或在 `package.json` 里加一条 `lore` script。Yarn PnP 的接线方式见 [`docs/dev-dependency-install.md`](docs/dev-dependency-install.md)，团队用它在仓库里共享助手配置。

### 2. 加入已有的共享 Vault

大多数人应该加入一座已经初始化好的共享 vault。Lore vault 是一个已经包含五个数据库（项目、主题、记忆、实体、事实）的 Notion 页面。加入的意思是：把本地 `.lore.yaml` 指到共享的 `vault.pageId`；不要对团队负责人已经建好的共享页再跑一遍数据库初始化。

`.lore.yaml` 只存在本地。不要提交进版本库；像 `vault.pageId` 这样的共享值通过入职文档分发，而不是提交配置。即使是不含凭证的共享 vault 配置，当前政策也要求留在 git 之外。

Notion 页面 ID 是访问定位符，不是持有密钥：知道页面 ID 并不会授权访问，除非调用方的 Notion token 本来就能读那一页。即便如此，也要把 `vault.pageId` 留在版本库外，避免公开仓库的外部克隆自动打到维护者的 vault。如果个人或误提交的页面 ID 进了 git 历史，先清工作树，再和页面所有者决定是换页还是改写历史。

#### Notion 内部工程师 + 共享 vault

走 Lore 的 ntn 认证。需要时会自动安装 `ntn`，运行 `ntn login`，并把每人一份的 token 存到 Lore 能读到的位置。

```bash
# 把本地配置指到已经初始化的共享 vault。
# 不要对已有共享 vault 再跑数据库初始化。
cat > .lore.yaml <<'YAML'
vault:
  pageId: "<shared-vault-page-id>"
YAML

lore auth --login
lore auth --status
lore status
```

#### 外部使用者 + 共享 vault

在 `notion.so/developers/tokens` 创建 Notion Personal Access Token，然后通过 Notion SDK 的标准环境变量使用。团队落地不要用 `notion.so/profile/integrations` 里的 `secret_` 集成 token；它们会让所有使用同一集成的人挤在同一个限流桶里。在跑 `lore install` 并重启助手之前，把 `NOTION_API_TOKEN` 写进 shell profile 或助手宿主环境。

```bash
export NOTION_API_TOKEN="<notion-pat>"

# 把本地配置指到已经初始化的共享 vault。
# 不要对已有共享 vault 再跑数据库初始化。
cat > .lore.yaml <<'YAML'
vault:
  pageId: "<shared-vault-page-id>"
YAML

lore auth --status
lore status
```

最后两条命令确认 Lore 能解析认证并读到 vault。通过后再做第 3 步的助手配置。安装或改配置后重启 / 重连助手，让它重新加载 MCP 服务器和 hooks。

Token 解析顺序是 `NOTION_API_TOKEN` → ntn 解析出的 `auth.json`。先命中的源生效。完整优先级、多 workspace 选择和排错见 [`docs/authentication.md`](docs/authentication.md)。

如果安装已经坏了、下一步不清楚，在项目里跑 `lore doctor`。它只读检查配置发现、认证、vault 访问、MCP 宿主配置、hooks，以及最近的后台 hook 失败，最后给出一条优先的下一步。

### 3. 配置助手

```bash
# 内部 ntn 路径：
lore install --ntn

# 外部 PAT 路径，先 export NOTION_API_TOKEN：
lore install
```

两条安装路径都会配置所有受支持的助手集成（`--client all`，包括 OMP），并补齐旧安装缺的一侧。用 `--client` 可以只装一个。走内部 ntn 时，作用域到单个 client 的命令也要带 `--ntn`；走 PAT 并已经 export `NOTION_API_TOKEN` 时不要加：

```bash
lore install --ntn --client claude
lore install --ntn --client codex
lore install --ntn --client cursor
lore install --ntn --client omp
lore install --ntn --client cursor --cursor-global
```

- `claude`：写 Claude Code 设置以及 `.mcp.json`
- `codex`：写 `.codex/config.toml` 以及 `.codex/hooks.json`
- `cursor`：写 `<projectDir>/.cursor/mcp.json`
  （`--cursor-global` 改为写 `~/.cursor/mcp.json`）
- `omp`：写项目的 `.omp/mcp.json`

OMP 发现配置时，原生 `.omp/mcp.json` 优先于根目录 `.mcp.json`。OMP 能用 Lore 的 MCP 工具，但不装 Claude/Codex 的生命周期 hooks；改配置后重启 OMP 或跑 `/mcp reload`。

Codex 只给受信任项目加载项目级 `.codex/*` 文件。

Cursor 的 MCP 运行时目前不支持会话结束 / Stop hooks，所以 Cursor 安装只写 MCP 条目；Stop 触发的自动保存和分离的 auto-digest 只在 Claude Code 或 Codex 下运行。回忆 / 保存 / 扫描在 Claude Code、Codex、Cursor 和 OMP 上行为相同。

#### 其他 MCP 宿主

`lore install --client` 没有直接支持的 agent，可以跑 `lore install --print-config json` 或 `lore install --print-config toml`，把打出来的 MCP 片段贴进宿主配置。宿主说明和 hook 限制见 [`docs/mcp-hosts.md`](docs/mcp-hosts.md)。OMP 已经原生支持，不要对 OMP 用 `--print-config`。

`lore install` 或手改宿主配置后，重启或重连助手以重新加载 MCP 服务器。OMP 也可以 `/mcp reload`；OMP 不安装 Lore 生命周期 hooks。

### 4. 进阶和维护流程

#### 团队负责人 / 第一次共享 vault 引导

只有在第一次创建共享 vault 数据库时走这条路。选好或建好团队要共享的 Notion 页面，确认认证源能写它，然后：

```bash
lore init <page-id> --locale zh-CN
```

这条命令会在页面里创建五个数据库，并写入本地 `.lore.yaml`。之后加入的人走第 2 步，不要再初始化一遍。

每人入职流程和团队负责人手册见 [`docs/team-rollout.md`](docs/team-rollout.md)。

#### 个人或草稿 Vault

个人 vault 或入职草稿可以用无参流程：用当前认证源在 workspace 级创建页面。如果解析不到认证，会自动安装 ntn、跑 `ntn login`，再写 `.lore.yaml`：

```bash
lore init --locale zh-CN                            # 默认标题: "Lore Vault - <basename(cwd)>"
lore init --locale zh-CN --name "Lore Vault Widget" # 显式标题
```

不走 ntn 时，在 `notion.so/developers/tokens` 创建 Personal Access Token，设置 Notion SDK 标准环境变量，并确认操作者的 Notion 账号能访问 vault 页面，再引导新 vault：

```bash
export NOTION_API_TOKEN="<notion-pat>"
```

#### 开发环境

只有在你明确要一座开发环境 vault 时才用：

```bash
lore init --locale zh-CN --ntn-env dev
```

如果现有 ntn 认证指向的环境和 `--ntn-env` 不一致，Lore 以退出码 1 结束并给出恢复说明（通常是 `ntn logout && NOTION_KEYRING=0 NOTION_ENV=<env> ntn login`），而不会静默在错误环境里建 vault。

自己跑 `ntn` 时，登录前设置 `NOTION_KEYRING=0`。`ntn` 默认走 macOS Keychain，Lore 读不到；这个环境变量会改成文件模式，写到 `~/.config/notion/auth.json`：

```bash
NOTION_KEYRING=0 ntn login
```

Lore 会自动读这份 `auth.json`。如果你还用 `ntn` 做别的工具，持久的 shell-rc 设置见 [`docs/team-rollout.md#known-gotcha-direct-ntn-login-outside-lore`](docs/team-rollout.md#known-gotcha-direct-ntn-login-outside-lore)。

#### 给已有 Vault 刷新认证

本地 `.lore.yaml` 已经指向配置好的 vault 时，用下面的命令刷新 ntn 认证并预检访问：

```bash
lore auth --login
```

旧 token 源对新安装无效。`LORE_NOTION_TOKEN` 不再作为认证源读取；解析不到受支持的源时，Lore 只会把它当作迁移提示提一句。`.lore.yaml` 里任何 `auth.token` 都会在加载配置时被拒绝。Personal Access Token 用 `NOTION_API_TOKEN`，ntn 认证用 `lore auth --login`。

#### 旧版四数据库 Vault 迁移

在引入实体数据库之前创建的 vault 需要先做一次引导，再回填实体：先跑 `lore vault ensure-entities`，再用 `lore migrate --build-entities --allow-unscoped` 预览整库回填，在安静窗口跑 `lore migrate --build-entities --allow-unscoped --yes` 规范化事实图。两条命令都可以加 `--project <name>` 做项目范围。

### 5. 教助手使用 Lore

`lore install` 会把 MCP 服务器和 hooks 接到助手宿主，但助手仍需要仓库内的说明，才会优先用共享 Lore vault 存团队知识。在根目录 `AGENTS.md` 里加一节「Memory and note-taking」；如果仓库用 Claude Code，再镜像到 `CLAUDE.md` 或其他宿主指令文件。

最小起步示例：

```markdown
### Memory and note-taking

- Use Lore for cross-session and cross-team knowledge. Lore stores memories,
  facts, decisions, and tasks in the shared vault, so every team member and
  agent session benefits. Prefer Lore over file-based memory for anything the
  team should know.
- Use file-based memory only for personal preferences or local-only context
  that should not be shared.
- At session start, call `lore-context` with `action: "wake-up"` to load recent
  project context when the tool is available.
- In Codex, automatic wake-up ranks against the first prompt. After `/clear` or
  a major topic pivot, call `lore-context` again with `action: "wake-up"` and
  `userQuery` set to the new task prompt.
- Save non-obvious discoveries with `lore-memory` and `action: "save"`.
- Record architectural decisions with `lore-decision` and `action: "create"`.
- Record durable component relationships with `lore-fact` and
  `action: "create"` after saving a supporting memory; pass
  `sourceMemoryId`, or pass `agent` + `session` so Lore can auto-link the
  fact to the earlier memory in the same process.
- Track follow-up work with `lore-task` and `action: "create"`; close tasks
  with `action: "close"` as soon as the work is done or cancelled.
```

按仓库改这段说明。例如 Lore 是 Yarn PnP 的 devDependency 时，告诉助手 CLI 用 `yarn run -T lore <subcommand>`，MCP 工具名仍是原来的 `lore-*`。

## 数据模型

一座 vault 是包含五个核心数据库的 Notion 页面：

| 数据库 | 标题字段 | 主要字段 | 关系 |
| ------------ | -------------- | ------------------------------------------------------ | ----------------------------------------------------- |
| **项目 / Projects** | 名称 / Name | 类型（project/person/agent）、路径、状态、描述 | -- |
| **主题 / Topics** | 名称 / Name | 描述 | 项目 |
| **记忆 / Memories** | 标题 / Title | 来源、作者、智能体、标签、会话 + 页面正文 | 项目、主题 |
| **实体 / Entities** | 名称 / Name | 别名、种类、描述 | 项目、来源（记忆） |
| **事实 / Facts** | 主语 / Subject | 谓语、宾语、生效自、生效至、置信度 | 项目、来源（记忆）、主语实体、宾语实体 |

`lore init` 会在新 vault 上创建全部五个数据库。实体数据库出现之前创建的 vault 只有四个（没有实体）；需要一次性旧版迁移：`lore vault ensure-entities` 创建实体库，并给事实加上 `SubjectEntity` / `ObjectEntity` 关系列。整库回填用 `lore migrate --build-entities --allow-unscoped` 规划、`lore migrate --build-entities --allow-unscoped --yes` 执行，或两条都加 `--project <name>` 做项目范围，填上还没有关系值的历史行。见 [`docs/team-rollout.md#entities-database-cutover`](docs/team-rollout.md#entities-database-cutover)。

**`lore-fact action='create'` 接受的谓语**随 profile 变化。通用谓语 `is_a`、`has_a`、`related_to` 始终可用；当前 profile 贡献其余可写谓语。默认 profile 目前额外提供 `uses`、`depends_on`、`created_by`、`owned_by`、`replaces`、`extends`、`conflicts_with`，其他 profile 可以暴露不同的领域谓语。见 [`docs/profiles.md#taxonomy-contract`](docs/profiles.md#taxonomy-contract) 以及当前 profile 的 taxonomy。系统管理的谓语是 `decided_by`、`supersedes_decision`、`informs`（`lore-decision action='create'` / `supersede`）和 `mentions`（`lore-memory action='save'`）。历史跟踪谓语（`needs_action`、`waiting_on`、`blocked_by`）只作为遗留行值存在；跟踪工作请用 `lore-task action='create'`。

**事实置信度（分类）**：`certain`、`likely`、`speculative`。这是 agent 可写的立场。单独的数字列「置信分数 / Confidence Score」由系统管理：阅读引用会升高，矛盾 / 取代信号会降低，长期不碰会被衰减。不要通过 MCP 输入去写这个数字。

**记忆来源**：新写入接受 `conversation`、`autosave_learning`、`file`、`manual`、`digest`。`agent_diary` 只留给历史行和显式审计回忆。

**记忆种类**：`note`、`decision`、`incident`、`runbook`、`postmortem`、`policy`、`task`、`procedure`。Procedure 是需评审的治理记忆：用 `lore-procedure action='propose'` 提出，再用 `lore-memory action='approve'` / `lore-memory action='reject'` 批准或拒绝。`lore-memory action='save'` 不会创建 `kind: "procedure"` 行。

**记忆状态**：`informational`、`proposed`、`accepted`、`superseded`、`deprecated`、`rejected`

### 主题键

会反复出现的非 procedure 记忆主题（`decision`、`runbook`、`incident`、`postmortem`、`policy`）可以给 `lore-memory action='save'` 传 `topicKey`。行按 `(主题键 + 精确的项目关系集合)` upsert：命中则追加修订并增加修订次数，而不是新建记忆。前缀要稳定，并匹配这些保存家族：`decision/`、`runbook/`、`incident/`、`postmortem/`、`policy/`。Procedure 主题键用 `procedure/` 家族，但交给 `lore-procedure action='propose'` 做提案幂等和冲突检测，而不是交给 `lore-memory action='save'` 做修订链。只有非 procedure 的保存家族会形成 `lore-memory` 修订链；`note` 和 `task` 不会。用 `lore-memory action='suggest-topic-key'` 推导键，晋升和改键规则见 [`docs/memory-workflows.md`](docs/memory-workflows.md#topic-keys)。

定期保存 digest（`lore-context action='digest'` → 综合 → `lore-memory action='save'` 且 `source: "digest"`）。最近 7 天有 digest 时，`lore-context action='wake-up'` 会把它放在顶部，并收窄下面的原始记忆列表——比一长串单条记忆更密、更省 token。

## MCP 工具

Lore 暴露一组多态工具，每个工具在一次 MCP 注册后面复用多个 action。旧的单用途工具名和任务别名已在 0.6.0 的弃用清理中移除。当前工具列表、action 参考以及 task/fact 迁移说明见 [`docs/mcp-tools.md`](docs/mcp-tools.md)。

## CLI 命令

核心命令：

- `lore init [page-id]` 创建 vault 数据库并写 `.lore.yaml`。加 `--locale zh-CN` 使用中文字段名。
- `lore install` 写助手 MCP 配置和受支持的 hooks；加 `--ntn` 走内部 ntn 引导。
- `lore auth --login` 刷新 ntn 认证并校验 vault 访问。
- `lore doctor` 诊断安装健康状况并打印下一步修复动作。
- `lore search <query>` 搜索记忆。
- `lore memory save <title>` 从 shell 保存一条手工记忆。
- `lore decision create <statement>` 记录一条带理由的决策。
- `lore ask <entity>` 查询关于某个实体的事实和任务。
- `lore status` 报告 vault 健康状况和当前项目解析。
- `lore costs summary` 汇总可选的本地成本账本。
- `lore migrate` 跑 schema 和一次性数据迁移。
- `lore migrate --localize zh-CN` 把已有英文库名 / 字段名改成中文（默认只预览，加 `--yes` 执行）。
- `lore entities merge --from <loser-id> --into <winner-id>` 预览或执行重复实体合并。
- `lore conflicts scan` 只读地找出冲突候选，交给 agent 判断。

精简 CLI 总览见 [`docs/cli.md`](docs/cli.md)。冲突裁决规则、扫描上限和「扫到干净为止」的流程见 [`docs/conflict-detection.md`](docs/conflict-detection.md)。

## Hooks

Lore 为受支持的 AI 编程助手安装 hook 命令：

- **自动保存**（`lore hooks autosave`）在助手 `Stop` 时运行，用户消息足够多后保存会话。
- **唤醒**（`lore hooks wakeup`）在第一次回复前加载最新 digest、近期记忆、有效事实，以及与任务匹配的上下文。

Claude Code 和 Codex 安装会用 bin 分发自动接线（`lore hooks ...`，Yarn PnP 下是 `yarn run -T lore hooks ...`）。`hooks/autosave.sh` 和 `hooks/wakeup.sh` 是给旧的绝对路径安装用的兼容入口。Cursor 和 `--print-config` 宿主只得到 MCP 工具面。
宿主时机、认证转发、auto-digest 行为和兼容说明见 [`docs/hooks.md`](docs/hooks.md)。

## 配置

Lore 通过 `.lore.yaml` 配置。文件从当前工作目录向上搜索。

`.lore.yaml` 只存在本地 — 不要提交进版本库。把 `.lore.example.yaml` 复制成 `.lore.yaml` 并填值，或跑 `lore init` 生成一份。团队共享值（`vault.pageId`、`auth.workspaceId`）通过入职文档分发，不要提交配置；即使不含凭证的共享 vault 配置，当前政策也要求留在 git 外。永远不要把 `auth.token`、个人草稿 vault 页面 ID，或可识别个人的值写进这个文件。

`vault.pageId` 的威胁模型：Notion 页面 ID 不是凭证，暴露它也不会绕过 Notion 权限。即便如此，也要把页面 ID 留在 git 外，避免公开仓库的外部克隆自动打到无关 vault。误进历史的页面 ID 应先从工作树删掉；只有所有者认为页面位置本身敏感时，才需要改写历史或换页。

```yaml
# 必填：包含 vault 数据库的 Notion 页面 ID
vault:
  pageId: "<shared-team-vault-page-id>"

# 可选：新建库时的界面语言。已有 vault 以 Notion 里的实际字段名为准。
# locale: zh-CN

# 可选：多 workspace 的 ntn auth.json 选择器
# auth:
#   workspaceId: "workspace-id"
#
# 可选：只读继承的上游 vault，以及刻意晋升的目标。
# 普通保存 / 更新工具仍然只写 vault.pageId。
# upstreamVaults:
#   - name: "Engineering"
#     pageId: "engineering-vault-id"
#     priority: 10
# promotionTargets:
#   - name: "Team"
#     pageId: "team-vault-id"
#     requireReview: true

# 把目录映射到命名项目（支持 monorepo）
projects:
  - name: "Server"
    path: "src/server"
    tags: ["backend"]
  - name: "Client"
    path: "src/client"
    tags: ["frontend"]

# 按工作区模式自动发现项目
# detect:
#   patterns: ["packages/*/package.json"]
#   exclude: ["node_modules"]

# Hook 行为
hooks:
  autoSave: true
  # 在会话开始注入 digest、记忆、任务、有效事实和决策。
  # 设为 false 可跳过上下文注入（减少 prompt 开销
  # 以及会话开始时的 Notion 往返）。
  wakeUp: true
  saveInterval: 5 # 每 5 条用户消息保存一次
```

Token 解析顺序：`NOTION_API_TOKEN` 环境变量，然后是 ntn 解析的 `~/.config/notion/auth.json`。先可用的源生效。`.lore.yaml` 里任何 `auth.token` 都会在加载时被拒绝；把凭证挪到 `NOTION_API_TOKEN` 或 ntn 认证。多 workspace 的 ntn 用 `NOTION_WORKSPACE_ID` 或 `auth.workspaceId` 选 workspace。

Notion 限流按 token 计算。ntn 签发的 token 和 PAT 给每个操作者独立的桶；通过 `NOTION_API_TOKEN` 分发同一个 `secret_` 集成 token 会让所有人挤在一个桶里。运行理由见 [`AGENTS.md`](AGENTS.md#authentication)，优先级实现、ntn 版本策略和 keychain 模式变通见 [`src/auth/AGENTS.md`](src/auth/AGENTS.md)。

### 环境变量

| 变量 | 作用 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NOTION_API_TOKEN` | Personal Access Token 的标准 Notion bearer 环境变量。优先于 ntn `auth.json` |
| `NOTION_WORKSPACE_ID` | 从多 workspace 的 ntn `auth.json` 里选一个 workspace |
| `LORE_AGENT_NAME` | 覆盖已保存记忆上的 `Agent:` 字段（例如 `LORE_AGENT_NAME=Codex`） |
| `LORE_USER_NAME` | 用人类显示名覆盖已保存记忆上的 `Author:` 字段。未设置时，Lore 从当前 ntn token 的 `users.me` 解析工程师身份。 |
| `LORE_AUTO_DIGEST=false` | 关掉 Stop 触发的 auto-digest 调度（CLI `lore digest` 仍可用） |
| `LORE_NO_HYPERLINKS=1` | 即使在 TTY 下，也不在 `lore search` 和 `lore status` 输出里发 OSC 8 可点击链接。与非 TTY 路径的回退相同。`=0`、`=false` 和空字符串视为未设置 |
| `NO_COLOR=1` | 与 `LORE_NO_HYPERLINKS` 一起被尊重，用于跳过 OSC 8 |

## Monorepo 支持

`.lore.yaml` 里的 `projects` 数组把目录映射到命名范围。Lore 用最长前缀匹配，从工作目录解析当前项目。

给定这份配置：

```yaml
projects:
  - name: "Root"
    path: "."
  - name: "Server"
    path: "src/server"
  - name: "Auth"
    path: "src/server/auth"
```

在 `src/server/auth/middleware` 下运行会解析到 "Auth" 项目。记忆、事实和搜索会自动限定到匹配的项目。

## 开发

**前置**：Node.js 20+、npm

```bash
npm install          # 安装依赖
npm run build        # 用 tsup 构建（ESM，4 个入口）
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run lint:fix     # lint 并自动修复
npm run format       # prettier 格式化
npm run format:check # 检查 prettier 格式
npm run test         # vitest 跑测试
npm run dev          # 监视模式（tsup --watch）
```

贡献约定、架构说明和不可妥协的稳定性规则见 [`CONTRIBUTING.md`](CONTRIBUTING.md)、[`AGENTS.md`](AGENTS.md) 以及 `src/*/AGENTS.md` 下的子系统指南。如果要改 `.github/workflows/`，先读 [`docs/ci.md`](docs/ci.md) — 它写明了每个 workflow 必须遵守的 fork 安全约定。

## 更新日志

面向用户的重要变更记在 [`CHANGELOG.md`](CHANGELOG.md)。

## 许可证

MIT
