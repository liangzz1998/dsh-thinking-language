# dsh-thinking-language

让 **DeepSeek Harness** 里的 agent 用指定语言**思考**与**回复**。

装上之后，模型展开的「思考过程 / reasoning」默认变成**简体中文**，不再满屏英文。它通过一条系统提示词 section 实现，不覆盖任何内置预设，因此 DSH 升级时不容易失效。

## 效果

系统提示词末尾会被注入（order 10300，位于 deployment persona 之后）：

```text
始终使用简体中文进行内部思考与推理：你的 reasoning（思考过程）、分析、计划、反思和内心独白都必须用简体中文书写，不要使用英文思考。
回复语言跟随用户使用的语言，除非用户明确要求其他语言。
```

> 这是对模型的**语言指令**，不是强制翻译。主体思考会变成中文，但代码、专有名词、个别英文术语仍可能出现，属于正常现象。

## 安装

DSH 需要先完全退出（含托盘）。

### 方式一：从 GitHub 安装

```bat
dsh plugin --profile desktop add github:Alterssss/dsh-thinking-language
```

### 方式二：本地目录安装（开发调试）

```bat
dsh plugin --profile desktop add link:D:\dsh-plugins\dsh-thinking-language
```

### 方式三：手动改 profile

在 `~/.dsh/profiles/desktop/package.json` 的 `dependencies` 里加：

```json
{
  "dependencies": {
    "dsh-thinking-language": "github:Alterssss/dsh-thinking-language"
  },
  "dsh": {
    "profile": {
      "bundles": [
        "@deepseek-ai/dsh-base",
        "@deepseek-ai/dsh-web-app",
        "dsh-thinking-language"
      ]
    }
  }
}
```

然后在该 profile 目录执行 `pnpm install`，再重启 DSH。

安装完成后重启 DSH，新会话的思考过程即为中文。

## 配置

配置直接写在 profile 的 `cordis.patch.yml` 里（DSH 的插件行支持按 id 覆盖配置）：

```yaml
- id: thinking-language
  name: dsh-thinking-language
  config:
    enabled: true      # 是否启用，默认 true
    thinking: zh-CN    # 思考语言：zh-CN（默认）| auto（不干预）
    answer: auto       # 回复语言：auto（默认，跟随用户）| zh-CN（始终中文）
    extra: ''          # 追加到系统提示词的自定义文本
```

### 常用组合

| 想要的效果 | 配置 |
| --- | --- |
| 中文思考，回复跟随用户（默认） | `thinking: zh-CN` + `answer: auto` |
| 中文思考 + 始终中文回复 | `thinking: zh-CN` + `answer: zh-CN` |
| 只要求中文回复，不干预思考 | `thinking: auto` + `answer: zh-CN` |
| 临时关闭 | `enabled: false` |

## 兼容性

- **标准模式、PTC 模式、自定义预设**：生效。
- **极简模式（minimal）**：不生效。它使用 `complete: true` 的固定系统提示，会抑制所有额外 section；这是极简模式本身的设计。
- **子代理 / Agent Teams**：同样生效（section 注册在全局作用域）。
- **其他语言**：目前内置中文（zh-CN）。需要其他语言可以设置 `thinking: auto`，再用 `extra` 追加自定义要求，例如 `extra: "Always reason in Japanese."`。

## 卸载

```bat
dsh plugin --profile desktop remove dsh-thinking-language
```

或从 profile 的 `package.json` 里移除依赖与 bundle 列表中的 `dsh-thinking-language`，再执行 `pnpm install` 并重启 DSH。

## 开发

```bat
node --test tests/plugin.test.mjs
```

插件只依赖 DSH 提供的 `systemPrompt` 服务，不引入任何外部依赖。

## License

MIT
