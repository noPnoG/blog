const State = {
  initial: 1,
  tagOpen: 2,
  tagName: 3,
  text: 4,
  tagEnd: 5,
  tagEndName: 6,
}
//判断是否字母
function isAlpha(char) {
  return (char >= "a" && char <= "z") || (char >= "A" && char <= "Z")
}
//接收模板字符串作为参数，并切割成token返回
function tokenize(str) {
  //状态机的当前状态
  let currentState = State.initial
  //缓存字符
  const chars = []
  //存储token
  const tokens = []
  //开始循环，只要模板字符串还有则一直循环
  while (str) {
    //查看第一个字符
    const char = str[0]
    switch (currentState) {
      //当前状态为初始状态呀
      case State.initial:
        //如果当前字符为<说明是标签开始
        if (char === "<") {
          //状态机切换到标签开始状态
          currentState = State.tagOpen
          //消费字符<
          str = str.slice(1)
        } else if (isAlpha(char)) {
          //状态机切换到文本状态
          currentState = State.text
          //缓存char
          chars.push(char)
          //消费字符
          str = str.slice(1)
        }
        break
      //当前状态为标签打开状态
      case State.tagOpen:
        //如果当前字符是字母
        if (isAlpha(char)) {
          //状态机切换到标签名状态
          currentState = State.tagName
          //字符存入缓存
          chars.push(char)
          //消费当前字符
          str = str.slice(1)
          //如果当前字符是/
        } else if (char === "/") {
          //状态机切换到标签关闭状态
          currentState = State.tagEnd
          //消费字符'/'
          str = str.slice(1)
        }
        break
      //状态机处于标签名状态
      case State.tagName:
        if (isAlpha(char)) {
          //缓存字符
          chars.push(char)
          //消费字符
          str = str.slice(1)
        } else if (char === ">") {
          //状态机回到初始状态
          currentState = State.initial
          //存入taken
          tokens.push({
            type: "tag",
            name: chars.join(""),
          })
          //清空字符缓存
          chars.length = 0
          //消费当前字符
          str = str.slice(1)
        }
        break
      //状态机处于文本状态
      case State.text:
        //如果当前字符是字母
        if (isAlpha(char)) {
          //缓存char
          chars.push(char)
          //消费当前字符
          str = str.slice(1)
        } else if (char === "<") {
          //当前状态改为标签开始
          currentState = State.tagOpen
          //存入文本节点
          tokens.push({
            type: "text",
            content: chars.join(""),
          })
          //缓存置空
          chars.length = 0
          //消费当前字符
          str = str.slice(1)
        }
        break
      case State.tagEnd:
        if (isAlpha(char)) {
          //状态机状态改成标签结束名称
          currentState = State.tagEndName
          //缓存字符
          chars.push(char)
          //消费当前字符
          str = str.slice(1)
        }
        break
      case State.tagEndName:
        if (isAlpha(char)) {
          //缓存当前字符
          chars.push(char)
          //消费当前字符
          str = str.slice(1)
        } else if (char === ">") {
          //切换当前状态为初始状态
          currentState = State.initial
          //存入结束标签名称
          tokens.push({
            type: "tagEnd",
            name: chars.join(""),
          })
          //清空字符缓存
          chars.length = 0
          //消费当前节点
          str = str.slice(1)
        }
        break
    }
  }
  return tokens
}

//简单解析函数
export function parser(str) {
  //将模板字符串标记化返回tokens
  const tokens = tokenize(str)
  //创建root节点
  const root = {
    type: "Root",
    children: [],
  }
  //创建elementStark栈最开始只存了root
  const elementStark = [root]
  //循环tokens
  while (tokens.length) {
    //element指向栈顶
    const element = elementStark[elementStark.length - 1]
    //当前处理的token
    const t = tokens[0]
    switch (t.type) {
      //开始标签
      case "tag":
        //创建节点
        const elementNode = {
          type: "Element",
          tag: t.name,
          children: [],
        }
        //将节点压入elementStark
        elementStark.push(elementNode)
        //将节点插在当前栈顶节点的子节点
        element.children.push(elementNode)
        break
      case "text":
        //创建文本节点
        const textNode = {
          type: "Text",
          content: t.content,
        }
        //将节点压入elementStark
        element.children.push(textNode)
        break
      case "tagEnd":
        //弹出栈顶
        elementStark.pop()
        break
    }
    //消费当前token
    tokens.shift()
  }
  return root
}

const TextModes = {
  DATA: "DATA",
  RCDATA: "RCDATA",
  RAWTXT: "RAWTXT",
  CDATA: "CDATA",
}

//优化的解析函数

