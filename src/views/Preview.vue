<template>
  <div class="pre-code">

    <div class="'error-detail'">

      <pre class="error-code" v-html="preLine()">


      </pre>
    </div>
  </div>
</template>

<script setup lang="ts">

  import { encode } from 'he'

  type OriginType = {
    line: number;
    source: string;
  }
  const props = defineProps<{ origin: OriginType }>()

  const preLine = () => {
    const line = props.origin.line;
    const originCodeLine = props.origin.source.split('\n')[line - 1];
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
</script>

<style lang="less" scoped>

.pre-code {
  .error-detail {
    .error-code {
      padding: 10px;
      overflow: hidden;
      font-family: consolas, 'Courier New', Courier, monospace;
      word-wrap: normal
    }
  }
}

</style>
