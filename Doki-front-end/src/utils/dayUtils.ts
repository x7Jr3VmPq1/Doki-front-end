import dayjs from 'dayjs';
import relativeTime from "dayjs/plugin/relativeTime"; // 引入 dayjs 库
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);
export const dayUtils = {
    formatDate: (date: string) => {
        const now = dayjs(); // 当前时间
        const inputDate = dayjs(date); // 输入的时间
        const diffMinutes = now.diff(inputDate, 'minute'); // 计算分钟差
        const diffHours = now.diff(inputDate, 'hour'); // 计算小时差

        if (diffMinutes < 1) {
            return '刚刚'; // 小于1分钟
        } else if (diffMinutes < 60) {
            return `${diffMinutes}分钟前`; // 小于1小时
        } else if (diffHours < 24) {
            return `${diffHours}小时前`; // 小于1天
        } else {
            return inputDate.format('YYYY年MM月DD日 HH:mm:ss'); // 超过1天，返回标准日期格式
        }
    }
}

export const getFormattedDate = (date: string) => {
    const d = dayjs(date);

    if (d.isToday()) {
        return `今天 ${d.format('HH:mm:ss')}`;
    }

    if (d.isYesterday()) {
        return `昨天 ${d.format('HH:mm:ss')}`;
    }

    return d.format('YYYY年MM月DD日 HH:mm:ss');
};
