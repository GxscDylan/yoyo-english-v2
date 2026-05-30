#!/usr/bin/env python3
"""
呦呦英语 V2 — 反馈语音生成脚本
使用 Edge TTS 生成 20 条中文鼓励语音 MP3 文件
输出到 src/assets/audio/feedback/ 目录
"""

import asyncio
import os
import edge_tts

# 输出目录
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'audio', 'feedback')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 20 条语音文本 (中文，适合 3-8 岁幼儿)
VOICE_LINES = [
    ("l1_good", "太棒了！你真聪明！"),
    ("l1_great", "做得好！"),
    ("l1_nice", "不错哦！"),
    ("l1_wonderful", "真厉害！"),
    ("l2_try_again", "再试一次吧！"),
    ("l2_dont_worry", "没关系，慢慢来。"),
    ("l2_almost", "差一点点哦！"),
    ("l2_keep_going", "继续加油！"),
    ("l3_combo", "哇！连续答对！"),
    ("l3_on_fire", "你太棒了！停不下来！"),
    ("l3_streak", "好厉害！一直答对！"),
    ("l4_milestone", "恭喜！你学会了好多单词！"),
    ("l4_progress", "学习进度又前进啦！"),
    ("l4_halfway", "已经完成一半了！"),
    ("l5_legend", "你是英语小天才！"),
    ("l5_super", "超级厉害！呦呦为你骄傲！"),
    ("l5_amazing", "哇！太不可思议了！"),
    ("welcome", "欢迎回来！开始学习吧！"),
    ("goodbye", "今天学得很棒！下次再见！"),
    ("new_word", "今天我们学新单词！"),
]

# Edge TTS 声音（中文女声，适合幼儿）
VOICE = "zh-CN-XiaoxiaoNeural"
RATE = "+10%"  # 稍快一点，更有活力
VOLUME = "+5%"

async def generate(text, filename):
    """Generate one MP3 file"""
    filepath = os.path.join(OUTPUT_DIR, filename)
    if os.path.exists(filepath):
        print(f"  SKIP (exists): {filename}")
        return

    tts = edge_tts.Communicate(text, voice=VOICE, rate=RATE, volume=VOLUME)
    await tts.save(filepath)
    size = os.path.getsize(filepath)
    print(f"  OK {filename} ({size:,} bytes)")

async def main():
    print("YoYo English - Feedback Voice Generation")
    print(f"Output: {OUTPUT_DIR}\n")

    for i, (name, text) in enumerate(VOICE_LINES, 1):
        filename = f"{name}.mp3"
        print(f"[{i:02d}/20] {text}")
        await generate(text, filename)

    print(f"\nDone! Generated {len(VOICE_LINES)} voice files")
    print(f"Directory: {OUTPUT_DIR}")

    # Verify
    existing = [f for f in os.listdir(OUTPUT_DIR) if f.endswith('.mp3')]
    print(f"Total MP3 files in directory: {len(existing)}")

if __name__ == "__main__":
    asyncio.run(main())
