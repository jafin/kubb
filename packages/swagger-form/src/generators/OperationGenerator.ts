import { getRelativePath } from '@kubb/core'
import { OperationGenerator as Generator } from '@kubb/swagger'
import { pluginName as swaggerTypescriptPluginName } from '@kubb/swagger-ts'

import type { File, OptionalPath, PluginContext } from '@kubb/core'
import type { Oas, Operation, OperationSchemas, Resolver, SkipBy } from '@kubb/swagger'
import type { ResolvePathOptions, Options as PluginOptions } from '../types.ts'
import { FormBuilder } from '../builders/FormBuilder.ts'
import type { Import } from '@kubb/core'
import type { FileMeta } from '../types.ts'
import { pluginName } from '../plugin.ts'

type Options = {
  clientPath?: OptionalPath
  oas: Oas
  skipBy?: SkipBy[]
  resolvePath: PluginContext<ResolvePathOptions>['resolvePath']
  resolveName: PluginContext['resolveName']
  withDevtools?: boolean
  overrides?: PluginOptions['overrides']
}

export class OperationGenerator extends Generator<Options> {
  resolve(operation: Operation): Resolver {
    const { resolvePath, resolveName } = this.options

    const name = resolveName({ name: `${operation.getOperationId()}Form` })

    if (!name) {
      throw new Error('Name should be defined')
    }

    const fileName = `${name}.tsx`
    const filePath = resolvePath({
      fileName,
      options: { tag: operation.getTags()[0]?.name },
    })

    if (!filePath) {
      throw new Error('Filepath should be defined')
    }

    return {
      name,
      fileName,
      filePath,
    }
  }

  resolveType(operation: Operation): Resolver {
    const { resolvePath, resolveName } = this.options

    const name = resolveName({ name: operation.getOperationId(), pluginName: swaggerTypescriptPluginName })

    if (!name) {
      throw new Error('Name should be defined')
    }

    const fileName = `${name}.ts`
    const filePath = resolvePath({ fileName, options: { tag: operation.getTags()[0]?.name }, pluginName: swaggerTypescriptPluginName })

    if (!filePath) {
      throw new Error('Filepath should be defined')
    }

    return {
      name,
      fileName,
      filePath,
    }
  }

  resolveError(operation: Operation, statusCode: number): Resolver {
    const { resolvePath, resolveName } = this.options

    const name = resolveName({ name: `${operation.getOperationId()} ${statusCode}`, pluginName: swaggerTypescriptPluginName })

    if (!name) {
      throw new Error('Name should be defined')
    }

    const fileName = `${name}.ts`
    const filePath = resolvePath({
      fileName,
      options: { tag: operation.getTags()[0]?.name },
      pluginName: swaggerTypescriptPluginName,
    })

    if (!filePath) {
      throw new Error('Filepath should be defined')
    }

    return {
      name,
      fileName,
      filePath,
    }
  }

  resolveErrors(items: Array<{ operation: Operation; statusCode: number }>): Resolver[] {
    return items.map((item) => this.resolveError(item.operation, item.statusCode))
  }

  async all(): Promise<File | null> {
    return null
  }

  async get(): Promise<File | null> {
    return null
  }

  async post(operation: Operation, schemas: OperationSchemas): Promise<File<FileMeta> | null> {
    const { oas, withDevtools, resolveName, overrides } = this.options

    if (!schemas.request?.name) {
      return null
    }

    const hook = this.resolve(operation)
    const type = this.resolveType(operation)

    let errors: Resolver[] = []

    if (schemas.errors) {
      errors = this.resolveErrors(schemas.errors?.map((item) => item.statusCode && { operation, statusCode: item.statusCode }).filter(Boolean))
    }

    const source = new FormBuilder(oas).configure({ name: hook.name, overrides, resolveName, withDevtools, errors, operation, schemas }).print()

    const mapperImports = this.options.overrides?.mapper
      ? Object.entries(this.options.overrides.mapper).reduce((prev, curr) => {
          const [_key, { imports = [] }] = curr

          return [...prev, ...imports]
        }, [] as Import[])
      : []

    return {
      path: hook.filePath,
      fileName: hook.fileName,
      source,
      imports: [
        ...(this.options.overrides?.form?.imports || []),
        ...mapperImports,
        this.options.overrides?.form?.imports
          ? undefined
          : {
              name: ['useForm', 'Controller'],
              path: 'react-hook-form',
            },
        withDevtools
          ? {
              name: ['DevTool'],
              path: '@hookform/devtools',
            }
          : undefined,
        {
          name: [
            schemas.request?.name,
            schemas.response.name,
            schemas.pathParams?.name,
            schemas.queryParams?.name,
            ...errors.map((error) => error.name),
          ].filter(Boolean),
          path: getRelativePath(hook.filePath, type.filePath),
          isTypeOnly: true,
        },
      ].filter(Boolean),
      meta: {
        pluginName,
        tag: operation.getTags()[0]?.name,
      },
    }
  }

