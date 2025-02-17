import path from 'node:path'

import { format } from '../../../mocks/format.ts'
import { combineFiles, getFileSource, getIndexes } from './utils.ts'

import type { File } from './types.ts'

describe('FileManager utils', () => {
  test('if getFileSource is returning code with imports', async () => {
    const code = getFileSource({
      fileName: 'test.ts',
      path: 'models/ts/test.ts',
      source: 'export type Pet = Pets;',
      imports: [
        {
          name: ['Pets'],
          path: './Pets',
          isTypeOnly: true,
        },
      ],
    })
    expect(await format(code)).toMatch(
      await format(`
    import type { Pets } from './Pets'

    export type Pet = Pets
    
   `),
    )
  })

  test('if getFileSource is returning code with imports and default import', async () => {
    const code = getFileSource({
      fileName: 'test.ts',
      path: 'models/ts/test.ts',
      source: 'export type Pet = Pets;',
      imports: [
        {
          name: 'Pets',
          path: './Pets',
          isTypeOnly: true,
        },
      ],
    })
    expect(await format(code)).toMatch(
      await format(`
    import type Pets from './Pets'

    export type Pet = Pets
    
   `),
    )
  })
  test('if combineFiles is removing previouscode', () => {
    const combined = combineFiles([
      {
        path: path.resolve('./src/models/file1.ts'),
        fileName: 'file1.ts',
        source: 'export const test = 2;',
      },
      {
        path: path.resolve('./src/models/file1.ts'),
        fileName: 'file2.ts',
        source: 'export const test2 = 3;',
      },
    ])

    expect(combined).toMatchObject([
      {
        path: path.resolve('./src/models/file1.ts'),
        fileName: 'file2.ts',
        imports: [],
        exports: [],
        source: `export const test = 2;
export const test2 = 3;`,
      },
    ])
  })

  test('if getFileSource is returning code with exports and exports as', () => {
    const fileImport: File = {
      path: path.resolve('./src/models/file1.ts'),
      fileName: 'file1.ts',
      source: 'export const test = 2;',
      imports: [
        {
          name: ['Pets'],
          path: './Pets',
          isTypeOnly: true,
        },
        {
          name: ['Lily'],
          path: './Pets',
          isTypeOnly: true,
        },
        {
          name: 'Dog',
          path: './Dog',
          isTypeOnly: true,
        },
      ],
    }

    const fileExport: File = {
      path: path.resolve('./src/models/file1.ts'),
      fileName: 'file1.ts',
      source: '',
      exports: [
        {
          name: ['Pets'],
          path: './Pets',
          isTypeOnly: true,
        },
        {
          name: ['Lily'],
          path: './Pets',
          isTypeOnly: true,
        },
        {
          name: 'Dog',
          asAlias: true,
          path: './Dog',
          isTypeOnly: true,
        },
      ],
    }

    expect(getFileSource(fileImport)).toEqual('import type { Pets, Lily } from "./Pets";\nimport type Dog from "./Dog";\n\nexport const test = 2;')

    expect(getFileSource(fileExport)).toEqual('export type { Pets, Lily } from "./Pets";\nexport type * as Dog from "./Dog";\n\n')
  })

  test('if combineFiles is combining `exports`, `imports` and `source` for the same file', () => {
    const importFiles: Array<File | null> = [
      null,
      {
        path: path.resolve('./src/models/file1.ts'),
        fileName: 'file1.ts',
        source: 'export const test = 2;',
        imports: [
          {
            name: 'Pets',
            path: './Pets',
            isTypeOnly: true,
          },
        ],
        env: {
          test: 'test',
        },
      },
      {
        path: path.resolve('./src/models/file1.ts'),
        fileName: 'file2.ts',
        source: 'export const test2 = 3;',
        imports: [
          {
            name: 'Cats',
            path: './Cats',
            isTypeOnly: true,
          },
        ],
      },
    ]

    const exportFiles: Array<File | null> = [
      null,
      {
        path: path.resolve('./src/models/file1.ts'),
        fileName: 'file1.ts',
        source: 'export const test = 2;',
        exports: [
          {
            name: 'Pets',
            path: './Pets',
            isTypeOnly: true,
          },
        ],
      },
      {
        path: path.resolve('./src/models/file1.ts'),
        fileName: 'file2.ts',
        source: 'export const test2 = 3;',
        exports: [
          {
            name: 'Cats',
            path: './Cats',
            isTypeOnly: true,
          },
        ],
      },
    ]

    expect(combineFiles(importFiles)).toEqual([
      {
        path: path.resolve('./src/models/file1.ts'),
        fileName: 'file2.ts',
        source: 'export const test = 2;\nexport const test2 = 3;',
        imports: [
          {
            name: 'Pets',
            path: './Pets',
            isTypeOnly: true,
          },
          {
            name: 'Cats',
            path: './Cats',
            isTypeOnly: true,
          },
        ],
        exports: [],
        env: {
          test: 'test',
        },
      },
    ])

    expect(combineFiles(exportFiles)).toMatchObject([
      {
        path: path.resolve('./src/models/file1.ts'),
        fileName: 'file2.ts',
        source: 'export const test = 2;\nexport const test2 = 3;',
        imports: [],
        exports: [
          {
            name: 'Pets',
            path: './Pets',
            isTypeOnly: true,
          },
          {
            name: 'Cats',
            path: './Cats',
            isTypeOnly: true,
          },
        ],
      },
    ])
  })

  test(`if writeIndexes returns 'index.ts' files`, () => {
    const rootPath = path.resolve(__dirname, '../../../mocks/treeNode')
    const files = getIndexes(rootPath)

    expect(files?.every((file) => file.fileName === 'index.ts')).toBeTruthy()
  })

  test('if getFileSource is setting `process.env` based on `env` object', async () => {
    const fileImport: File = {
      path: path.resolve('./src/models/file1.ts'),
      fileName: 'file1.ts',
      source: 'export const hello = process.env.HELLO;',
      imports: [
        {
          name: ['Pets'],
          path: './Pets',
          isTypeOnly: true,
        },
      ],
      env: {
        HELLO: `"world"`,
      },
    }

    const fileImportAdvanced: File = {
      path: path.resolve('./src/models/file1.ts'),
      fileName: 'file1.ts',
      source: 'export const hello = process.env["HELLO"];',
      imports: [
        {
          name: ['Pets'],
          path: './Pets',
          isTypeOnly: true,
        },
      ],
      env: {
        HELLO: `"world"`,
      },
    }

    const fileImportDeclareModule: File = {
      path: path.resolve('./src/models/file1.ts'),
      fileName: 'file1.ts',
      source: `
      declare const TEST: string;

      export const hello = typeof TEST !== 'undefined' ? TEST : undefined
      `,
      imports: [
        {
          name: ['Pets'],
          path: './Pets',
          isTypeOnly: true,
        },
      ],
      env: {
        TEST: `"world"`,
      },
    }

    expect(await format(getFileSource(fileImport))).toEqual(
      await format(`
    import type { Pets } from "./Pets";

    export const hello = "world";

    `),
    )
    expect(await format(getFileSource(fileImportAdvanced))).toEqual(
      await format(`
    import type { Pets } from "./Pets";

    export const hello = "world";

    `),
    )

    expect(await format(getFileSource(fileImportDeclareModule))).toEqual(
      await format(`
    import type { Pets } from "./Pets";

    export const hello = typeof "world" !== 'undefined' ? "world" : undefined

    `),
    )
  })
})
