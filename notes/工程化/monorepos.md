# Monorepos

## what is Monorepo?

Monorepo是一个工程概念，表示在**一个仓库**下包含多个**不同的项目**，且项目间有**互相依赖关系**。

作为对比的是multiRepos（每个项目对应自己的仓库，比如web端一个项目，移动端一个项目）

## 优点

- **代码公用** - 最大的优点当然是代码共用，因为所有项目都在同一仓库下，所以可以方便的共用代码。
- **简单的依赖管理** - 在多仓库的组织中每一个仓库都要下载自己的依赖，有些相同的依赖可能就需要下载多次，而且不好管理依赖的版本，monorepo就不会有这个问题。
- **原子提交（Atomic commits）** - 原子提交使大规模重构更容易，开发人员可以在一次提交中更新多个包或项目。

## 缺点

- **没有办法限制只访问代码中的某部分。**只能在整个仓库中操作，可能会有安全问题。
- **在git中的表现弱**。因为monorepo所有项目都在一起，如果你的项目是一个巨大的项目，git提交记录什么的可能会变的很庞大并且难以管理。

## how to use Monorepo

在这里用pnpm演示如何创建一个monorepo项目：

1. 创建一个空仓库，在目录下执行`pnpm init`命令。
2. 在根目录下创建一个文件 **pnpm-workspace.yaml**
  
  文件内容如下：

  ```yaml
  packages:
    # all packages in direct subdirs of packages/
    - 'packages/*'
    # all packages in subdirs of components/
    - 'components/**'
    # exclude packages that are inside test 
    - '!**/test/**'
  ```

3. 全局安装依赖`pnpm install ... -W` 这里的`-W`是是安装在根目录下的意思
4. 单独为项目添加依赖使用`pnpm install --filter foo bar`
5. 也可以使用以上命令添加包之间的互相引用，添加之后会在bar项目下的package.json文件中添加一个dependencies属性，值为`"foo": "workspace:^1.0.0"`
6. 最终生成的目录结构如下：

```
│  index.txt
│  package.json
│  pnpm-lock.yaml
│  pnpm-workspace.yaml
│  
└─packages
    ├─bar
    │  │  index.js
    │  │  package.json
    │  │  
    │  └─node_modules
    │      └─foo
    │              index.js
    │              package.json
    │              
    └─foo
            index.js
            package.json
```
