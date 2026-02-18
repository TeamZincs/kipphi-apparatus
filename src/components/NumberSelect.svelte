<script lang="ts">
  let { min = 0, max = 60, step = 1, value = $bindable(0), onchange: onChange, "class": cls } = $props();

  let dragging = false;
  let startY = 0;
  let startValue = 0;
  let containerRef: HTMLElement;
  let offsetY = $state(0);

  // 生成选项数组
  let options = $derived.by(() => {
    const opts = [];
    for (let i = min; i <= max; i += step) {
      opts.push(i);
    }
    return opts;
  });

  // 计算需要显示的选项（当前值和相邻的两个，以及根据滑动方向可能显示的第四个）
  let visibleOptions = $derived.by(() => {
    const currentIndex = options.indexOf(value);
    const result = [];
    
    // 根据偏移量判断是否需要额外显示上一个或下一个选项
    const offsetItems = Math.floor(Math.abs(offsetY) / 50);
    const direction = offsetY > 0 ? 1 : offsetY < 0 ? -1 : 0;
    
    // 添加更前面的选项（如果存在且需要显示）
    if (currentIndex > offsetItems && direction > 0) {
      result.push({
        value: options[currentIndex - offsetItems - 1],
        type: 'previous-hidden',
        key: `prev-hidden-${currentIndex - offsetItems - 1}`
      });
    }
    
    // 添加前一个选项（如果存在）
    if (currentIndex > 0) {
      result.push({
        value: options[currentIndex - 1],
        type: 'previous',
        key: `prev-${currentIndex - 1}`
      });
    }
    
    // 添加当前选项
    result.push({
      value: value,
      type: 'current',
      key: `current-${currentIndex}`
      });
    
    // 添加后一个选项（如果存在）
    if (currentIndex < options.length - 1) {
      result.push({
        value: options[currentIndex + 1],
        type: 'next',
        key: `next-${currentIndex + 1}`
      });
    }
    
    // 添加更后面的选项（如果存在且需要显示）
    if (currentIndex < options.length - 1 - offsetItems && direction < 0) {
      result.push({
        value: options[currentIndex + offsetItems + 2],
        type: 'next-hidden',
        key: `next-hidden-${currentIndex + offsetItems + 2}`
      });
    }
    
    return result;
  });

  function handleMouseDown(event: MouseEvent, selectedValue: number) {
    dragging = true;
    startY = event.clientY;
    startValue = value;
    value = selectedValue;
    onChange?.(value);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  function handleTouchStart(event: TouchEvent, selectedValue: number) {
    dragging = true;
    startY = event.touches[0].clientY;
    startValue = value;
    value = selectedValue;
    onChange?.(value);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  }

  function handleMouseMove(event: MouseEvent) {
    if (!dragging) return;
    const deltaY = event.clientY - startY;
    offsetY = deltaY;
    
    // 实时计算值的变化
    const deltaValue = Math.round(deltaY / 50) * step; // 调整灵敏度
    let newValue = startValue - deltaValue;
    newValue = Math.max(min, Math.min(max, newValue));
    
    // 只在值真正改变时触发onChange
    if (newValue !== value) {
      value = newValue;
      onChange?.(value);
    }
  }

  function handleTouchMove(event: TouchEvent) {
    if (!dragging) return;
    const deltaY = event.touches[0].clientY - startY;
    offsetY = deltaY;
    
    // 实时计算值的变化
    const deltaValue = Math.round(deltaY / 50) * step; // 调整灵敏度
    let newValue = startValue - deltaValue;
    newValue = Math.max(min, Math.min(max, newValue));
    
    // 只在值真正改变时触发onChange
    if (newValue !== value) {
      value = newValue;
      onChange?.(value);
    }
  }

  function handleMouseUp() {
    dragging = false;
    offsetY = 0; // 重置偏移量
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }

  function handleTouchEnd() {
    dragging = false;
    offsetY = 0; // 重置偏移量
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
  }

  function selectValue(selectedValue: number) {
    value = selectedValue;
    onChange?.(value);
  }
</script>

<div class="number-picker" bind:this={containerRef}>
  <div class="track" style="transform: translateY({offsetY}px);">
    {#each visibleOptions as option (option.key)}
      <div
        class="option {option.type} {value === option.value ? 'selected' : ''} {cls}"
        onmousedown={(e) => handleMouseDown(e, option.value)}
        ontouchstart={(e) => handleTouchStart(e, option.value)}
        onclick={(e) => {
          selectValue(option.value)
          e.stopPropagation()
          }}
      >
        {option.value}
      </div>
    {/each}
  </div>
  <div class="indicator" />
</div>

<style>
  .number-picker {
    position: relative;
    width: 60px;
    height: 180px; /* 增加高度以适应垂直布局 */
    overflow: hidden;
    touch-action: none;
  }

  .track {
    display: flex;
    flex-direction: column; /* 改为垂直排列 */
    height: 100%;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: transform 0.1s linear; /* 更快的过渡动画 */
  }

  .option {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 5px 0; /* 修改为垂直间距 */
    font-size: 18px;
    cursor: pointer;
    user-select: none;
    transition: all 0.2s;
  }

  /* 为相邻数字添加阴影效果 */
  .option.previous,
  .option.next {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    opacity: 0.7;
  }

  .option.previous-hidden,
  .option.next-hidden {
    opacity: 0.3;
  }

  .option.current {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .option.selected {
    background-color: #4CAF50;
    color: white;
    font-weight: bold;
  }

  .indicator {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60px;
    height: 60px;
    border: 2px solid #4CAF50;
    pointer-events: none;
  }
</style>