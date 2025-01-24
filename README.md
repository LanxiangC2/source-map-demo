## 背景

1. github cicd workflow 构建 demo
2. source map 调试

source map 不能构建到线上，会直接暴露出去源码，
我们使用:

1. 在 vue 捕获错误的方法中将 错误的`行号`和`列号`拿到，借助`error-stack-parser`

```js
app.config.errorHandler = (err) => {
  const errorStack = ErrorStackParser.parse(err as Error)
  console.log('error', errorStack[0].toString())
}
```

2. 安装 `source-map.js` 把错误和源代码映射到一起
