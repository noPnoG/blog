import { parser1 as parser } from "./parser.js"

//深度遍历转换
function traverseNode(ast, context) {
  context.currentNode = ast
  const exitFns = []
  const transForms = context.nodeTransforms
  for (let i = 0; i < transForms.length; i++) {
    const onExit = transForms[i](context.currentNode, context)
    onExit && exitFns.push(onExit)
    if (!context.currentNode) return
  }
  const children = context.currentNode.children
  if (children) {
    children.forEach((node, index) => {
      context.parent = context.currentNode
      context.childIndex = index
      traverseNode(node, context)
    })
  }
  let i = exitFns.length
  while (i--) {
    exitFns[i]()
  }
}
function createStringLiteral(value) {
  return {
    type: "StringLiteral",
    value,
  }
}
function createIdentifier(name) {
  return {
    type: "Identifier",
    name,
  }
}
function createArrayExpression(elements) {
  return {
    type: "ArrayExpression",
    elements,
  }
}
function createCallExpression(callee, arg) {
  return {
    type: "CallExpression",
    callee: createIdentifier(callee),
    arguments: arg,
  }
}
//转换函数
function transform(ast) {
  function transformRoot(node) {
    return () => {
      if (node.type !== "Root") {
        return
      }
      const vnodeJSAST = node.children[0].jsNode
      node.jsNode = {
        type: "FunctionDecl",
        id: { type: "Identifier", name: "render" },
        params: [],
        body: [
          {
            type: "ReturnStatement",
            return: vnodeJSAST,
          },
        ],
      }
    }
  }
  function transformElement(node) {
    return () => {
      if (node.type !== "Element") return
      const callExp = createCallExpression("h", [createStringLiteral(node.tag)])
      node.children.length === 1
        ? callExp.arguments.push(node.children[0].jsNode)
        : callExp.arguments.push(
            createArrayExpression(node.children.map((c) => c.jsNode))
          )
      node.jsNode = callExp
    }
  }
  function transformText(node) {
    if (!node.type === "Text") {
      return
    }
    node.jsNode = createStringLiteral(node.content)
  }
  const context = {
    //存储当前节点
    currentNode: null,
    //当前节点index
    childIndex: 0,
    //父节点
    parent: null,
    //替换当前节点
    replaceNode(node) {
      context.parent.children[this.childIndex] = node
      context.currentNode = node
    },
    //移除当前节点
    removeNode() {
      if (context.parent) {
        context.parent.children.splice(context.childIndex, 1)
        context.currentNode = null
      }
    },
    nodeTransforms: [transformElement, transformText, transformRoot],
  }
  traverseNode(ast, context)
}

function dump(node, indent = 0) {
  const type = node.type
  const des =
    node.type === "root"
      ? ""
      : node.type === "Element"
      ? node.tag
      : node.content
  console.log(`${"-".repeat(indent)}${type}:${des}`)
  node.children &&
    node.children.forEach((element) => {
      dump(element, indent + 2)
    })
}
function genNode(node, context) {
  function genNodeList(nodes, context) {
    const { push } = context
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      genNode(node, context)
      if (i < nodes.length - 1) {
        push(", ")
      }
    }
  }
  function getFunctionDecl(node, context) {
    const { push, indent, deIndent } = context
    push(`function ${node.id.name} `)
    push(`(`)
    genNodeList(node.params, context)
    push(`) `)
    push(`{`)
    indent()
    node.body.forEach((n) => genNode(n, context))
    deIndent()
    push(`}`)
  }
  function getArrayExpression(node, context) {
    const { push } = context
    push(`[`)
    genNodeList(node.elements, context)
  }
  function getStringLiteral(node, context) {
    const { push } = context
    push(`'${node.value}'`)
  }
  function getReturnStatement(node, context) {
    const { push } = context
    push(`return `)
    genNode(node.return, context)
  }
  function getCallExpression(node, context) {
    const { push } = context
    const { callee, arguments: args } = node
    push(`${callee.name}(`)
    genNodeList(args, context)
    push(`)`)
  }
  switch (node.type) {
    case "FunctionDecl":
      getFunctionDecl(node, context)
      break
    case "ReturnStatement":
      getReturnStatement(node, context)
      break
    case "CallExpression":
      getCallExpression(node, context)
      break
    case "ArrayExpression":
      getArrayExpression(node, context)
      break
    case "StringLiteral":
      getStringLiteral(node, context)
      break
  }
}
function generate(node) {
  const context = {
    code: "",
    push(code) {
      context.code += code
    },
    currentIndex: 0,
    newline() {
      context.code += "\n" + ` `.repeat(context.currentIndex)
    },
    indent() {
      context.currentIndex++
      context.newline()
    },
    deIndent() {
      context.currentIndex--
      context.newline()
    },
  }
  genNode(node, context)
  return context.code
}

function complier(template) {
  const ast = parser(template)

  transform(ast)

  const code = generate(ast.jsNode)
  return code
}

const code = complier("<div><p>Vue</p><p>Template</p></div>")
console.log(code)
