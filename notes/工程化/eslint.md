# VSCode Eslint Prettier

## ESLint

[ESLint](https://cn.eslint.org/docs/user-guide/getting-started) 是在 ECMAScript/JavaScript 代码中识别和报告模式匹配的工具，它的目标是保证代码的一致性和避免错误。在许多方面，它和 JSLint、JSHint 相似，除了少数的例外

## Prettier

[Prettier](https://prettier.io/docs/en/index.html) is an opinionated code formatter with support for

## Prettier vs. Linters

Prettier的作用是保持代码风格，Linters的作用是保证代码质量，规避一些错误

## VSCode插件

- ESLint

## 需要依赖

- `eslint`
- `prettier`
- `eslint-config-prettier`(关掉 ESLint 规则中不需要或者会与 Prettier 冲突的)
- `eslint-plugin-prettier`(使 Prettier 成为 ESLint 的规则)
- `eslint-plugin-vue`(找出.vue 文件中的语法错误)

## 配置文件

- **.eslintrc**

```javascript
{
    root: true,
    env: {
        node: true,
        browser: true
    },
    extends: [ "plugin:vue/recommended","eslint:recommended","plugin:prettier/recommended"],
    rules: {
    "vue/component-name-in-template-casing": ["error", "PascalCase"],
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off"
    },
}
```

- **.prettierrc**

```json
{
    semi:false
    singleQuote:true
}

```

## 使用

配置完毕后再VSCode 中使用`ctrl+alt+f`选择eslint来格式化代码，或者也可以在VSCode中工作区`setting.json`中设置`"editor.formatOnSave": true` 在保存时自动格式化
