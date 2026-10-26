/**
 * dsh-thinking-language — 让 DSH 里的 agent 用指定语言思考与回复。
 *
 * 实现方式：在系统提示词里注册一个全局 section（order 10300，
 * 位于 deployment persona 后缀 10200 之后），不依赖任何内置预设的
 * 内部结构，也不覆盖 preset 声明，因此 DSH 升级时不容易失效。
 *
 * 兼容性：
 *   - standard / ptc / 自定义预设（persona 非 complete 模式）都会带上本 section；
 *   - minimal 极简模式使用 complete 固定系统提示，会抑制所有额外 section，
 *     因此极简模式不受本插件影响（可在 README 中说明）。
 *
 * @module dsh-thinking-language
 */

/** 插件名（与包名一致）。 */
export const name = 'dsh-thinking-language'

/** 依赖 DSH 的系统提示词注册表服务。 */
export const inject = ['systemPrompt']

/** section 名称：唯一即可，不要与第一方 section 重名。 */
export const SECTION_NAME = 'thinking:language'

/**
 * section 顺序。第一方 persona 后缀是 10200，这里取 10300，
 * 让语言要求出现在系统提示词更靠后的位置。
 */
export const SECTION_ORDER = 10300

const THINKING_ZH_CN = '始终使用简体中文进行内部思考与推理：你的 reasoning（思考过程）、分析、计划、反思和内心独白都必须用简体中文书写，不要使用英文思考。'
const ANSWER_AUTO = '回复语言跟随用户使用的语言，除非用户明确要求使用其他语言。'
const ANSWER_ZH_CN = '始终使用简体中文回复用户。'

const THINKING_CHOICES = ['zh-CN', 'auto']
const ANSWER_CHOICES = ['auto', 'zh-CN']

/** 取一个合法枚举值，非法或缺失时回退到默认值。 */
function pick(value, choices, fallback) {
  return choices.includes(value) ? value : fallback
}

/**
 * 归一化插件配置。
 * @param {unknown} input - cordis.patch.yml 里的 config。
 * @returns {{enabled: boolean, thinking: 'zh-CN'|'auto', answer: 'auto'|'zh-CN', extra: string}}
 */
export function resolveConfig(input) {
  const config = input !== null && typeof input === 'object' ? input : {}
  return {
    enabled: config.enabled === undefined ? true : Boolean(config.enabled),
    thinking: pick(config.thinking, THINKING_CHOICES, 'zh-CN'),
    answer: pick(config.answer, ANSWER_CHOICES, 'auto'),
    extra: typeof config.extra === 'string' ? config.extra.trim() : '',
  }
}

/**
 * 生成注入系统提示词的文本；返回空字符串表示不需要注册 section。
 * @param {{enabled: boolean, thinking: string, answer: string, extra: string}} config - 归一化配置。
 * @returns {string}
 */
export function buildSectionText(config) {
  const parts = []
  if (config.thinking === 'zh-CN') parts.push(THINKING_ZH_CN)
  if (config.answer === 'zh-CN') parts.push(ANSWER_ZH_CN)
  else if (config.answer === 'auto' && parts.length > 0) parts.push(ANSWER_AUTO)
  if (config.extra !== '') parts.push(config.extra)
  return parts.join('\n')
}

/**
 * 插件入口：注册语言要求 section。
 * @param {object} ctx - Cordis 插件上下文。
 * @param {unknown} rawConfig - cordis.patch.yml 里的 config。
 */
export function apply(ctx, rawConfig) {
  const config = resolveConfig(rawConfig)
  if (!config.enabled) return
  const text = buildSectionText(config)
  if (text === '') return
  ctx.effect(
    () =>
      ctx.systemPrompt.section({
        name: SECTION_NAME,
        order: SECTION_ORDER,
        text,
        // 文本是纯自然语言，禁止 {{...}} 变量插值，避免自定义 extra 被误解析。
        interpolate: false,
      }),
    'dsh-thinking-language:section',
  )
}

const plugin = { name, inject, apply }
export default plugin
