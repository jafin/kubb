import pathParser from 'node:path'

import { createExportDeclaration, createImportDeclaration, print } from '@kubb/ts-codegen'

import { TreeNode } from '../../utils/index.ts'

import type ts from 'typescript'
import type { Path } from '../../types.ts'
import type { PathMode, TreeNodeOptions } from '../../utils/index.ts'
import type { File } from './types.ts'

type TreeNodeData = { type: PathMode; path: Path; name: string }

export function getIndexes(root: string, options: TreeNodeOptions = {}): File[] | null {
  const tree = TreeNode.build<TreeNodeData>(root, { extensions: /\.ts/, ...options })

  if (!tree) {
    return null
  }

  const fileReducer = (files: File[], currentTree: typeof tree) => {
    if (!currentTree.children) {
      return []
    }

    if (currentTree.children?.length > 1) {
      const path = pathParser.resolve(currentTree.data.path, 'index.ts')
      const exports = currentTree.children
        .map((file) => {
          if (!file) {
            return undefined
          }

          const importPath: string = file.data.type === 'directory' ? `./${file.data.name}` : `./${file.data.name.replace(/\.[^.]*$/, '')}`

          // TODO weird hacky fix
          if (importPath.includes('index') && path.includes('index')) {
            return undefined
          }

          return { path: importPath }
        })
        .filter(Boolean)

      files.push({
        path,
        fileName: 'index.ts',
        source: '',
        exports,
      })
    } else {
      currentTree.children?.forEach((child) => {
        const path = pathParser.resolve(currentTree.data.path, 'index.ts')
        const importPath = child.data.type === 'directory' ? `./${child.data.name}` : `./${child.data.name.replace(/\.[^.]*$/, '')}`

        files.push({
          path,
          fileName: 'index.ts',
          source: '',
          exports: [{ path: importPath }],
        })
      })
    }

    currentTree.children.forEach((childItem) => {
      fileReducer(files, childItem)
    })

    return files
  }

  const files = fileReducer([], tree)

  return files
}

export function combineFiles(files: Array<File | null>): File[] {
  return files.filter(Boolean).reduce((acc, curr: File) => {
    const prevIndex = acc.findIndex((item) => item.path === curr.path)

    if (prevIndex !== -1) {
      const prev = acc[prevIndex]
      acc[prevIndex] = {
        ...curr,
        source: prev.source && curr.source ? `${prev.source}\n${curr.source}` : '',
        imports: [...(prev.imports || []), ...(curr.imports || [])],
        exports: [...(prev.exports || []), ...(curr.exports || [])],
        env: { ...(prev.env || {}), ...(curr.env || {}) },
      }
    } else {
      acc.push(curr)
    }

    return acc
  }, [] as File[])
}
/**
 * Support for js, ts and tsx(React)
 */
export type Extension = '.ts' | '.js' | '.tsx'
export const extensions: Array<Extension> = ['.js', '.ts', '.tsx']

export function isExtensionAllowed(fileName: string): boolean {
  return extensions.some((extension) => fileName.endsWith(extension))
}

export function getFileSource(file: File): string {
  let { source } = file

  if (!isExtensionAllowed(file.fileName)) {
    return file.source
  }
  const imports: File['imports'] = []
  const exports: File['exports'] = []

  file.imports?.forEach((curr) => {
    const existingImport = imports.find((imp) => imp.path === curr.path)

    if (!existingImport) {
      imports.push({
        ...curr,
        name: Array.isArray(curr.name) ? [...new Set(curr.name)] : curr.name,
      })
    }

    if (existingImport && !Array.isArray(existingImport.name) && existingImport.name !== curr.name) {
      imports.push(curr)
    }

    if (existingImport && Array.isArray(existingImport.name)) {
      if (Array.isArray(curr.name)) {
        existingImport.name = [...new Set([...existingImport.name, ...curr.name])]
      }
    }
  })

  file.exports?.forEach((curr) => {
    const exists = exports.find((imp) => imp.path === curr.path)
    if (!exists) {
      exports.push({
        ...curr,
        name: Array.isArray(curr.name) ? [...new Set(curr.name)] : curr.name,
      })
    }

    if (exists && !Array.isArray(exists.name) && exists.name !== curr.name && exists.asAlias === curr.asAlias) {
      exports.push(curr)
    }

    if (exists && Array.isArray(exists.name)) {
      if (Array.isArray(curr.name)) {
        exists.name = [...new Set([...exists.name, ...curr.name])]
      }
    }
  })

  const importNodes = imports.reduce((prev, curr) => {
    return [...prev, createImportDeclaration({ name: curr.name, path: curr.path, isTypeOnly: curr.isTypeOnly })]
  }, [] as ts.ImportDeclaration[])
  const importSource = print(importNodes)

  const exportNodes = exports.reduce((prev, curr) => {
    return [...prev, createExportDeclaration({ name: curr.name, path: curr.path, isTypeOnly: curr.isTypeOnly, asAlias: curr.asAlias })]
  }, [] as ts.ExportDeclaration[])
  const exportSource = print(exportNodes)
  source = getEnvSource(source, file.env)

  if (importSource) {
    source = `${importSource}\n${source}`
  }

  if (exportSource) {
    source = `${exportSource}\n${source}`
  }

  return source
}

type SearchAndReplaceOptions = {
  text: string
  replaceBy: string
  prefix?: string
  key: string
  searchValues?: (prefix: string, key: string) => Array<RegExp | string>
}

function searchAndReplace(options: SearchAndReplaceOptions): string {
  const { text, replaceBy, prefix = '', key } = options

  const searchValues = options.searchValues?.(prefix, key) || [
    `${prefix}["${key}"]`,
    `${prefix}['${key}']`,
    `${prefix}[\`${key}\`]`,
    `${prefix}"${key}"`,
    `${prefix}'${key}'`,
    `${prefix}\`${key}\``,
    new RegExp(`${prefix}${key}`, 'g'),
  ]

  return searchValues.reduce((prev, searchValue) => {
    return prev.toString().replaceAll(searchValue, replaceBy)
  }, text) as string
}

function getEnvSource(source: string, env: NodeJS.ProcessEnv | undefined): string {
  if (!env) {
    return source
  }

  const keys = Object.keys(env)

  if (!keys.length) {
    return source
  }

  return keys.reduce((prev, key: string) => {
    const environmentValue = env[key]
    const replaceBy = environmentValue ? `'${environmentValue.replaceAll('"', '')?.replaceAll("'", '')}'` : 'undefined'

    if (key.toUpperCase() !== key) {
      throw new TypeError(`Environment should be in upperCase for ${key}`)
    }

    if (typeof replaceBy === 'string') {
      prev = searchAndReplace({ text: prev.replaceAll(`process.env.${key}`, replaceBy), replaceBy, prefix: 'process.env', key })
      // removes `declare const ...`
      prev = searchAndReplace({ text: prev.replaceAll(new RegExp(`(declare const).*\n`, 'ig'), ''), replaceBy, key })
    }

    return prev
  }, source)
}
