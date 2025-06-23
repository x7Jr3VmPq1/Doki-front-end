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
    }
};
