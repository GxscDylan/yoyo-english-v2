/**
 * 呦呦英语启蒙 - iPad Splash Screens 生成脚本
 * 生成 8 张纯色背景+emoji 的启动画面
 * 运行: node scripts/generate-splash.mjs
 */
import sharp from 'sharp'
import { mkdirSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const splashDir = join(__dirname, '..', 'public', 'splash')
if (!existsSync(splashDir)) mkdirSync(splashDir, { recursive: true })

// iPad 设备尺寸
const ipadSizes = [
  { w: 2048, h: 2732, name: 'splash-2048x2732.png' },
  { w: 2732, h: 2048, name: 'splash-2732x2048.png' },
  { w: 1668, h: 2388, name: 'splash-1668x2388.png' },
  { w: 2388, h: 1668, name: 'splash-2388x1668.png' },
  { w: 1640, h: 2360, name: 'splash-1640x2360.png' },
  { w: 2360, h: 1640, name: 'splash-2360x1640.png' },
  { w: 1536, h: 2048, name: 'splash-1536x2048.png' },
  { w: 2048, h: 1536, name: 'splash-2048x1536.png' },
]

// 老虎 emoji 的 Unicode 编码
const TIGER = '\uD83D\uDC2F'

for (const { w, h, name } of ipadSizes) {
  const short = Math.min(w, h)
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#FFF8F0"/>
    <circle cx="${w/2}" cy="${h/2 - h*0.06}" r="${short*0.12}" fill="#FF8C42"/>
    <text x="${w/2}" y="${h/2 - h*0.06}" text-anchor="middle" dominant-baseline="central"
      font-size="${short*0.16}" font-family="sans-serif">${TIGER}</text>
    <text x="${w/2}" y="${h/2 + h*0.10}" text-anchor="middle"
      font-size="${short*0.05}" fill="#FF8C42" font-weight="bold"
      font-family="PingFang SC,Microsoft YaHei,sans-serif">呦呦英语启蒙</text>
    <text x="${w/2}" y="${h/2 + h*0.15}" text-anchor="middle"
      font-size="${short*0.03}" fill="#8B7355"
      font-family="sans-serif">YoYo English</text>
  </svg>`

  const png = await sharp(Buffer.from(svg), { density: 300 })
    .png({ quality: 85, compressionLevel: 8 })
    .toBuffer()

  writeFileSync(join(splashDir, name), png)
  console.log('  ✓ ' + name + ' (' + w + 'x' + h + ')')
}

console.log('\n✅ 所有 Splash Screens 生成完毕！')
