/**
 * 格式化数字
 * - 小于 10000：直接返回原数字字符串
 * - 大于等于 10000：返回 "X.XX万" 格式
 * 
 * @param num 要格式化的数字
 * @returns 格式化后的字符串
 */
export function formatNumber(num: number): string {
  if (isNaN(num)) return '';
  if (num < 10000) return num.toString();

  const formatted = (num / 10000).toFixed(2);
  // 去掉多余的 0，比如 1.00万 → 1万
  return `${parseFloat(formatted)}万`;
}