<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import SourceMap from 'source-map-js'
import Preview from './Preview.vue'

type MyFramesObj = {
  line: number;
  column: number;
  index: number;
}

type StackFrameType = {
  columnNumber: number;
  fileName: string;
  functionName: string;
  lineNumber: number;
  source: string
}

const activeName = ref<string[]>(['1'])
const tabActiveName = ref<string>('local')
const js_error = ref<any>(null)

const innerVisible = ref(false)
const isError = ref(false)

let stackFramesObj: MyFramesObj = {
  line: 0,
  column: 0,
  index: 0,
}

const openDialog = (item: StackFrameType, index: number) => {
  console.log('打开的item', item)
  innerVisible.value = true
  stackFramesObj = {
    line: item.lineNumber,
    column: item.columnNumber,
    index: index,
  }
}

const getSource = async (sourcemap: any, lineNo: number, columnNo: number) => {
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
    console.log('映射后的 code', code)
    js_error.value.stack_frames[stackFramesObj.index].origin = code
    innerVisible.value = false
  }
}

onMounted(() => {
  try {
    const jsErrorList = localStorage.getItem('jsErrorList')
    if (jsErrorList) {
      isError.value = true
      js_error.value = JSON.parse(jsErrorList)
    }
  } catch (error: any) {
    console.error(error)
  }
})
</script>

<template>
  <div v-if="isError">
    <el-collapse v-model="activeName" accordion>
      <el-collapse-item
        v-for="(item, index) in js_error.stack_frames"
        :key="index"
        :name="index"
        :title="item.source"
      >
        <el-row :gutter="20">
          <el-col :span="20">
            <div>{{ item.fileName }}</div>
          </el-col>

          <el-col :span="4">
            <el-button type="primary" size="small" @click="openDialog(item, index)"> 映射源码 </el-button>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <template v-if="item.origin">
            <!-- {{ item.origin }} -->

            <Preview :origin="item.origin" />
          </template>
          <template v-else>
            {{ item.fileName }}
          </template>
        </el-row>
      </el-collapse-item>
    </el-collapse>

    <el-dialog v-model="innerVisible" width="500" title="sourcemap 源码映射" append-to-body>
      <el-tabs v-model="tabActiveName" class="demo-tabs">
        <el-tab-pane label="本地上传" name="local">
          <el-upload drag :before-upload="sourcemapBeforeUpload">
            <i class="el-icon-upload"></i>
            <div>将文件拖动到此处</div>
          </el-upload>
        </el-tab-pane>
        <el-tab-pane label="远程加载" name="request">Config</el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>