export function parser1(str) {
  const context = {
    source: str,
    mode: TextModes.DATA,
    //advanceBy函数用来消费指定数量的字符，它接收一个数字作为参数
    advanceBy(num) {
      context.source = context.source.slice(num)
    },
    //消费空白字符串
    advanceSpaces() {
      const match = /^[\t\r\n\f ]+/.exec(context.source)
      if (match) {
        context.advanceBy(match[0].length)
      }
    },
  }
  const nodes = parseChildren(context, [])
  return {
    type: "Root",
    children: nodes,
  }
}
function isEnd(context, ancestors) {
  if (!context.source) return true
  for (let i = ancestors.length - 1; i >= 0; i--) {
    if (context.source.startsWith(`</${ancestors[i].tag}`)) return true
  }
}
//解析文本插值{{}}
function parseInterpolation(context) {
  context.advanceBy("{{".length)
  let closeIndex = context.source.indexOf("}}")
  if (closeIndex < 0) {
    console.error("插值缺少结束界定符")
  }
  const content = context.source.slice(0, closeIndex)
  context.advanceBy(content.length)
  context.advanceBy("}}".length)
  return {
    type: "Expression",
    content,
  }
}
//解析文本
function parseText(context) {
  //文本结尾索引
  let endIndex = context.source.length
  //<位置
  let ltIndex = context.source.indexOf("<")
  //{{位置
  const delimiterIndex = context.source.indexOf("{{")
  if (ltIndex > -1 && ltIndex < endIndex) {
    endIndex = ltIndex
  }
  if (delimiterIndex > -1 && delimiterIndex < endIndex) {
    endIndex = delimiterIndex
  }
  const content = context.source.slice(0, endIndex)
  context.advanceBy(content.length)
  return {
    type: "Text",
    content,
  }
}
//解析属性
function parseAttributes(context) {
  const props = []
  const { advanceSpaces, advanceBy } = context
  while (!context.source.startsWith(">") && !context.source.startsWith("/>")) {
    const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source)
    const name = match[0]
    advanceBy(name.length)
    advanceSpaces()
    //消费等于号
    advanceBy(1)
    advanceSpaces()
    let value = ""
    const quote = context.source[0]
    const isQuoted = quote === "'" || quote === '"'
    if (isQuoted) {
      advanceBy(1)
      const endQuoteIndex = context.source.indexOf(quote)
      if (endQuoteIndex > -1) {
        value = context.source.slice(0, endQuoteIndex)
        advanceBy(value.length)
        advanceBy(1)
      } else {
        console.error("缺少引号")
      }
    } else {
      const match = /^[^\t\r\n\f />]+/.exec(context.source)
      value = match[0]
      advanceBy(value.length)
    }
    advanceSpaces()
    props.push({
      type: "Attribute",
      name,
      value,
    })
  }
  return props
}
//解析标签
function parseTag(context, type = "start") {
  const { advanceBy, advanceSpaces } = context
  const match =
    type === "start"
      ? /^<([a-z][^\t\r\n\f />]*)/i.exec(context.source)
      : /^<\/([a-z][^\t\r\n\f />]*)/i.exec(context.source)
  const tag = match[1]
  advanceBy(match[0].length)
  advanceSpaces()
  const props = parseAttributes(context)
  const isSelfClosing = context.source.startsWith("/>")
  advanceBy(isSelfClosing ? 2 : 1)
  return {
    type: "Element",
    tag,
    props,
    children: [],
    isSelfClosing,
  }
}
//解析元素
function parseElement(context, ancestors) {
  const element = parseTag(context)
  if (element.isSelfClosing) return element
  if (element.tag === "textarea" || element.tag === "title") {
    context.mode = TextModes.RCDATA
  } else if (/style|xmp|iframe|noembed|noframes|noscript/.test(element.tag)) {
    context.mode = TextModes.RAWTXT
  } else {
    context.mode = TextModes.DATA
  }

  ancestors.push(element)
  element.children = parseChildren(context, ancestors)
  ancestors.pop()
  if (context.source.startsWith(`</${element.tag}`)) {
    parseTag(context, "end")
  } else {
    console.error(`${element.tag}标签缺少闭合标签`)
  }
  return element
}
function parseChildren(context, ancestors) {
  let nodes = []
  const { mode, source } = context
  while (!isEnd(context, ancestors)) {
    let node
    if (mode === TextModes.DATA || mode === TextModes.RCDATA) {
      if (mode === TextModes.DATA && source[0] === "<") {
        if (source[1] === "!") {
          if (source.startsWith("<!--")) {
            //注释
            node = parseComment(context)
          } else if (source.startsWith("<![CDATA[")) {
            //CDATA
            node = parseCDATA(context, ancestors)
          }
        } else if (source[1] === "/") {
          //结束标签
          console.error("无效的结束标签")
          continue
        } else if (/[a-z]/i.test(source[1])) {
          //标签
          node = parseElement(context, ancestors)
        }
      } else if (source.startsWith("{{")) {
        //插值
        node = parseInterpolation(context)
      }
    }
    if (!node) {
      //node不存在说明是解析文本
      node = parseText(context)
    }
    nodes.push(node)
  }
  return nodes
}

// const tree = parser1("<div id='foo' v-show='display'></div>")
// const tree = parser1("<div>{{vue}}</div>")
// console.log(tree)
