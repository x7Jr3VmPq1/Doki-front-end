export default function toProfiles(uid: number) {
  const userProfileUrl = `/profiles?uid=${uid}`;
  window.open(userProfileUrl, '_blank');
}