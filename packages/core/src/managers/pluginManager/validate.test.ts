import { validatePlugins } from './validate.ts'

import type { KubbPlugin } from '../../types.ts'

describe('PluginManager validate', () => {
  test('if validatePlugins works with 2 plugins', () => {
    expect(validatePlugins([{ name: 'pluginA' }, { name: 'pluginB' }, { name: 'pluginC' }] as KubbPlugin[], 'pluginA')).toBeTruthy()
    expect(validatePlugins([{ name: 'pluginA' }, { name: 'pluginB' }, { name: 'pluginC' }] as KubbPlugin[], 'pluginB')).toBeTruthy()
    expect(validatePlugins([{ name: 'pluginA' }, { name: 'pluginB' }, { name: 'pluginC' }] as KubbPlugin[], ['pluginA', 'pluginC'])).toBeTruthy()
    try {
      validatePlugins([{ name: 'pluginA' }, { name: 'pluginB' }, { name: 'pluginC' }] as KubbPlugin[], ['pluginA', 'pluginD'])
    } catch (e) {
      expect(e).toBeDefined()
    }
  })
})
