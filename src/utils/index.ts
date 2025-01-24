import axios from 'axios'
import SourceMap from 'source-map-js'

const getSourceMap = async (url: string) => {
  const response = await axios.get(url)
  return response
}
const findCodeBySourcemap = async (stackFrame: any) => {
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
