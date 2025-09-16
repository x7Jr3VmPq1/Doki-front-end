import {defineStore} from 'pinia';

export const useSharedState = defineStore('sharedState', {
    state: () => ({
        searchHistory: JSON.parse(localStorage.getItem('searchHistory') || '[]') as string[],
    }),
    actions: {
        setSearchHistory(history: string[]) {
            this.searchHistory = history;
            localStorage.setItem('searchHistory', JSON.stringify(history));
        },
        addSearchHistory(content: string) {
            const trimmed = content.trim();
            if (!trimmed) return;

            // 获取当前历史（拷贝一份，避免直接修改状态）
            let history = [...this.searchHistory];

            // 去重：移除已有的相同内容
            history = history.filter(item => item !== trimmed);

            // 添加到最前面
            history.unshift(trimmed);

            // 最多保留 10 条
            if (history.length > 10) {
                history = history.slice(0, 10);
            }

            // 设置新的历史
            this.setSearchHistory(history);
        },
        deleteSearchHistory(item: string) {
            const history = this.searchHistory.filter((i) => i !== item);
            this.setSearchHistory(history);
        },
        getSearchHistory() {
            return this.searchHistory;
        },
        clearSearchHistory() {
            this.searchHistory = [];
            localStorage.removeItem('searchHistory');
        }
    },
});

