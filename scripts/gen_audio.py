"""生成呦呦英语启蒙 L1+L2 MP3 音频文件"""
import asyncio
import edge_tts
import os

WORDS_L1 = [
    "dog", "cat", "bird", "fish", "rabbit", "bear", "duck", "pig", "cow", "frog",
    "apple", "banana", "orange", "grape", "pear", "watermelon", "cherry", "peach", "mango", "lemon",
    "red", "blue", "yellow", "green", "purple", "pink", "white", "black", "brown", "gray",
    "eye", "nose", "mouth", "ear", "hand", "foot", "head", "arm", "leg", "tummy",
    "mommy", "daddy", "baby", "brother", "sister", "grandma", "grandpa", "family", "home", "love"
]

WORDS_L2 = [
    "bread", "rice", "egg", "milk", "cake", "cookie", "pizza", "soup", "candy", "ice cream",
    "car", "bus", "train", "bike", "plane", "boat", "ship", "taxi", "truck", "helicopter",
    "sunny", "rainy", "cloudy", "windy", "snowy", "hot", "cold", "rainbow", "thunder", "star",
    "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "run", "jump", "walk", "sit", "stand", "clap", "dance", "sing", "swim", "sleep",
    "shirt", "pants", "shoes", "dress", "hat", "socks", "jacket", "scarf", "gloves", "coat",
    "happy", "sad", "angry", "scared", "hungry", "tired", "surprised", "excited", "proud", "loved"
]

ALL_WORDS = WORDS_L1 + WORDS_L2

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "audio")
os.makedirs(OUT_DIR, exist_ok=True)

VOICE = "en-US-JennyNeural"  # 美式英语女声，清晰自然

async def generate(word):
    path = os.path.join(OUT_DIR, f"{word}.mp3")
    if os.path.exists(path):
        print(f"  SKIP {word}.mp3 (exists)")
        return
    comm = edge_tts.Communicate(word, VOICE, rate="-15%")  # 慢速，幼儿友好
    await comm.save(path)
    size = os.path.getsize(path)
    print(f"  OK   {word}.mp3 ({size}B)")

async def main():
    print(f"Generating {len(ALL_WORDS)} word MP3s...")
    for w in ALL_WORDS:
        await generate(w)
    # 额外：倒计时音效
    for i in [3, 2, 1]:
        path = os.path.join(OUT_DIR, f"countdown-{i}.mp3")
        if not os.path.exists(path):
            comm = edge_tts.Communicate(str(i), VOICE)
            await comm.save(path)
            print(f"  OK   countdown-{i}.mp3")
    print(f"Done! {len(ALL_WORDS)} words total (L1: {len(WORDS_L1)}, L2: {len(WORDS_L2)})")

asyncio.run(main())