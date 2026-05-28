/**
 * 呦呦英语启蒙 — 语音播放封装
 *
 * 策略：优先播放预录音频文件（/audio/word.mp3），
 * 文件不存在或加载失败时回退到 Web Speech API
 */

import { ref } from 'vue'

// 预录音频缓存
const audioCache = {}
let currentAudio = null

export function useSpeech() {
  const isSpeaking = ref(false)
  const isSupported = ref(true) // 始终为 true，至少有 audio 回退
  const lastError = ref(null)

  /** 播放英文单词/句子 */
  function speak(word, options = {}) {
    const { rate = 0.7, onEnd = null } = options

    stop()
    const cleanWord = word.toLowerCase().trim()

    // 优先尝试预录音频
    const audioPath = `/audio/${cleanWord}.mp3`
    tryPlayAudio(audioPath, onEnd)
    return true
  }

  /** 尝试播放预录音频 */
  function tryPlayAudio(path, onEnd) {
    // 检查缓存
    if (audioCache[path] === 'failed') {
      fallbackTTS(path, onEnd)
      return
    }

    const audio = new Audio()
    audio.preload = 'auto'
    audio.volume = 1.0

    audio.oncanplaythrough = () => {
      isSpeaking.value = true
      currentAudio = audio
      audio.play().catch(() => {
        audioCache[path] = 'failed'
        fallbackTTS(path, onEnd)
      })
    }

    audio.onended = () => {
      isSpeaking.value = false
      currentAudio = null
      if (onEnd) onEnd()
    }

    audio.onerror = () => {
      audioCache[path] = 'failed'
      isSpeaking.value = false
      currentAudio = null
      fallbackTTS(path, onEnd)
    }

    // 超时回退（500ms内未加载则用TTS）
    const timeout = setTimeout(() => {
      if (!isSpeaking.value) {
        audioCache[path] = 'failed'
        fallbackTTS(path, onEnd)
      }
    }, 500)

    audio.oncanplaythrough = () => {
      clearTimeout(timeout)
      audio.oncanplaythrough = null // 只触发一次
      isSpeaking.value = true
      currentAudio = audio
      audio.play().catch(() => {
        audioCache[path] = 'failed'
        fallbackTTS(path, onEnd)
      })
    }

    audio.src = path
    audio.load()
  }

  /** TTS 回退 */
  function fallbackTTS(path, onEnd) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      lastError.value = 'SpeechSynthesis 不可用'
      return
    }

    // 从路径提取单词
    const word = path.split('/').pop()?.replace('.mp3', '') || ''
    const utter = new SpeechSynthesisUtterance(word)
    utter.rate = 0.7
    utter.lang = 'en-US'
    utter.volume = 1.0

    const voices = window.speechSynthesis.getVoices()
    const enVoice = voices.find(v => v.lang.startsWith('en'))
    if (enVoice) utter.voice = enVoice

    utter.onstart = () => { isSpeaking.value = true }
    utter.onend = () => { isSpeaking.value = false; if (onEnd) onEnd() }
    utter.onerror = () => { isSpeaking.value = false; lastError.value = 'TTS失败' }

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  }

  /** 播放倒计时 */
  function speakCountdown(num) {
    stop()
    const path = `/audio/countdown-${num}.mp3`
    tryPlayAudio(path, null)
  }

  /** 播放任意音频路径（如 /audio/which-one-is.mp3） */
  function playAudio(path, onEnd = null) {
    stop()
    tryPlayAudio(path, onEnd)
  }

  function stop() {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      currentAudio = null
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    isSpeaking.value = false
  }

  return { isSpeaking, isSupported, lastError, speak, speakCountdown, playAudio, stop }
}