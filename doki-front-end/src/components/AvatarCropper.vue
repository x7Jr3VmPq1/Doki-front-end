<script setup>
import {ref, watch, defineProps, defineEmits} from 'vue';
import 'vue-cropper/dist/index.css';
import {VueCropper} from "vue-cropper";

const cropper = ref();

let sliderValue = 0; // 初始值
let lastValue = 0;// 记录上一次的值
let direction = "未滑动";// 记录滑动方向
// 接收父组件传递的图片
const props = defineProps({
  image: String,
  notice: Boolean
});
const emit = defineEmits(['cropResult']);

const cropLayout = ref({
  width: 250,
  height: 250,
});
// 监听父组件要求截图的请求
watch(() => props.notice, () => {
  if (props.notice) {
    // 通知父组件截图完成，返回截图结果
    cropper.value.getCropData(data => {
      console.log(data);
      emit('cropResult', data);
    });
  }
});
// 缩放比例
const zoomValue = ref(0);

// TODO 支持滑动缩放大小
const handleZoom = (value) => {
  if (value > lastValue) {
    direction = "右滑"; // 向右滑动
    // 放大图片
    cropper.value.changeScale(+0.1);
  } else if (value < lastValue) {
    direction = "左滑"; // 向左滑动
    // 缩小图片
    cropper.value.changeScale(-0.1);
  } else {
    direction = "未滑动";
  }
  lastValue = value; // 更新上一次的值
  console.log(`当前值：${value}，滑动方向：${direction}`);
};
</script>

<template>
  <div class="container" style="width: 300px;height: 300px;">
    <VueCropper
        ref="cropper"
        :img="props.image"
        mode="cover"
        :info="false"
        :crop-layout="cropLayout"
        :autoCrop="true"
        :autoCropWidth="300"
        :autoCropHeight="300"
        :fixedBox="true"
        :centerBox="true"
        :canMoveBox="false"
    >
    </VueCropper>
  </div>
</template>

<style scoped>

.container {
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto; /* 让内容居中 */
}
</style>

