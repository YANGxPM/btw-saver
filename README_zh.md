# btw-saver

> 一个 Claude Code 插件，解决 `/btw` 回答消失后无法找回的问题。

---

## 问题背景

Claude Code 的 `/btw` 命令允许你在不污染主对话上下文的情况下提问。但当你关闭浮层后，**回答会永久消失**——而且消失之前没有任何提示。

这个插件提供了一条补救路径。

---

## 功能介绍

### `/btw:save <你的问题>`

用当前会话上下文重新回答你的 `/btw` 问题，并将结果保存到项目根目录下的 `.btw-log/btw-log.md`。

```
/btw:save 刚才我们读的那个配置文件叫什么名字？
```

保存到 `.btw-log/btw-log.md` 的内容：

```markdown
---
## [2026-05-05 14:32] 刚才我们读的那个配置文件叫什么名字？

文件是 `src/config/database.ts`，我们在分析认证模块的 Redis 连接配置时读取了它。
```

### 智能提醒 Hook

使用 `/btw` 之后，`UserPromptSubmit` hook 会静默检测到这一行为，并在你的下一条消息时向 Claude 注入一个软提醒——如果回答值得保留，Claude 会自然地建议你保存。

---

## 安装步骤

**第一步：克隆仓库**

```bash
git clone https://github.com/your-username/btw-saver.git ~/.claude/plugins/btw-saver
```

**第二步：修复 hook 路径**

```bash
sed -i '' 's|PLUGIN_ABSOLUTE_PATH|'"$HOME"'/.claude/plugins/btw-saver|g' \
  ~/.claude/plugins/btw-saver/hooks/hooks.json
```

**第三步：在 settings.json 中注册插件**

编辑 `~/.claude/settings.json`，加入：

```json
{
  "plugins": [
    {
      "type": "local",
      "path": "/Users/你的用户名/.claude/plugins/btw-saver"
    }
  ]
}
```

> 请使用绝对路径，`~` 在部分环境下可能无法正确展开。

**第四步：重启 Claude Code**

在 Claude Code 内运行 `/reload-plugins`，然后试一试：

```
/btw:save 刚才我们读的那个配置文件叫什么名字？
```

---

## 使用方式

| 场景 | 命令 |
|---|---|
| 刚关闭 `/btw`，想找回回答 | `/btw:save <你的问题>` |
| 查看所有已保存的回答 | `cat .btw-log/btw-log.md` |
| 清空记录 | `rm .btw-log/btw-log.md` |

---

## 已知限制

- **回答还原度：** `/btw:save` 会重新生成回答，内容可能与浮层中的原始回答略有差异。这是架构层面的根本限制——`/btw` 的回答从不进入对话历史，因此关闭后无法精确捕获。
- **依赖 Node.js：** 智能提醒 hook 需要本地安装 Node.js。
- **Hook 使用绝对路径：** 安装时的 `sed` 命令会自动设置正确路径。如果 hook 报错，请手动检查 `hooks/hooks.json` 中的路径是否正确。

---

## 设计提案

理想的解决方案是在 **`/btw` 浮层内直接加一个保存按钮**——在用户看到回答的那一刻，一键保存，在关闭之前完成。这个插件是在该功能进入 Claude Code 核心之前的最优替代方案。

完整的 UX 分析和向 Anthropic 设计团队的改进提案，见 [`design/ux-proposal-zh.md`](./design/ux-proposal-zh.md)。

---

## 文件结构

```
btw-saver/
├── .claude-plugin/
│   └── plugin.json          # 插件元数据（name: "btw" → /btw:save）
├── skills/
│   └── save-btw/
│       └── SKILL.md         # Skill 定义
├── hooks/
│   └── hooks.json           # UserPromptSubmit hook 配置
├── scripts/
│   └── btw-nudge.js         # Hook 实现（Node.js）
├── design/
│   ├── UX Proposal.md       # UX 改进提案（英文）
│   └── UX Proposal_zh.md    # UX 改进提案（中文）
└── README.md
```

---

## 关于作者

由 Sheng 构建，UX + AI PM 

---

## 开源协议

MIT
