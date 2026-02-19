<script lang="ts">
  import Portal from 'svelte-portal';

  let {
    options = [],
    wide = false,
    displayTexts = options,
    currentOption = $bindable(),
    onchange
  }: {
    options: any[];
    wide?: boolean;
    displayTexts?: string[];
    currentOption: any;
    onchange?: (option: any) => void;
  } = $props();

  // 内部用索引管理选中状态，与 currentOption 同步
  let currentIndex = $state(0);
  function tupleEq(a: any[], b: any[]) {
    return a.length === b.length && a.every((val, index) => val === b[index]);
  }

  $effect(() => {
    // 同步 currentIndex 和 currentOption
    if (options[currentIndex] !== currentOption) {
      currentIndex = options.indexOf(currentOption);
      if (currentIndex === -1) {
        currentIndex = options.findIndex(o => tupleEq(o, $state.snapshot(currentOption)));
      }
    }
  });
  // 使用 Svelte 5 runes 语法声明响应式状态
  let isPopupVisible = $state(false);
  let isFading = $state(false);

  // 使用 rune 语法处理点击外部关闭功能
  let popupRef = $state(null);
  let buttonRef = $state(null);

  // 切换弹窗显示状态
  function togglePopup() {
    if (!isPopupVisible) {
      isPopupVisible = true
    } else {
      closePopup();
    }
  }

  // 关闭弹窗
  function closePopup() {
    isFading = true
    setTimeout(()=> isFading = isPopupVisible = false, 500);
  }

  // 选择选项并关闭弹窗
  function selectOption(index: number) {
    currentIndex = index;
    const option = options[index];
    currentOption = option;
    onchange?.(option);
    closePopup();
  }

  // 点击外部关闭弹窗
  function handleClickOutside(e: Event) {
    if (isPopupVisible && popupRef && !popupRef.contains(e.target) &&
        buttonRef && !buttonRef.contains(e.target)) {
      closePopup();
    }
  }

  // 添加和移除全局点击监听器
  $effect(() => {
    if (isPopupVisible) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<!-- 触发按钮 -->
<div class:wide={wide}
  class="trigger-button"
  role="button"
  tabindex="0"
  bind:this={buttonRef}
  onclick={togglePopup}
  onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') togglePopup(); }}
>
  <!-- 如果有传入插槽内容则使用插槽，否则使用默认内容 -->
<div class="default-button-content">
    {currentIndex >= 0 ? (displayTexts?.[currentIndex] || options[currentIndex]) : 'Select Option'}
</div>

  <!-- 弹窗内容 -->
  {#if isPopupVisible}
  <Portal target="body">
    <div
      class="popup-window" class:closed={isFading}
      role="dialog"
      tabindex="0"
      bind:this={popupRef}
      onclick={(e) => e.stopPropagation()}
    >
      <!-- 选项列表 -->
      <div class="options-list">
        {#each options as option, i}
          <div
            class="option-item"
            class:selected={i === currentIndex}
            role="option"
            tabindex="0"
            aria-selected={i === currentIndex}
            onclick={() => selectOption(i)}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectOption(i); }}
          >
            {displayTexts?.[i] || option}
          </div>
        {/each}
      </div>
    </div>
  </Portal>
  {/if}
</div>

<style lang="less">
  .trigger-button {
    width: 8vh;
    height: 8vh;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background-color: #f0f0f0;
    border-radius: 8px;
    transition: background-color 0.2s ease;
    position: relative;
    font-size: 2.5vh;
  }
  .wide {
    width: unset;
    min-width: 15vh;
    height: 5vh;
  }

  .trigger-button:hover {
    background-color: #e0e0e0;
  }

  .default-button-content {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .popup-window {
    position: fixed;
    bottom: 20vh;
    right: 15vh;
    width: 12vw;
    font-size: 1.5vw;
    max-height: 60vh;
    overflow-y: auto;
    scrollbar-width: none;
    background-color: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
    transition: opacity 0.3s ease;
    &.closed {
      opacity: 0;
    }
  }

  .options-list {
    padding: 8px 0;
  }

  .option-item {
    padding: 0.8vh 0.4vw;
    text-align: center;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .option-item:hover {
    background-color: #f5f5f5;
  }

  .option-item.selected {
    background-color: #e3f2fd;
    font-weight: bold;
  }

  @keyframes slideIn {
    from { 
      opacity: 0;
      transform: translateX(30vh);
    }
    to { 
      opacity: 1;
      transform: translateX(0);
    }
  }
</style>