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
let currentTimeout = null

export function useSpeech() {
  const isSpeaking = ref(false)
  const isSupported = ref(true) // 始终为 true，至少有 audio 回退
  const lastError = ref(null)

  /** 标准化文件名（与生成脚本的 sanitizeFilename 保持一致） */
  function sanitizeFilename(text) {
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')       // 空格 → -
      .replace(/'/g, '')          // 撇号 → 删除
      .replace(/[^a-z0-9-]/g, '') // 仅保留字母数字和 -
      .replace(/-+/g, '-')        // 多个 - → 单个
      .replace(/^-|-$/g, '')      // 去除首尾 -
  }

  /** 播放英文单词/句子 */
  function speak(word, options = {}) {
    const { rate = 0.7, onEnd = null } = options

    stop()
    const audioPath = `/audio/${sanitizeFilename(word)}.mp3`
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

    let resolved = false
    let timeoutId = null

    const resolve = () => {
      if (resolved) return
      resolved = true
      if (timeoutId) clearTimeout(timeoutId)
      audio.oncanplaythrough = null
      audio.onerror = null
      // 不清理 onended — 等它自然触发后再清
      isSpeaking.value = true
      currentAudio = audio
      audio.play().catch(() => {
        audioCache[path] = 'failed'
        fallbackTTS(path, onEnd)
      })
    }

    audio.oncanplaythrough = resolve

    audio.onended = () => {
      if (!resolved) return // 已被超时/错误抢占，忽略
      isSpeaking.value = false
      currentAudio = null
      if (onEnd) onEnd()
    }

    audio.onerror = () => {
      if (resolved) return
      resolved = true
      if (timeoutId) clearTimeout(timeoutId)
      audio.oncanplaythrough = null
      audio.onerror = null
      audioCache[path] = 'failed'
      isSpeaking.value = false
      currentAudio = null
      fallbackTTS(path, onEnd)
    }

    // 超时回退（800ms — 给小文件足够加载时间）
    timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true
        audio.oncanplaythrough = null
        audio.onerror = null
        audioCache[path] = 'failed'
        fallbackTTS(path, onEnd)
      }
    }, 800)

    audio.src = path
    audio.load()
  }

  /** TTS 回退（将文件名还原为可读文本） */
  function fallbackTTS(path, onEnd) {
    const word = path.split('/').pop()?.replace('.mp3', '').replace(/-/g, ' ') || ''
    _speakTTS(word, 0.7, onEnd)
  }

  /** 直接朗读句子（优先预录音频，回退 TTS） */
  function speakSentence(text, options = {}) {
    const { rate = 0.8, onEnd = null, onError = null } = options
    stop()

    // 先尝试播放预录句子音频
    const sentencePath = `/audio/${sanitizeFilename(text)}.mp3`
    const audio = new Audio()
    audio.preload = 'auto'
    audio.volume = 1.0

    let resolved = false
    let timeoutId = null

    const resolve = () => {
      if (resolved) return
      resolved = true
      if (timeoutId) clearTimeout(timeoutId)
      audio.oncanplaythrough = null
      audio.onerror = null
      // 不清理 onended — 等它自然触发
      isSpeaking.value = true
      currentAudio = audio
      audio.play().catch(() => {
        if (!resolved) _speakTTS(text, rate, onEnd, onError)
      })
    }

    audio.oncanplaythrough = resolve

    audio.onended = () => {
      if (!resolved) return // 已被超时/错误抢占，忽略
      isSpeaking.value = false
      currentAudio = null
      if (onEnd) onEnd()
    }

    audio.onerror = () => {
      if (resolved) return
      resolved = true
      if (timeoutId) clearTimeout(timeoutId)
      audio.oncanplaythrough = null
      audio.onerror = null
      _speakTTS(text, rate, onEnd, onError)
    }

    // 超时回退（500ms）
    timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true
        audio.oncanplaythrough = null
        audio.onerror = null
        _speakTTS(text, rate, onEnd, onError)
      }
    }, 500)

    audio.src = sentencePath
    audio.load()
  }

  /** 内部 TTS 实现 */
  function _speakTTS(text, rate, onEnd, onError) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      lastError.value = 'SpeechSynthesis 不可用'
      if (onError) onError()
      return
    }

    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = rate || 0.7
    utter.lang = 'en-US'
    utter.volume = 1.0

    // 明确选择美式英语语音（优先 Microsoft/Apple 美式女声）
    const setVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices()
      const enUsVoice = voices.find(v =>
        v.lang === 'en-US' && (
          v.name.includes('Microsoft') ||
          v.name.includes('Samantha') ||
          v.name.includes('Google') ||
          v.name.includes('Alex') ||
          v.name.includes('Female')
        )
      ) || voices.find(v => v.lang === 'en-US')
        || voices.find(v => v.lang.startsWith('en'))

      if (enUsVoice) {
        utter.voice = enUsVoice
        utter.lang = enUsVoice.lang // 同步 lang 到实际语音
      }

      utter.onstart = () => { isSpeaking.value = true }
      utter.onend = () => { isSpeaking.value = false; if (onEnd) onEnd() }
      utter.onerror = (e) => {
        console.error('[TTS Error]', e)
        isSpeaking.value = false
        if (onError) onError()
        else lastError.value = 'TTS失败'
      }

      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utter)
    }

    const voices = window.speechSynthesis.getVoices()
    if (voices.length === 0) {
      // 首次加载，等待 voices 就绪
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null
        setVoiceAndSpeak()
      }
    } else {
      setVoiceAndSpeak()
    }
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

  return { isSpeaking, isSupported, lastError, speak, speakSentence, speakCountdown, playAudio, stop }
}