// dateUtils.ts
import dayjs from 'dayjs';
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

export const dayUtils = {
    formatDate: (date: string) => {
        const now = dayjs();
        const inputDate = dayjs(date);
        const diffMinutes = now.diff(inputDate, 'minute');
        const diffHours = now.diff(inputDate, 'hour');

        if (diffMinutes < 1) {
            return '刚刚';
        } else if (diffMinutes < 60) {
            return `${diffMinutes}分钟前`;
        } else if (diffHours < 24) {
            return `${diffHours}小时前`;
        } else {
            return inputDate.format('YYYY年MM月DD日 HH:mm:ss');
        }
    },

    getFormattedDate: (date: string) => {
        const d = dayjs(date);

        if (d.isToday()) {
            return `今天 ${d.format('HH:mm:ss')}`;
        }
        if (d.isYesterday()) {
            return `昨天 ${d.format('HH:mm:ss')}`;
        }
        return d.format('YYYY年MM月DD日 HH:mm:ss');
    },

    formatSecondsToHHMMSS: (totalSeconds: number) => {
        const seconds = Math.abs(totalSeconds);
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        const pad = (num: number) => String(num).padStart(2, '0');

        return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
    },
    formatTimestamp(timestamp: number): string {
        // 兼容秒级或毫秒级时间戳
        if (timestamp < 1e12) {
            timestamp *= 1000;
        }

        const now = Date.now();
        const diff = now - timestamp;

        // 小于1分钟
        if (diff < 60 * 1000) {
            return "刚刚";
        }

        // 小于1小时
        if (diff < 60 * 60 * 1000) {
            const minutes = Math.floor(diff / (60 * 1000));
            return `${minutes}分钟前`;
        }

        // 小于24小时
        if (diff < 24 * 60 * 60 * 1000) {
            const hours = Math.floor(diff / (60 * 60 * 1000));
            return `${hours}小时前`;
        }

        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        // 补零函数
        const pad = (n: number) => n.toString().padStart(2, "0");

        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());

        return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
    }

};
