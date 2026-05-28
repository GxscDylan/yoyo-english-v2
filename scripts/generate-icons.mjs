/**
 * 呦呦英语启蒙 - 多尺寸图标生成脚本
 * 从 favicon.svg 生成所有 PWA 所需图标
 * 运行: node scripts/generate-icons.mjs
 */
import sharp from 'sharp'
import { writeFileSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
const svg = readFileSync(join(publicDir, 'favicon.svg'), 'utf-8')

// 所有需要的图标尺寸
const sizes = [48, 72, 96, 152, 167, 180, 192, 384, 512]

for (const size of sizes) {
  const buf = await sharp(Buffer.from(svg), { density: 300 })
    .resize(size, size, { fit: 'fill' })
    .png({ quality: 90, compressionLevel: 8 })
    .toBuffer()
  writeFileSync(join(publicDir, `icon-${size}.png`), buf)
  console.log('  ✓ icon-' + size + '.png (' + size + 'x' + size + ')')
}

// Maskable 图标（40% 安全区域）
for (const size of [192, 512]) {
  const safe = Math.floor(size * 0.3)
  const inner = size - safe * 2
  const maskSvg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">` +
    `<rect width="${size}" height="${size}" rx="${size*0.2}" fill="#FF8C42"/>` +
    `<rect x="${safe}" y="${safe}" width="${inner}" height="${inner}" rx="${inner*0.2}" fill="#FF8C42"/>` +
    `<g transform="translate(${safe},${safe}) scale(${inner/100})">` +
    svg.replace(/<\/?svg[^>]*>/g, '') +
    `</g></svg>`
  const buf = await sharp(Buffer.from(maskSvg), { density: 300 })
    .resize(size, size, { fit: 'fill' })
    .png({ quality: 90, compressionLevel: 8 })
    .toBuffer()
  writeFileSync(join(publicDir, `icon-maskable-${size}.png`), buf)
  console.log('  ✓ icon-maskable-' + size + '.png (' + size + 'x' + size + ', maskable)')
}

// favicon.ico (48x48)
const icoBuf = await sharp(Buffer.from(svg), { density: 300 })
  .resize(48, 48, { fit: 'fill' })
  .png({ quality: 90 })
  .toBuffer()
writeFileSync(join(publicDir, 'favicon.ico'), icoBuf)
console.log('  ✓ favicon.ico (48x48)')

console.log('\n✅ 所有图标生成完毕！')
