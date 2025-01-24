## 背景

1. github cicd workflow 构建 demo
2. source map 调试

source map 不能构建到线上，会直接暴露出去源码，
我们使用:

1. 在 vue 捕获错误的方法中将 错误的`行号`和`列号`拿到，借助`error-stack-parser`

```js
// vue3 的 main.ts
import ErrorStackParser from 'error-stack-parser'

app.config.errorHandler = (err) => {
  const errorStack = ErrorStackParser.parse(err as Error)
  // errorStack 是一个数组，真正有用的数据在第一个元素里，可以定位到出错的位置
  //  columnNumber, lineNumber, fineName  // errorStack[0]
  console.log('errorStack[0]', errorStack[0])
  findCodeBySourcemap(errorStack[0])
}
```

2. 安装 `source-map-js` 目的是把错误和源代码映射到一起

```js
import axios from 'axios'
import SourceMap from 'source-map-js'

const getSourceMap = async (url: string) => {
  const response = await axios.get(url)
  return response
}
const findCodeBySourcemap = async (stackFrame: any) => {
  // 真实情况下，sourceMap 不和在同一个地方，这是处于安全考虑，所以需要去真实存在的服务器上获取，这里为了演示，就直接放在本地了
  // *** 重要 ***
  const sourcemap = await getSourceMap(stackFrame.fileName + '.map')

  const fileContent = sourcemap.data

  // 解析 sourcemap 文件
  const consumer = new SourceMap.SourceMapConsumer(fileContent)
  // 通过报错的位置查找对应的源文件的名称和行数
  const originalPosition = consumer.originalPositionFor({
    line: stackFrame.lineNumber,
    column: stackFrame.columnNumber - 1, // 注意：列号需要减一，因为 SourceMap 的列号是0开始的
  })
  const code = consumer.sourceContentFor(originalPosition.source)
  // 还原之后的代码片段
  console.log('还原之后的代码片段：', code)
}

export { findCodeBySourcemap }
```

## 功能细化级美化

在 dev 分支做
见项目的 `HomeView.vue`

服务器上不能放 sourcemap 文件，所以我们需要自己维护sourcemap文件
1. 自己上传
```vue
  <el-upload drag :before-upload="sourcemapBeforeUpload">
    <i class="el-icon-upload"></i>
    <div>将文件拖动到此处</div>
  </el-upload>
```
然后自己在 `sourcemapBeforeUpload` 方法中处理上传 sourcemap 相关的逻辑
```js
const sourcemapBeforeUpload = (file: any) => {
  if (!file.name.endsWith('.map')) {
    ElMessage.error('请上传正确的sourcemap文件!')
    return
  }

  const reader = new FileReader()
  reader.readAsText(file, 'UTF-8')
  reader.onload = async function (evt) {
    console.log('读取到的sourcemap', evt.target?.result)
    const code = await getSource(evt.target?.result, stackFramesObj.line, stackFramesObj.column)

    // 拿到源码之后，我们就可以自己去做美化展示了
    console.log('映射后的 code', code)
    js_error.value.stack_frames[stackFramesObj.index].origin = code
    innerVisible.value = false
  }
}

const _getSource = async (sourcemap: any, lineNo: number, columnNo: number) => {
  try {
    // 解析 sourcemap 文件
    const consumer = new SourceMap.SourceMapConsumer(JSON.parse(sourcemap))
    // 通过报错的位置查找对应的源文件的名称和行数
    const originalPosition = consumer.originalPositionFor({
      line: lineNo,
      column: columnNo - 1, // 注意：列号需要减一，因为 SourceMap 的列号是0开始的
    })

    console.log('originalPosition', originalPosition)
    const code = consumer.sourceContentFor(originalPosition.source)

    return {
      code,
      column: originalPosition.column,
      line: originalPosition.line,
    }
  } catch (error: any) {
    ElMessage.error('解析sourcemap失败', error)
  }
}
```

2. 放在自己的服务器上，然后通过 fetch / xhr 方式获取，处理逻辑同上
