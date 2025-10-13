<template>
  <div class="swiper-controller">
    <!-- 翻页控制按钮 -->
    <div class="navigation-controls">
      <button
        class="nav-btn prev-btn"
        @click="goToPrevious"
        :disabled="isFirstSlide"
        :class="{ disabled: isFirstSlide }"
        title="上一页 (↑)"
      >
        <ArrowUp />
      </button>


      <button
        class="nav-btn next-btn"
        @click="goToNext"
        :disabled="isLastSlide"
        :class="{ disabled: isLastSlide }"
        title="下一页 (↓)"
      >
        <ArrowDown />
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ArrowUp, ArrowDown } from '@icon-park/vue-next'

// 定义组件属性
const props = defineProps<{
  swiperInstance: any, // Swiper 实例
  playerRefs: any[],   // 播放器引用数组
  totalSlides: number, // 总幻灯片数量
}>()

// 定义事件
const emits = defineEmits<{
  (e: 'slideChange', index: number): void,
  (e: 'playerPause'): void,
  (e: 'playerPlay'): void,
}>()

// 当前幻灯片索引
const currentIndex = ref(0)

// 节流锁，防止频繁翻页
const slideLocked = ref(false)
let throttleId: number = 0

// 计算属性
const isFirstSlide = computed(() => currentIndex.value === 0)
const isLastSlide = computed(() => currentIndex.value === props.totalSlides - 1)

// 加锁方法
const lockSlide = () => {
  slideLocked.value = true
  clearTimeout(throttleId)
  throttleId = setTimeout(() => {
    slideLocked.value = false
  }, 750)
}

// 翻页核心方法
const navigateToSlide = (direction: 'next' | 'prev') => {
  if (slideLocked.value || !props.swiperInstance) return

  const swiper = props.swiperInstance

  // 检查边界
  if (direction === 'next' && swiper.isEnd) return
  if (direction === 'prev' && swiper.isBeginning) return

  // 暂停当前播放器
  const currentPlayer = props.playerRefs[currentIndex.value]
  if (currentPlayer) {
    currentPlayer.pause()
    emits('playerPause')
  }

  // 执行翻页
  if (direction === 'next') {
    swiper.slideNext()
  } else {
    swiper.slidePrev()
  }

  // 更新当前索引
  currentIndex.value = swiper.activeIndex

  // 播放下一个视频
  setTimeout(() => {
    const nextPlayer = props.playerRefs[currentIndex.value]
    if (nextPlayer) {
      nextPlayer.play()
      emits('playerPlay')
    }
  }, 100)

  // 触发翻页事件
  emits('slideChange', currentIndex.value)

  // 加锁防止频繁操作
  lockSlide()
}

// 公共方法
const goToNext = () => navigateToSlide('next')
const goToPrevious = () => navigateToSlide('prev')

// 跳转到指定幻灯片
const goToSlide = (index: number) => {
  if (slideLocked.value || !props.swiperInstance || index === currentIndex.value) return

  const swiper = props.swiperInstance

  // 暂停当前播放器
  const currentPlayer = props.playerRefs[currentIndex.value]
  if (currentPlayer) {
    currentPlayer.pause()
    emits('playerPause')
  }

  // 跳转到指定幻灯片
  swiper.slideTo(index, 300, false)
  currentIndex.value = index

  // 播放目标视频
  setTimeout(() => {
    const targetPlayer = props.playerRefs[currentIndex.value]
    if (targetPlayer) {
      targetPlayer.play()
      emits('playerPlay')
    }
  }, 350)

  // 触发翻页事件
  emits('slideChange', currentIndex.value)

  // 加锁
  lockSlide()
}

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (slideLocked.value) return

  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault()
      goToPrevious()
      break
    case 'ArrowDown':
      event.preventDefault()
      goToNext()
      break
    case 'Home':
      event.preventDefault()
      goToSlide(0)
      break
    case 'End':
      event.preventDefault()
      goToSlide(props.totalSlides - 1)
      break
  }
}

// 鼠标滚轮事件处理
const handleWheel = (event: WheelEvent) => {
  if (slideLocked.value) return

  event.preventDefault()
  if (event.deltaY > 0) {
    goToNext()
  } else {
    goToPrevious()
  }
}

// 触摸事件处理（移动端）
const handleTouchStart = (event: TouchEvent) => {
  const touch = event.touches[0]
  const startY = touch.clientY

  const handleTouchMove = (moveEvent: TouchEvent) => {
    const moveTouch = moveEvent.touches[0]
    const deltaY = startY - moveTouch.clientY

    if (Math.abs(deltaY) > 50) { // 滑动阈值
      if (deltaY > 0) {
        goToNext()
      } else {
        goToPrevious()
      }
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }

  const handleTouchEnd = () => {
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
  }

  document.addEventListener('touchmove', handleTouchMove)
  document.addEventListener('touchend', handleTouchEnd)
}

// 暴露方法给父组件
defineExpose({
  goToNext,
  goToPrevious,
  goToSlide,
  currentIndex: computed(() => currentIndex.value),
  isFirstSlide,
  isLastSlide
})

onMounted(() => {
  // 监听键盘事件
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('wheel', handleWheel, { passive: false })
  document.addEventListener('touchstart', handleTouchStart, { passive: true })
})

onUnmounted(() => {
  // 清理事件监听器
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('wheel', handleWheel)
  document.removeEventListener('touchstart', handleTouchStart)
  clearTimeout(throttleId)
})
</script>

<style scoped>
.swiper-controller {
  position: fixed;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  pointer-events: auto;
  /* 简洁的垂直控制器 */
  width: 60px;
}

.navigation-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background: rgba(240, 240, 240, 0.9);
  padding: 16px 8px;
  border-radius: 25px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(200, 200, 200, 0.3);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  /* 简洁的胶囊形状 */
  width: 50px;
  min-width: 50px;
  height: auto;
}

.nav-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(120, 120, 120, 0.8);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(5px);
  font-size: 16px;
  border: 1px solid rgba(100, 100, 100, 0.3);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

.nav-btn:hover:not(.disabled) {
  background: rgba(80, 80, 80, 0.9);
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.nav-btn:active:not(.disabled) {
  transform: scale(0.95);
}

.nav-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.08);
}



/* 响应式设计 */
@media (max-width: 768px) {
  .swiper-controller {
    width: 55px;
    right: 12px;
  }

  .navigation-controls {
    width: 45px;
    min-width: 45px;
    height: auto;
  }

  .nav-btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

}

@media (max-width: 480px) {
  .swiper-controller {
    width: 50px;
    right: 8px;
  }

  .navigation-controls {
    width: 40px;
    min-width: 40px;
    height: auto;
  }

  .nav-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .navigation-controls {
    background: rgba(0, 0, 0, 0.85);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .nav-btn {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .nav-btn:hover:not(.disabled) {
    background: rgba(255, 255, 255, 0.22);
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .navigation-controls {
    background: rgba(0, 0, 0, 0.9);
    border: 2px solid white;
  }

  .nav-btn {
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid white;
  }
}
</style>
