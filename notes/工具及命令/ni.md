# ni

## 什么是ni

使用正确的包管理工具的一个三方命令行工具

## 为什么用ni

方便包管理,自动使用正确的包管理工具

## 怎么使用

### 安装

```dos
npm i -g @anfu/ni
```

### ni-install

```dos
ni

# npm install
# yarn install
# pnpm install
ni axios

# npm i axios
# yarn add axios
# pnpm add axios
```

### ni-run

```dos
nr dev --port=3000

# npm run dev -- --port=3000
# yarn run dev --port=3000
# pnpm run dev -- --port=3000

nr -

# rerun the last command
```

### nx - execute

```dos
nx jest

# npx jest
# yarn dlx jest
# pnpm dlx jest
```

### nun - uninstall

```dos
nun axios

# npm uninstall axios
# yarn remove axios
# pnpm remove axios

nun -g eslint

# npm uninstall -g eslint
# yarn global remove eslint
# pnpm remove -g eslint
```
