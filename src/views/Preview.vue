<template>
  <div class="pre-code">

    <div class="error-detail">

      <div class="error-code" v-html="content" />
    </div>
  </div>
</template>

<script setup lang="ts">

  import { encode } from 'he'
  import { ref, onMounted } from 'vue'

  type OriginType = {
    line: number;
    column: number;
    code: string;
  }
  const props = defineProps<{ origin: OriginType }>()
  const content = ref<string>()

  const preLine = () => {
    const line = props.origin.line;
    // 先获取源码有多少行
    const originCodeLine = props.origin.code.split('\n');

    // 发生错误的那一行
    // const errorLine = originCodeLine[line - 1];
    // console.log('originCodeLine', originCodeLine)
    const len = originCodeLine.length - 1;
    const start = line - 3 < 0 ? 0 : line - 3;
    const end = start + 5 >= len ? len : start + 5; // 最多显示6行
    const newLines: string[] = [];

    for (let i = start; i <= end; i++) {
      const content = i + 1 + '.  ' + encode(originCodeLine[i])
      newLines.push(`
        <div class="code-line ${i + 1 === line ? 'heightlight': ""}">
          ${content}
        </div>

      `);

    }
    return newLines.join('\n');
  }

  onMounted(() => {
    content.value = preLine();
  })
</script>

<style lang="less" scoped>

.pre-code {
  .error-detail {
    .error-code {
      margin-left: 20px;
      padding: 10px;
      overflow: hidden;
      font-family: consolas, 'Courier New', Courier, monospace;
      word-wrap: normal;
      .heightlight {
        color: white;
        background-color: yellow;
      }
    }

  }
}

</style>
