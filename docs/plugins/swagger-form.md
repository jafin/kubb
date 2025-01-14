---
layout: doc

title: \@kubb/swagger-form
outline: deep
---
# @kubb/swagger-form <Badge type="warning" text="beta" />

::: warning
For now only a textbox and checkbox are getting generated(one level deep)
:::


With the Swagger Form plugin you can create: 
- [react-hook-form](https://react-hook-form.com) forms based on an operation in the Swagger file.
- [data-driven-forms](https://www.data-driven-forms.org/) forms based on an operation in the Swagger file.

## Installation

::: code-group

```shell [bun]
bun add @kubb/swagger-form
```

```shell [pnpm]
pnpm add @kubb/swagger-form
```

```shell [npm]
npm install @kubb/swagger-form
```

```shell [yarn]
yarn add @kubb/swagger-form
```

:::


## Options


### output
Output to save the form.

Type: `string` <br/>
Default: `"forms"`

### groupBy
Group the form based on the provided name.

#### type
Tag will group based on the operation tag inside the Swagger file.

Type: `'tag'` <br/>
Required: `true`

#### output
Relative path to save the grouped form.
`{{tag}}` will be replaced by the current tagName.

Type: `string` <br/>
Example: `${output}/{{tag}}Controller` => `forms/PetController` <br/>
Default: `${output}/{{tag}}Controller`

#### exportAs
Name to be used for the `export * as {{exportAs}} from './`

Type: `string` <br/>
Default: `"{{tag}}forms"`

### withDevtools <Badge type="danger" text="deprecated" />
Includes `@hookform/devtools

Type: `boolean` <br/>
Default: `false`

### overrides
Override default behaviour of the formParser

#### mapper
Override the default fields templates with your own

Type: `Partial<Record<FormKeyword, { template: string; imports?: Import[] }>>` <br/>
Link: [`FormKeyword`](https://github.com/stijnvanhulle/kubb/blob/main/packages/swagger-form/src/parsers/formParser.ts)

##### Example: replace of `boolean` type to use the `ant-design` checkbox

See react-hook-form and data-driven-forms in examples

```typescript
{
  boolean: {
    template: `
    <Controller
      name="{{name}}"
      render={({ field }) => (
        <Checkbox {...field as any} id="{{name}}" type="checkbox" value={field.value? "checked": undefined} checked={field.value} />
      )}
      control={control}
      defaultValue={{defaultValue}}
      rules={{
        required: {{required}}
      }}
    />
  `,
    imports: [
      {
        name: ['Checkbox'],
        path: 'antd',
      },
    ],
  },
},
```

#### form
Override the form templates with your own

Type: `{ template: string; imports?: Import[] }` <br/>
Link: See `kubb.config.js` in [data-driven-forms](/examples/data-driven-forms),  [react-hook-form](/examples/react-hook-form)

### skipBy
Array containing skipBy paramaters to exclude/skip tags/operations/methods/paths.

Type: `Array<SkipBy>` <br/>

#### [0]
Type: `{ type: 'tag' | 'operationId' | 'path' | 'method' ; pattern: string | RegExp }` <br/>


## Depended

- [`@kubb/swagger`](/plugins/swagger)
- [`@kubb/swagger-ts`](/plugins/swagger-ts)

## Links

- [react-hook-form](https://react-hook-form.com)
- [data-driven-forms](https://www.data-driven-forms.org/)