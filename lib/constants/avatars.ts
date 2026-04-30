export const PROFILE_AVATARS = [
  "/professional-developer-avatar-blue.jpg",
  "/friendly-coder-avatar-green.jpg",
  "/tech-enthusiast-avatar-purple.jpg",
  "/creative-programmer-avatar-orange.jpg",
  "/expert-developer-avatar-red.jpg",
  "/avatars/user_krimson.png",
  "/avatars/user_mati.png",
  "/avatars/user_pek.png",
  "/avatars/user_joyboy.png",
] as const

export function getRandomAvatar() {
  return PROFILE_AVATARS[Math.floor(Math.random() * PROFILE_AVATARS.length)]
}