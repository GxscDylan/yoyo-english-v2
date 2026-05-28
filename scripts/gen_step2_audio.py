import asyncio
import edge_tts

async def save(text, filename, rate="-15%"):
    try:
        c = edge_tts.Communicate(text, "en-US-AriaNeural", rate=rate)
        await c.save(f"public/audio/{filename}")
        print(f"OK: {filename}")
    except Exception as e:
        print(f"FAIL {filename}: {e}")

async def main():
    await save("Which one is...", "which-one-is.mp3")
    await save("Great!", "great.mp3", rate="-10%")
    await save("Try again!", "try-again.mp3")
    await save("Good job!", "good-job.mp3", rate="-10%")
    await save("Excellent!", "excellent.mp3", rate="-10%")
    print("Done!")

asyncio.run(main())
