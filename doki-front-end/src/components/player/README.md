# 播放器翻页控制组件

## SwiperController.vue

这是一个专门用于控制播放器翻页的组件，从 `views/home/swiper-player.vue` 中提取了翻页逻辑，提供了更灵活和可复用的翻页控制功能。

### 功能特性

- 🎮 **多种翻页方式**：支持键盘、鼠标滚轮、触摸滑动
- 🎯 **精确控制**：提供上一页、下一页、跳转到指定页面
- ⏱️ **节流保护**：防止频繁翻页操作
- 📊 **进度显示**：显示当前页面和总页面数，带进度条
- 🎨 **美观界面**：现代化的控制界面，支持响应式设计
- 🔧 **高度可配置**：支持自定义样式和行为

### 使用方法

#### 1. 基本使用

```vue
<template>
  <div class="video-container">
    <swiper ref="swiperRef" ...>
      <!-- swiper slides -->
    </swiper>
    
    <!-- 翻页控制组件 - 右侧悬浮 -->
    <SwiperController
      :swiper-instance="swiperInstance"
      :player-refs="playerRefs"
      :total-slides="videos.length"
      @slide-change="handleSlideChange"
    />
  </div>
</template>

<script setup>
import SwiperController from './SwiperController.vue'

const swiperInstance = ref(null)
const playerRefs = ref([])

const handleSlideChange = (index) => {
  console.log('切换到页面:', index)
}
</script>
```

#### 2. 在实际项目中使用

参考 `src/views/home/swiper-player-with-controller.vue` 文件，这是一个完整的可运行示例。

#### 3. 替换现有的 swiper-player

如果你想在现有的 `swiper-player.vue` 中添加控制器，只需要：

1. 导入 `SwiperController` 组件
2. 在模板中添加控制器组件
3. 传递必要的 props 和事件处理

```vue
<!-- 在 swiper-player.vue 中添加 -->
<SwiperController
  :swiper-instance="swiperInstance"
  :player-refs="playerRefs"
  :total-slides="videos.length"
  @slide-change="handleSlideChange"
/>
```

### Props

| 属性 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `swiperInstance` | Object | ✅ | Swiper 实例对象 |
| `playerRefs` | Array | ✅ | 播放器组件引用数组 |
| `totalSlides` | Number | ✅ | 总幻灯片数量 |

### Events

| 事件名 | 参数 | 描述 |
|--------|------|------|
| `slideChange` | `index: number` | 翻页时触发，返回当前页面索引 |
| `playerPause` | - | 播放器暂停时触发 |
| `playerPlay` | - | 播放器播放时触发 |

### 暴露的方法

| 方法名 | 参数 | 描述 |
|--------|------|------|
| `goToNext()` | - | 翻到下一页 |
| `goToPrevious()` | - | 翻到上一页 |
| `goToSlide(index)` | `index: number` | 跳转到指定页面 |
| `currentIndex` | - | 当前页面索引（计算属性） |
| `isFirstSlide` | - | 是否为第一页（计算属性） |
| `isLastSlide` | - | 是否为最后一页（计算属性） |

### 支持的交互方式

#### 键盘控制
- `↑` 键：上一页
- `↓` 键：下一页
- `Home` 键：第一页
- `End` 键：最后一页

#### 鼠标控制
- 滚轮向下：下一页
- 滚轮向上：上一页
- 点击按钮：精确控制

#### 触摸控制（移动端）
- 向下滑动：下一页
- 向上滑动：上一页

### 样式自定义

组件提供了完整的 CSS 变量支持，可以通过覆盖样式来自定义外观：

```css
.swiper-controller {
  /* 自定义位置 */
  right: 30px;
  top: 50%;
}

.navigation-controls {
  /* 自定义控制面板样式 */
  background: rgba(0, 0, 0, 0.8);
  border-radius: 30px;
}

.nav-btn {
  /* 自定义按钮样式 */
  width: 60px;
  height: 60px;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
}
```

### 响应式设计

组件自动适配不同屏幕尺寸：

- **桌面端**：完整功能，大按钮
- **平板端**：中等尺寸
- **移动端**：紧凑布局，触摸优化

### 性能优化

- **节流保护**：750ms 内防止重复操作
- **事件清理**：组件卸载时自动清理事件监听器
- **懒加载**：按需加载功能模块

### 注意事项

1. 确保传入的 `swiperInstance` 是有效的 Swiper 实例
2. `playerRefs` 数组需要与 swiper slides 一一对应
3. 组件会自动处理播放器的暂停和播放
4. 建议在父组件中监听翻页事件来同步状态

### 更新日志

- **v1.0.0**：初始版本，支持基本的翻页控制功能
- 支持键盘、鼠标、触摸多种交互方式
- 提供进度显示和状态管理
- 响应式设计和主题适配
