export default function toVideoDetail(vid: number) {
  const url = `/video/${vid}`;
  window.open(url, '_blank');
}