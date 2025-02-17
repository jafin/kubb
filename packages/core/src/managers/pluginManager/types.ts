import type { KubbPlugin, PluginLifecycle, PluginLifecycleHooks } from '../../types.ts'

/**
 * Get the type of the first argument in a function.
 * @example Arg0<(a: string, b: number) => void> -> string
 */
export type Argument0<H extends keyof PluginLifecycle> = Parameters<PluginLifecycle[H]>[0]

export type Strategy = 'hookFirst' | 'hookForPlugin' | 'hookParallel' | 'hookReduceArg0' | 'hookSeq'

export type Executer<H extends PluginLifecycleHooks = PluginLifecycleHooks> = {
  strategy: Strategy
  hookName: H
  plugin: KubbPlugin
  parameters?: unknown[] | undefined
  output?: unknown
}

export type ParseResult<H extends PluginLifecycleHooks> = PluginLifecycle[H]

export type SafeParseResult<H extends PluginLifecycleHooks, Result = ReturnType<ParseResult<H>>> = {
  result: Result
  plugin: KubbPlugin
}
