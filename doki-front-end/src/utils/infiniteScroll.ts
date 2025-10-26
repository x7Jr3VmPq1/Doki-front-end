import type { Ref } from "vue";
/**
 * 通用的无限滚动函数
 * @param callback  滚动到底部时的回调函数
 * @param loadMoreRef  加载更多元素的引用
 * @param containRef  容器元素的引用
 * @returns   IntersectionObserver实例
 */
export function useInfiniteScroll(callback: () => void, loadMoreRef: Ref<HTMLElement | null>, containRef: Ref<HTMLElement | null>) {
  let observer: IntersectionObserver | null = null;

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      // 当加载更多元素进入视图时，调用回调函数
      if (entry.isIntersecting) {
        callback();
      }
    },
    {
      root: containRef.value,
      rootMargin: "50px",
      threshold: 0,
    }
  );
  observer.observe(loadMoreRef.value as Element);

  return observer;
}
