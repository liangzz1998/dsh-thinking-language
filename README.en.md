# dsh-thinking-language

Make agents inside **DeepSeek Harness** think and answer in a chosen language.

After installing, the model's reasoning (chain of thought) becomes **Simplified Chinese** by default. The plugin injects one system-prompt section; it does not override any built-in preset, so it keeps working across DSH upgrades.

## What it does

It appends a section to the system prompt (order 10300, after the deployment persona):

```text
Always conduct your internal reasoning and thinking in Simplified Chinese.
Reply in the language the user uses unless the user explicitly asks for another language.
```

> This is a language instruction to the model, not a translator. The bulk of the reasoning becomes Chinese; code, proper nouns and a few English terms may still appear.

## Install

Quit DSH completely first (including the tray icon).

From GitHub:

```bat
dsh plugin --profile desktop add github:Alterssss/dsh-thinking-language
```

From a local checkout:

```bat
dsh plugin --profile desktop add link:D:\dsh-plugins\dsh-thinking-language
```

Then restart DSH. New sessions will think in Chinese.

## Configuration

Override the plugin row in the profile's `cordis.patch.yml`:

```yaml
- id: thinking-language
  name: dsh-thinking-language
  config:
    enabled: true      # default true
    thinking: zh-CN    # zh-CN (default) | auto
    answer: auto       # auto (default, follow the user) | zh-CN
    extra: ''          # extra custom prompt text
```

| Goal | Configuration |
| --- | --- |
| Chinese reasoning, answer follows the user (default) | `thinking: zh-CN`, `answer: auto` |
| Chinese reasoning + always Chinese answers | `thinking: zh-CN`, `answer: zh-CN` |
| Chinese answers only, do not touch reasoning | `thinking: auto`, `answer: zh-CN` |
| Disable | `enabled: false` |

## Compatibility

- Works for **standard**, **PTC**, and **custom** presets.
- **Minimal preset**: not affected — it uses a `complete: true` fixed system prompt that suppresses all additional sections by design.
- Subagents / Agent Teams are covered too (the section is registered globally).
- Other languages: use `thinking: auto` plus `extra`, e.g. `extra: "Always reason in Japanese."`.

## Uninstall

```bat
dsh plugin --profile desktop remove dsh-thinking-language
```

Then restart DSH.

## Development

```bat
node --test tests/plugin.test.mjs
```

The plugin only depends on DSH's `systemPrompt` service and has no external dependencies.

## License

MIT
