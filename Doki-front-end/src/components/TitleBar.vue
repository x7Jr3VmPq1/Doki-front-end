<script setup lang="ts">
import {Message, Remind, AddMusic, Search} from '@icon-park/vue-next';
import {ref, onMounted} from "vue";
import {useSharedState} from "../store/useSharedState.ts";
import {getHotSearchList} from "../api/searchService.ts";

const hotSearchList = ref<string[]>([])

onMounted(async () => {
  // 获取热搜
  hotSearchList.value = await getHotSearchList();
});
const searchInfoBoxShow = ref(false);

const sharedState = useSharedState();
// 清空历史记录方法
const clearHistory = () => {
  sharedState.clearSearchHistory();
};

// 换一换图标加载状态
const hotSearchWordsLoading = ref(false);
// 重新拉取热搜词方法
const getHotSearchWords = async () => {
  hotSearchWordsLoading.value = true;
  // 延迟一秒钟
  await new Promise(resolve => setTimeout(resolve, 1000));
  hotSearchWordsLoading.value = false;
};
</script>

<template>
  <div class="title-bar">
    <div class="search-input-area">
      <div class="input-wrapper">
        <div class="input">
          <input type="text" placeholder="搜索" @focus="console.log('focus')">
          <!-- 搜索信息区域 -->
          <div v-if="searchInfoBoxShow" @mousedown.prevent class="search-info-box">
            <!-- 搜索历史 -->
            <div class="history-box" v-if="sharedState.getSearchHistory().length > 0">
              <div class="history-title">
                <div>搜索历史</div>
                <a @click="clearHistory()">
                  <RestOutlined/>
                  清空</a>
              </div>
              <div class="history-items">
                <div class="history-item" v-for="(item) in sharedState.getSearchHistory()">
                  <a-button type="link" @click="onSearch(item)">{{ item }}</a-button>
                  <!-- 用来做单个删除的图标 -->
                  <div class="delete-btn">
                  </div>
                </div>
              </div>
            </div>
            <!-- 热搜词 -->
            <div class="hot-search-list">
              <div class="hot-search-title">
                <div class="title">大家都在搜</div>
                <a @click="getHotSearchWords()">
                  <LoadingOutlined v-if="hotSearchWordsLoading"></LoadingOutlined>
                  <ReloadOutlined v-else></ReloadOutlined>
                  换一换</a>
              </div>
              <div class="hot-search-items">
                <div class="hot-search-item" v-for="(item,index) in hotSearchList" :key="index">
                  <a style="color: black;white-space: pre" @click="onSearch(item)"
                  ><span>{{ index + 1 }}.</span>{{ item }}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="icon-wrapper" style="display: flex;">
          <div style="display: flex;align-items: center;">
            <search theme="outline" size="20" fill="#333"/>
          </div>
          <div style="display: flex;align-items: center;font-size: 20px">搜索</div>
        </div>
      </div>
    </div>
    <div class="functions">
      <div style="width: 40px;height: 40px">
        <div class="avatar-wrapper">
          <img style="object-fit: contain;width:100%;height: 100%;"
               src="http://localhost:8081/avatars/3137ae21-cd4b-4b9f-8426-a2c514273dbf.jpg"
               alt="">
        </div>
      </div>
      <div class="function">
        <add-music theme="outline" size="35" fill="#AAABAF"/>
        <div style="text-align: center">投稿</div>
      </div>
      <div class="function">
        <Message theme="outline" size="35" fill="#AAABAF"/>
        <div style="text-align: center">消息</div>
      </div>
      <div class="function">
        <Remind theme="outline" size="35" fill="#AAABAF"/>
        <div style="text-align: center">通知</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.title-bar {
  display: flex;
  height: 100%;
  width: 100%;

  .search-input-area {
    width: 80%;
    text-align: center;
    display: flex;
    padding-top: 20px;
    padding-bottom: 20px;

    .input-wrapper {
      width: 50%;
      background-color: #ededef;
      margin: 0 auto;
      border-radius: 20px;
      padding-left: 20px;
      display: flex;
      overflow: hidden;

      .input {
        flex: 1;
        position: relative;

        .search-info-box {
          z-index: 100;
          position: absolute;
          top: 65px;
          width: 100%;
          border-radius: 10px;
          border: solid 1px #d9d9d9;
          background-color: white;

          .history-box {
            width: 100%;
            display: block;
            text-align: left;

            .history-title {
              color: black;
              line-height: 1;
              padding: 10px;
              display: flex;
              justify-content: space-between;
            }

            .history-items {
              display: flex;
              flex-wrap: wrap;
              gap: 5px;
              max-height: calc(2 * 35px);
              overflow: hidden;

              .history-item {
                line-height: 1;
                position: relative;
                display: flex;

                .delete-btn {
                  position: absolute;
                  right: 1px;
                  top: 1px;
                  color: skyblue;
                  font-size: 12px;
                  cursor: pointer;
                  display: none;
                }

                &:hover {
                  .delete-btn {
                    display: block;
                  }
                }
              }

            }
          }

          .hot-search-list {
            width: 100%;
            display: block;
            text-align: left;

            .hot-search-title {
              display: flex;
              justify-content: space-between;
              color: black;
              line-height: 1;
              padding: 10px;
            }

            .hot-search-items {
              color: black;

              .hot-search-item {
                line-height: 1;
                padding: 10px;

                a:hover {
                  color: #409EFF !important;
                }
              }

              .hot-search-item:hover {
                background-color: #f5f5f5;
              }
            }
          }
        }
      }

      .icon-wrapper {
        display: flex;
        text-align: center;
        cursor: pointer;
        padding: 0 20px;
      }

      .icon-wrapper:hover {
        background-color: grey;
      }

      input {
        width: 100%;
        height: 100%;
        border: none;
        background: none;
        outline: none;
      }
    }


  }

  .functions {
    display: flex;
    width: 20%;
    height: 100%;
    flex-direction: row-reverse;
    padding-top: 20px;
    padding-right: 20px;
    gap: 20px;
    box-sizing: border-box;

    .function {
      display: flex;
      flex-direction: column;
      color: #AAABAF;
    }

    .avatar-wrapper {
      width: 100%;
      height: 100%;
      background-color: #fff;
      border-radius: 50%;
      overflow: hidden;
    }
  }
}
</style>
