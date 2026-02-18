<script lang="ts">
  let { 
    value = $bindable([0, 0, 0]),
    disabled = false
  }: {
    value?: [number, number, number];
    disabled?: boolean;
  } = $props();

  $effect(() => {
    // 阻止分母为0
    if (value[2] === 0) {
      value[2] = 1;
    }
  });
</script>

<div class="fraction-input">
  <!-- 第一行：输入框 -->
  <input
    type="number"
    class="input-cell integer"
    bind:value={value[0]}
    {disabled}
  />
  <input
    type="number"
    class="input-cell numerator"
    bind:value={value[1]}
    {disabled}
  />

  <!-- 第二行：分数线 -->
  <div class="divider"></div>
  <div></div>

  <!-- 第三行：分母输入框 -->
  <input
    type="number"
    class="input-cell denominator"
    bind:value={value[2]}
    {disabled}
  />
</div>

<style scoped lang="less">
@import "#/components/mixin.less";
  .fraction-input {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr auto 1fr;
    gap: 4px;
  }

  .integer {
    grid-row: 1 / 4;
  }
  .numerator {
    grid-column: 2 / 3;
    grid-row: 1 / 2;
  }
  .denominator {
    grid-column: 2 / 3;
    grid-row: 3 / 4;
  }

  .input-cell {
    .input;
    width: 2.5em;
    margin: auto;
    text-align: center;
    font-size: 1.8vh;
    box-sizing: border-box;

  }

  .input-cell:focus {
    outline: none;
    border-color: #2196F3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
  }

  .divider {
    grid-column: 2;
    grid-row: 2 / 3;
    border-bottom: 2px solid #eee;
    width: 90%;
    margin: 0 auto;
  }
</style>