  async put(operation: Operation, schemas: OperationSchemas): Promise<File<FileMeta> | null> {
    const { oas, withDevtools, resolveName, overrides } = this.options

    if (!schemas.request?.name) {
      return null
    }

    const hook = this.resolve(operation)
    const type = this.resolveType(operation)

    let errors: Resolver[] = []

    if (schemas.errors) {
      errors = this.resolveErrors(schemas.errors?.map((item) => item.statusCode && { operation, statusCode: item.statusCode }).filter(Boolean))
    }

    const source = new FormBuilder(oas).configure({ name: hook.name, overrides, resolveName, withDevtools, errors, operation, schemas }).print()

    const mapperImports = this.options.overrides?.mapper
      ? Object.entries(this.options.overrides.mapper).reduce((prev, curr) => {
          const [_key, { imports = [] }] = curr

          return [...prev, ...imports]
        }, [] as Import[])
      : []

    return {
      path: hook.filePath,
      fileName: hook.fileName,
      source,
      imports: [
        ...(this.options.overrides?.form?.imports || []),
        ...mapperImports,
        this.options.overrides?.form?.imports
          ? undefined
          : {
              name: ['useForm', 'Controller'],
              path: 'react-hook-form',
            },
        withDevtools
          ? {
              name: ['DevTool'],
              path: '@hookform/devtools',
            }
          : undefined,
        {
          name: [
            schemas.request?.name,
            schemas.response.name,
            schemas.pathParams?.name,
            schemas.queryParams?.name,
            ...errors.map((error) => error.name),
          ].filter(Boolean),
          path: getRelativePath(hook.filePath, type.filePath),
          isTypeOnly: true,
        },
      ].filter(Boolean),
      meta: {
        pluginName,
        tag: operation.getTags()[0]?.name,
      },
    }
  }

  async delete(operation: Operation, schemas: OperationSchemas): Promise<File<FileMeta> | null> {
    const { oas, withDevtools, resolveName, overrides } = this.options

    if (!schemas.request?.name) {
      return null
    }

    const hook = this.resolve(operation)
    const type = this.resolveType(operation)

    let errors: Resolver[] = []

    if (schemas.errors) {
      errors = this.resolveErrors(schemas.errors?.map((item) => item.statusCode && { operation, statusCode: item.statusCode }).filter(Boolean))
    }

    const source = new FormBuilder(oas).configure({ resolveName, overrides, name: hook.name, withDevtools, errors, operation, schemas }).print()

    const mapperImports = this.options.overrides?.mapper
      ? Object.entries(this.options.overrides.mapper).reduce((prev, curr) => {
          const [_key, { imports = [] }] = curr

          return [...prev, ...imports]
        }, [] as Import[])
      : []

    return {
      path: hook.filePath,
      fileName: hook.fileName,
      source,
      imports: [
        ...mapperImports,
        this.options.overrides?.form?.imports
          ? undefined
          : {
              name: ['useForm', 'Controller'],
              path: 'react-hook-form',
            },
        withDevtools
          ? {
              name: ['DevTool'],
              path: '@hookform/devtools',
            }
          : undefined,
        {
          name: [
            schemas.request?.name,
            schemas.response.name,
            schemas.pathParams?.name,
            schemas.queryParams?.name,
            ...errors.map((error) => error.name),
          ].filter(Boolean),
          path: getRelativePath(hook.filePath, type.filePath),
          isTypeOnly: true,
        },
      ].filter(Boolean),
      meta: {
        pluginName,
        tag: operation.getTags()[0]?.name,
      },
    }
  }
}
