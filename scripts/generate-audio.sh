#!/usr/bin/env bash
# 呦呦英语 v5.0 — 使用 Edge TTS 生成 20 条语音 MP3 文件
# 用法: bash scripts/generate-audio.sh
# 前置条件: pip install edge-tts

set -e

OUTPUT_DIR="public/audio"
mkdir -p "$OUTPUT_DIR"

VOICE="en-US-AnaNeural"
RATE="+10%"

echo "🎙️ 开始生成语音文件..."

generate() {
  local filename="$1"
  local text="$2"
  if [ -f "$OUTPUT_DIR/$filename" ]; then
    echo "  ⏭️  $filename 已存在，跳过"
  else
    echo "  🎵 生成 $filename → $text"
    edge-tts --voice "$VOICE" --rate "$RATE" --text "$text" --write-media "$OUTPUT_DIR/$filename"
  fi
}

# 正确-通用 (Level 2)
generate "great.mp3" "Great!"
generate "good-job.mp3" "Good job!"
generate "excellent.mp3" "Excellent!"
generate "well-done.mp3" "Well done!"
generate "nice-work.mp3" "Nice work!"
generate "awesome.mp3" "Awesome!"

# 正确-连击 (Level 3~4)
generate "on-fire.mp3" "You're on fire!"
generate "amazing.mp3" "Amazing!"
generate "superstar.mp3" "You're a superstar!"

# 正确-完美 (Level 5)
generate "incredible.mp3" "Incredible!"
generate "champion.mp3" "You're a champion!"
generate "wow-perfect.mp3" "Wow, perfect!"

# 错误-鼓励 (Level 1)
generate "try-again.mp3" "Try again!"
generate "almost.mp3" "Almost!"
generate "so-close.mp3" "So close!"
generate "you-can-do-it.mp3" "You can do it!"

# 特殊场景
generate "first-time.mp3" "You learned a new word!"
generate "welcome-back.mp3" "Welcome back!"
generate "keep-going.mp3" "Keep going!"
generate "milestone.mp3" "You reached a milestone!"

echo "✅ 语音文件生成完成！共 $(ls "$OUTPUT_DIR"/*.mp3 2>/dev/null | wc -l) 个文件"
