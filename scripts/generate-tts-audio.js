/**
 * 呦呦英语启蒙 — TTS 音频批量生成脚本
 *
 * 功能：使用 edge-tts 批量生成 120 个单词 + 30 个句型 + 游戏提示音 MP3
 * 音色：en-US-AnaNeural（Cartoon/Cute 风格，3~8 岁幼儿最佳匹配）
 * 语速：-10%（比正常慢 10%，适合幼儿听力理解）
 *
 * 用法：node scripts/generate-tts-audio.js
 *
 * 依赖：pip install edge-tts（Python 3.7+）
 *
 * 备选音色：
 *   en-US-AnaNeural      — Cartoon, Cute       (推荐，默认)
 *   en-US-EmmaNeural     — Cheerful, Clear
 *   en-US-JennyNeural    — Friendly, Comfort
 *   en-US-AriaNeural     — News, Novel, Confident（偏正式）
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import { mkdirSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)

const __dirname = dirname(fileURLToPath(import.meta.url))
const AUDIO_DIR = join(__dirname, '..', 'public', 'audio')

// 音色配置（可切换 A/B 测试）
const VOICE = 'en-US-AnaNeural'   // Cartoon/Cute 女声（推荐幼儿使用）
const RATE = '-10%'                // 比正常慢 10%，适合儿童
const VOLUME = '+0%'

/** 文件名标准化：去除特殊字符，统一格式 */
function sanitizeFilename(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')       // 空格 → -
    .replace(/'/g, '')          // 撇号 → 删除 (let's → lets)
    .replace(/[^a-z0-9-]/g, '') // 仅保留字母数字和 -
    .replace(/-+/g, '-')        // 多个 - → 单个
    .replace(/^-|-$/g, '')      // 去除首尾 -
}

/** 需要生成的音频清单 */
const TASKS = []

// 120 个单词
const words = [
  // 动物 (10)
  'dog', 'cat', 'bird', 'fish', 'rabbit', 'bear', 'duck', 'pig', 'cow', 'frog',
  // 水果 (10)
  'apple', 'banana', 'orange', 'grape', 'pear', 'watermelon', 'cherry', 'peach', 'mango', 'lemon',
  // 颜色 (10)
  'red', 'blue', 'yellow', 'green', 'purple', 'pink', 'white', 'black', 'brown', 'gray',
  // 身体 (10)
  'eye', 'nose', 'mouth', 'ear', 'hand', 'foot', 'head', 'arm', 'leg', 'tummy',
  // 家庭 (10)
  'mommy', 'daddy', 'baby', 'brother', 'sister', 'grandma', 'grandpa', 'family', 'home', 'love',
  // 食物 (10)
  'bread', 'rice', 'egg', 'milk', 'cake', 'cookie', 'pizza', 'soup', 'candy', 'ice cream',
  // 交通工具 (10)
  'car', 'bus', 'train', 'bike', 'plane', 'boat', 'ship', 'taxi', 'truck', 'helicopter',
  // 天气 (10)
  'sunny', 'rainy', 'cloudy', 'windy', 'snowy', 'hot', 'cold', 'rainbow', 'thunder', 'star',
  // 数字 (10)
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  // 动作 (10)
  'run', 'jump', 'walk', 'sit', 'stand', 'clap', 'dance', 'sing', 'swim', 'sleep',
  // 衣服 (10)
  'shirt', 'pants', 'shoes', 'dress', 'hat', 'socks', 'jacket', 'scarf', 'gloves', 'coat',
  // 情感 (10)
  'happy', 'sad', 'angry', 'scared', 'hungry', 'tired', 'surprised', 'excited', 'proud', 'loved',
]

// 使用标准化函数
words.forEach(w => {
  TASKS.push({ text: w, filename: `${sanitizeFilename(w)}.mp3` })
})

