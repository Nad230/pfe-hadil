import idleAnimation from "./idle.json"
import happyAnimation from "./happy.json"
import thinkingAnimation from "./thinking.json"
import typingAnimation from "./typing.json"
import wavingAnimation from "./waving.json"

export const animations = {
  idle: idleAnimation,
  happy: happyAnimation,
  thinking: thinkingAnimation,
  typing: typingAnimation,
  waving: wavingAnimation
} as const

export type MascotMood = keyof typeof animations