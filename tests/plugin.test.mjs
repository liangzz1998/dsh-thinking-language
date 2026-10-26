import test from 'node:test'
import assert from 'node:assert/strict'

import {
  apply,
  buildSectionText,
  inject,
  name,
  resolveConfig,
  SECTION_NAME,
  SECTION_ORDER,
} from '../lib/index.js'

/** 构造一个只关心 systemPrompt.section 的假 ctx。 */
function fakeCtx() {
  const sections = []
  return {
    sections,
    ctx: {
      systemPrompt: {
        section(section) {
          sections.push(section)
          return () => {}
        },
      },
      effect(factory) {
        return factory()
      },
    },
  }
}

test('插件基础信息', () => {
  assert.equal(name, 'dsh-thinking-language')
  assert.deepEqual(inject, ['systemPrompt'])
})

test('默认配置：中文思考 + 回复跟随用户', () => {
  const config = resolveConfig(undefined)
  assert.deepEqual(config, { enabled: true, thinking: 'zh-CN', answer: 'auto', extra: '' })
  const text = buildSectionText(config)
  assert.match(text, /始终使用简体中文进行内部思考与推理/)
  assert.match(text, /回复语言跟随用户使用的语言/)
})

test('answer=zh-CN：强制中文回复', () => {
  const text = buildSectionText(resolveConfig({ answer: 'zh-CN' }))
  assert.match(text, /始终使用简体中文回复用户/)
  assert.doesNotMatch(text, /回复语言跟随用户使用的语言/)
})

test('thinking=auto 且 answer=auto：不注册 section', () => {
  const config = resolveConfig({ thinking: 'auto', answer: 'auto' })
  assert.equal(buildSectionText(config), '')
  const { ctx, sections } = fakeCtx()
  apply(ctx, { thinking: 'auto', answer: 'auto' })
  assert.equal(sections.length, 0)
})

test('enabled=false：不注册 section', () => {
  const { ctx, sections } = fakeCtx()
  apply(ctx, { enabled: false })
  assert.equal(sections.length, 0)
})

test('注册的 section 名称、顺序与文本', () => {
  const { ctx, sections } = fakeCtx()
  apply(ctx, {})
  assert.equal(sections.length, 1)
  const section = sections[0]
  assert.equal(section.name, SECTION_NAME)
  assert.equal(section.order, SECTION_ORDER)
  assert.equal(section.interpolate, false)
  assert.match(section.text, /始终使用简体中文进行内部思考与推理/)
})

test('extra 文本追加到末尾', () => {
  const text = buildSectionText(resolveConfig({ extra: '额外要求：先给结论。' }))
  assert.match(text, /额外要求：先给结论。$/)
})

test('非法枚举值回退默认值', () => {
  const config = resolveConfig({ thinking: 'fr', answer: 'en' })
  assert.equal(config.thinking, 'zh-CN')
  assert.equal(config.answer, 'auto')
})

test('extra 中的 {{变量}} 不会被插值（interpolate:false）', () => {
  const { ctx, sections } = fakeCtx()
  apply(ctx, { extra: '保留 {{model}} 原样' })
  assert.match(sections[0].text, /\{\{model\}\}/)
  assert.equal(sections[0].interpolate, false)
})