// 30 个句型
const sentences = [
  { text: "Hello! I'm YoYo.", filename: "hello-im-yoyo.mp3" },
  { text: "What's your name?", filename: "whats-your-name.mp3" },
  { text: "My name is ...", filename: "my-name-is.mp3" },
  { text: "Nice to meet you!", filename: "nice-to-meet-you.mp3" },
  { text: "Good morning!", filename: "good-morning.mp3" },
  { text: "Goodbye!", filename: "goodbye.mp3" },
  { text: "What color is it?", filename: "what-color-is-it.mp3" },
  { text: "It's red.", filename: "its-red.mp3" },
  { text: "I like blue.", filename: "i-like-blue.mp3" },
  { text: "My favorite color is green.", filename: "my-favorite-color-is-green.mp3" },
  { text: "How many?", filename: "how-many.mp3" },
  { text: "There are three.", filename: "there-are-three.mp3" },
  { text: "Count with me! 1, 2, 3!", filename: "count-with-me.mp3" },
  { text: "I have five fingers.", filename: "i-have-five-fingers.mp3" },
  { text: "I can run!", filename: "i-can-run.mp3" },
  { text: "Let's jump!", filename: "lets-jump.mp3" },
  { text: "Can you dance?", filename: "can-you-dance.mp3" },
  { text: "I can swim.", filename: "i-can-swim.mp3" },
  { text: "How's the weather?", filename: "hows-the-weather.mp3" },
  { text: "It's sunny today.", filename: "its-sunny-today.mp3" },
  { text: "It's raining.", filename: "its-raining.mp3" },
  { text: "I like snowy days.", filename: "i-like-snowy-days.mp3" },
  { text: "Do you like apples?", filename: "do-you-like-apples.mp3" },
  { text: "Yes, I do!", filename: "yes-i-do.mp3" },
  { text: "No, I don't.", filename: "no-i-dont.mp3" },
  { text: "I like cake.", filename: "i-like-cake.mp3" },
  { text: "Touch your nose.", filename: "touch-your-nose.mp3" },
  { text: "This is my hand.", filename: "this-is-my-hand.mp3" },
  { text: "I have two eyes.", filename: "i-have-two-eyes.mp3" },
  { text: "Clap your hands.", filename: "clap-your-hands.mp3" },
]

sentences.forEach(s => {
  TASKS.push(s)
})

// 倒计时
;['1', '2', '3'].forEach(n => {
  TASKS.push({ text: n, filename: `countdown-${n}.mp3` })
})

// 游戏提示音
const gamePhrases = [
  { text: "Which one is", filename: "which-one-is.mp3" },
  { text: "Great job!", filename: "great-job.mp3" },
  { text: "Try again!", filename: "try-again.mp3" },
  { text: "You got it!", filename: "you-got-it.mp3" },
  { text: "Let's play!", filename: "lets-play.mp3" },
  { text: "Time's up!", filename: "times-up.mp3" },
  { text: "Well done!", filename: "well-done.mp3" },
  { text: "One more time!", filename: "one-more-time.mp3" },
]

gamePhrases.forEach(s => {
  TASKS.push(s)
})

/** 生成单个音频 */
async function generateOne({ text, filename }) {
  const outputPath = join(AUDIO_DIR, filename)

  // 如果已存在则跳过
  if (existsSync(outputPath)) {
    console.log(`  ⏭️  已存在: ${filename}`)
    return { filename, status: 'skipped' }
  }

  // 使用 Python edge-tts（--rate 必须用 = 连接，否则 shell 会把 -10% 当新参数）
  const escapedText = text.replace(/"/g, '\\"')
  const cmd = `edge-tts --voice "${VOICE}" --rate="${RATE}" --volume="${VOLUME}" --text "${escapedText}" --write-media "${outputPath}"`

  try {
    await execAsync(cmd, { timeout: 10000 })
    console.log(`  ✅ ${filename}`)
    return { filename, status: 'success' }
  } catch (err) {
    console.error(`  ❌ ${filename}: ${err.message}`)
    return { filename, status: 'failed', error: err.message }
  }
}

/** 主函数 */
async function main() {
  console.log('🎙️  呦呦英语启蒙 — 批量生成 TTS 音频')
  console.log(`📁 输出目录: ${AUDIO_DIR}`)
  console.log(`🎤 音色: ${VOICE}`)
  console.log(`⏱️  语速: ${RATE}`)
  console.log(`📊 任务总数: ${TASKS.length}`)
  console.log('─'.repeat(50))

  // 确保输出目录存在
  mkdirSync(AUDIO_DIR, { recursive: true })

  let success = 0
  let skipped = 0
  let failed = 0
  const errors = []

  // 顺序执行（避免并发过多请求）
  for (const task of TASKS) {
    const result = await generateOne(task)
    if (result.status === 'success') success++
    else if (result.status === 'skipped') skipped++
    else {
      failed++
      errors.push(result)
    }
  }

  console.log('─'.repeat(50))
  console.log(`📊 统计:`)
  console.log(`  ✅ 新生成: ${success}`)
  console.log(`  ⏭️  已存在: ${skipped}`)
  console.log(`  ❌ 失败:   ${failed}`)

  if (errors.length > 0) {
    console.log('\n⚠️  失败列表:')
    errors.forEach(e => console.log(`  - ${e.filename}: ${e.error}`))
  }

  console.log('\n✨ 全部完成！')
}

main().catch(err => {
  console.error('💥 脚本执行失败:', err)
  process.exit(1)
})
