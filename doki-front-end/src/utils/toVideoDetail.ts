export default function toVideoDetail(vid: number, cid?: string) {
  // 如果 cid 有值，则添加 ?cid=xxx，否则不添加
  const url = cid ? `/video/${vid}?cid=${cid}` : `/video/${vid}`;
  window.open(url, '_blank');
}
