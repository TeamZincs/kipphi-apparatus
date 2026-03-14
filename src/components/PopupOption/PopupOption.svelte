<script lang="ts" generics="T">
  import { onMount, tick, untrack } from "svelte";
  import Portal from "svelte-portal";

  let {
    options = [],
    wide = false,
    displayTexts = options,
    currentOption = $bindable(),
    onchange,
  }: {
    options: T[];
    wide?: boolean;
    displayTexts?: string[];
    currentOption: T;
    onchange?: (option: T) => void;
  } & (T extends string ? {} : { displayTexts: string[] }) = $props();

  // 内部用索引管理选中状态，与 currentOption 同步
  let currentIndex = $state(0);
  function tupleEq(a: any[], b: any[]) {
    return a.length === b.length && a.every((val, index) => val === b[index]);
  }

  $effect(() => {
    // 同步 currentIndex 和 currentOption
    const index = untrack(() => currentIndex);
    if (options[index] !== currentOption) {
      const newIndex = options.indexOf(currentOption);
      if (newIndex === -1) {
        if (Array.isArray(currentOption)) {
          currentIndex = options.findIndex((o) =>
            tupleEq(o as any[], $state.snapshot(currentOption) as any[]),
          );
        } else {
          currentIndex = 0;
          currentOption = options[0];
        }
      } else {
        currentIndex = newIndex;
      }
    }
  });
  // 使用 Svelte 5 runes 语法声明响应式状态
  let isPopupVisible = $state(false);
  let isFading = $state(false);
  let isSliding = $state(false);
  let isLeft = $state(false);

  // 使用 rune 语法处理点击外部关闭功能
  let popupRef: HTMLElement = $state(null);
  let buttonRef = $state(null);

  // 切换弹窗显示状态
  function togglePopup() {
    if (!isPopupVisible) {
      isPopupVisible = true;
      const rect = buttonRef.getBoundingClientRect();
      tick().then(() => {
        console.log(rect)
        if (rect.top < window.innerHeight / 2) {
          popupRef.style.top = `${rect.bottom}px`;
        } else {
          popupRef.style.bottom = `${window.innerHeight - rect.top}px`;
        }
        isSliding = true;
      });
    } else {
      closePopup();
    }
  }

  // 关闭弹窗
  function closePopup() {
    isFading = true;
    setTimeout(() => (isFading = isSliding = isPopupVisible = false), 500);
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
    if (
      isPopupVisible &&
      popupRef &&
      !popupRef.contains(e.target) &&
      buttonRef &&
      !buttonRef.contains(e.target)
    ) {
      closePopup();
    }
  }

  // 添加和移除全局点击监听器
  $effect(() => {
    if (isPopupVisible) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });

  onMount(() => {
    const rect = buttonRef.getBoundingClientRect();
    isLeft = rect.left < window.innerWidth / 2;
  });
</script>

<!-- 触发按钮 -->
<div
  class:wide
  class="trigger-button"
  role="button"
  tabindex="0"
  bind:this={buttonRef}
  onclick={togglePopup}
  onkeydown={(e) => {
    if (e.key === "Enter" || e.key === " ") togglePopup();
  }}
>
  <!-- 如果有传入插槽内容则使用插槽，否则使用默认内容 -->
  <div class="default-button-content">
    {currentIndex >= 0
      ? displayTexts?.[currentIndex] || options[currentIndex]
      : "Select Option"}
  </div>

  <!-- 弹窗内容 -->
  {#if isPopupVisible}
    <Portal target="body">
      <div
        class="popup-window"
        class:closed={isFading}
        class:sliding={isSliding}
        class:left={isLeft}
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
              onkeydown={(e) => {
                if (e.key === "Enter" || e.key === " ") selectOption(i);
              }}
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
    font-size: var(--font-size-medium);
    padding-inline: 0.25em;
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
    right: -20vh;
    width: 12vw;
    font-size: 1.5vw;
    max-height: 60vh;
    overflow-y: auto;
    scrollbar-width: none;
    background-color: white;
    box-shadow: var(--box-shadow);
    border-radius: 8px;
    z-index: 1000;
    transition-property: opacity,transform;
    transition-duration: 0.3s;
    transition-timing-function: ease;
    &.left {
      right: unset;
      left: -20vh;
      &.sliding {
        transform: translateX(40vh);
      }
    }
    &.closed {
      opacity: 0;
    }
    &.sliding {
      transform: translateX(-40vh);
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
    background-color: var(--color-selected-li);
  }

  .option-item.selected {
    background-color: #e3f2fd;
    font-weight: bold;
  }

</style>
