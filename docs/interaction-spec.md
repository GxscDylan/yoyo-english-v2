# 呦呦英语启蒙 — 交互规范文档

> 本文档记录所有学习步骤和游戏的交互规则，确保全项目体验一致。
> 最后更新：2026-05-27（进度条优化 / 结算页增强 / 进度计算修复 / 认知强化覆盖层）（进度条优化 / 结算页增强 / 进度计算修复 / 认知强化覆盖层）

---

## 一、四步科学练（LearnView）通用规则

### 1.1 语音优先原则
- **全程依赖音频**，文字提示仅作为视觉辅助，不要求孩子识字
- L1（3-4岁）不显示英文拼写（Step 1 可点 🔍 查看）
- L2（4-6岁）渐进引入英文拼写

### 1.2 呦呦吉祥物互动
- **初始问候**：首次进入页面显示气泡，**3秒后自动隐藏**，释放空间给内容
- **点击互动**：点击呦呦头像 → 表情变😊 + yoyoHappy弹跳动画 + 随机鼓励语（8条轮换）+ ⭐星星飞出 → 2秒后恢复idle，气泡再过2秒隐藏
- **表情状态**：`idle` / `thinking` / `happy` / `encourage` / `celebrate` / `sleepy` / `summon`

### 1.3 布局规则
- **左侧呦呦区域**：`flex: 0 0 22%`，最小 140px（按比例分配，避免固定像素宽度在不同分辨率下失衡）
- **气泡位置**：头像正下方，最大宽度 280px，三角形箭头朝上
- **视口高度**：全局使用 `100dvh`（平板动态视口，自动减去浏览器 UI 占用的空间）

---

## 二、Step 1：认识单词（Listen & Look）

| 规则 | 值 |
|------|-----|
| 呦呦表情 | `idle` |
| 气泡文字 | `看，这是什么呀？` |
| 音频 | 3秒后播放单词音频（`playWord()`） |
| 操作 | 孩子点 🔍 可查看英文拼写 |

---

## 三、Step 2：找一找（Listen & Find）

### 3.1 语音提问链
进入 Step 2 时**链式播放**：
```
/audio/which-one-is.mp3  →  单词音频（如 cat.mp3）
```
- 间隔 400ms
- 气泡显示 `Which one is...`（与音频一致）
- 呦呦表情 `thinking`

### 3.2 自动重读
- **4秒无操作**自动重读单词一次
- 选择任意选项时**清除定时器**
- 答错后清除并**重新计时**

### 3.3 答对反馈
| 元素 | 值 |
|------|-----|
| 视觉 | `Great!`（绿色 feedback-correct） |
| 音效 | `sfxCorrect()` + 随机播放 `great.mp3`/`good-job.mp3`/`excellent.mp3` |
| 呦呦 | `happy` + 星星 |
| 跳转 | **1.2秒后自动调用 `nextStep()`** 进入 Step 3 |

### 3.4 答错反馈
| 元素 | 值 |
|------|-----|
| 视觉 | `Try again!`（橙色 feedback-wrong） |
| 音效 | `sfxWrong()` + 播放 `try-again.mp3` |
| 呦呦 | `encourage` |
| 清除 | 1.5秒后清除反馈，清除选项标记，**重新开始自动重读定时器** |

### 3.5 选项网格
- 1×2（前5词）或 2×2（后5词），渐进难度
- 答错选项不惩罚，允许重新选择

---

## 四、Step 3：跟读（Repeat After Me）

### 4.1 语音引导链
进入 Step 3 时**链式播放**：
```
/audio/repeat-after-me.mp3  →  单词音频（如 cat.mp3）
```
- 间隔 400ms
- 气泡显示 `Repeat after me!`
- 呦呦表情 `encourage`

### 4.2 跟读交互
| 元素 | 值 |
|------|-----|
| 展示 | emoji + 英文单词 + 中文翻译 |
| 🎤 按钮 | 点击开始模拟录音（2秒），录音中显示波纹动画 |
| 🔊 按钮 | `Listen again` — 随时重听单词 |

### 4.3 跟读完成反馈
| 元素 | 值 |
|------|-----|
| 视觉 | `Great speaking!`（绿色 feedback-correct，pop 动画） |
| 音效 | `sfxCorrect()` + 随机播放 `great.mp3`/`good-job.mp3`/`excellent.mp3` |
| 呦呦 | `happy` + 星星 |
| 🎤 按钮 | 变为 ✅ + `Great job!`（不可再次点击） |
| 跳转 | **1.5秒后自动调用 `nextStep()`** 进入 Step 4 |

---

## 五、Step 4：自己说（Say It Yourself）

### 5.1 语音引导链
进入 Step 4 时**链式播放**：
```
/audio/can-you-say-it.mp3  →  开始等待计时
```
- 间隔 400ms
- 气泡显示 `Can you say it?`
- 呦呦表情 `thinking`

### 5.2 等待交互
| 元素 | 值 |
|------|-----|
| 展示 | 仅显示 emoji（不显示单词，鼓励孩子自己回忆） |
| 等待动画 | 5个圆点逐个点亮（每秒1个），文字 `Can you say it?` |
| 超时揭示 | **5秒**后自动揭示答案 + 播放单词音频 |
| 超时气泡 | `That's okay! Listen and remember~` |

### 5.3 "I said it!" 按钮（主动完成）
| 元素 | 值 |
|------|-----|
| 音效 | `sfxCorrect()` + 随机播放表扬音频 |
| 视觉 | `Awesome!`（绿色 feedback-correct，pop 动画） |
| 呦呦 | `celebrate` + 星星 |
| 奖励 | +2 星星 |
| 跳转 | **1.5秒后** 进入下一个单词（或完成弹窗） |

### 5.4 "Skip" 按钮（跳过）
| 元素 | 值 |
|------|-----|
| 视觉 | `OK, let's move on!`（橙色 feedback-reveal） |
| 气泡 | `No worries, next time!` |
| 奖励 | 无星星 |
| 跳转 | **1.5秒后** 进入下一个单词 |

---

## 六、通用反馈时间线

| 场景 | 延迟时间 | 动作 |
|------|----------|------|
| Step 2 答对 → 自动下一步 | 1.2s | `nextStep()` |
| Step 2 答错 → 清除反馈 | 1.5s | 清除选项标记，重新开始自动重读 |
| Step 2 自动重读间隔 | 4s | 重读单词 |
| Step 3 跟读完成 → 自动下一步 | 1.5s | `nextStep()` |
| Step 4 等待超时 | 5s | 揭示答案 + 播放单词 |
| Step 4 "I said it!" → 下一词 | 1.5s | 推进到下一个单词 |
| Step 4 "Skip" → 下一词 | 1.5s | 推进到下一个单词 |
| Game 1/2 答对 → 自动下一轮 | 1.2s | 进入下一轮或结算 |
| Game 1/2 答错 → 清除反馈 | 1.5s | 清除选项标记，重新启动自动重读 |
| Game 1/2 自动重读间隔 | 4s | 重读目标单词 |
| Game 1/2 提问链间隔 | 0.4s | which-one-is → 单词音频 |
| Game 3 配对成功 → 淡出 | 0.8s | 卡片淡出 + 清除反馈 |
| Game 3 配对失败 → 翻回 | 0.8s | 卡片抖动后翻回 |
| Game 3 全部配对 → 结算 | 0.6s | 播放 sfxComplete + 显示结算 |
| 初始问候隐藏 | 3s | 隐藏气泡，释放空间 |
| 点击呦呦恢复 | 2s + 2s | 2s恢复idle，再过2s隐藏气泡 |

---

## 七、音频资源清单

### 语音反馈（预录 MP3，edge-tts JennyNeural -15%）
| 文件 | 用途 | 使用步骤 |
|------|------|----------|
| `which-one-is.mp3` | "Which one is..." 提问模板 | Step 2 / Game 1 / Game 2 |
| `repeat-after-me.mp3` | "Repeat after me!" 跟读引导 | Step 3 |
| `can-you-say-it.mp3` | "Can you say it?" 自说引导 | Step 4 |
| `great.mp3` | 答对鼓励（随机三选一） | Step 2/3/4 / Game 1/2/3 |
| `good-job.mp3` | 答对鼓励（随机三选一） | Step 2/3/4 / Game 1/2/3 |
| `excellent.mp3` | 答对鼓励（随机三选一） | Step 2/3/4 / Game 1/2/3 |
| `try-again.mp3` | 答错提示 | Step 2 / Game 1 / Game 2 |
| `countdown-1.mp3` | 倒计时 | 游戏 |
| `countdown-2.mp3` | 倒计时 | 游戏 |
| `countdown-3.mp3` | 倒计时 | 游戏 |

### 单词音频
- L1: 50 个（`public/audio/{word}.mp3`）
- L2: 70 个（`public/audio/{word}.mp3`）

### 音效（Web Audio API）
- `sfxCorrect()` — 正确
- `sfxWrong()` — 错误
- `sfxFlip()` — 翻牌
- `sfxMatch()` — 配对
- `sfxStar()` — 星星
- `sfxComplete()` — 完成

---

## 八、已知技术约束

1. **华为平板 Chrome TTS 无声** — 必须使用预录 MP3，Web Speech API 仅作回退
2. **IndexedDB 序列化** — 存入前必须用 `JSON.parse(JSON.stringify())` 消除 Vue 代理标记
3. **dev 模式禁用 PWA** — `vite.config.js` 中 `mode === 'production'` 时才启用 VitePWA，避免开发时 SW 缓存干扰
4. **Service Worker 缓存清理** — `public/sw.js` 包含强制注销脚本，`index.html` 内联脚本自动清理旧 SW

---

## 九、Game 1 "找一找"（MatchGame）— 听音选图

### 9.1 语音提问链
每轮开始时**链式播放**：
```
/audio/which-one-is.mp3  →  单词音频（如 cat.mp3）
```
- 间隔 400ms
- 气泡显示 `Listen carefully...`
- 同时启动**自动重读定时器**（4秒无操作重读单词）

### 9.2 游戏机制
- 5轮制，2×2 emoji 网格
- 每轮随机从已解锁分类中选词 + 3个干扰项
- 点击选项时清除自动重读定时器

### 9.3 答对反馈
| 元素 | 值 |
|------|-----|
| 视觉 | `Great!`（绿色 feedback-correct，pop 动画） |
| 音效 | `sfxCorrect()` + 随机 `great.mp3`/`good-job.mp3`/`excellent.mp3` |
| 呦呦 | `happy` + 星星 |
| 奖励 | +1 星星 |
| **认知强化覆盖层** | **选对后弹出固定定位覆盖层（不占位不跳动）：emoji + 英文 + 音标 + 中文，停留 2.5s** |
| 跳转 | **1.2秒后自动** 进入下一轮 |

### 9.4 答错反馈
| 元素 | 值 |
|------|-----|
| 视觉 | `Try again!`（红色 feedback-wrong，pop 动画） |
| 音效 | `sfxWrong()` + `try-again.mp3` |
| 呦呦 | `encourage` |
| 清除 | 1.5秒后清除反馈，**重新启动自动重读定时器** |

### 9.5 结算页
- 完成音效 `sfxComplete()`
- **撒花粒子**：30个随机分布 + `confettiFall` 飘落动画（2.5s）
- **奖杯动画**：/🥈/🎖️ 根据星级，`trophyBounce` 0.8s 弹跳入场
- **分数显示**：大号数字 + `popIn` 动画（延迟 0.3s）
- **星星依次弹出**：3颗⭐，0.8s + i*0.3s 延迟，`starPop` 旋转弹出动画
- **个性化鼓励语**：≥5分完美 / ≥3分良好 / <3分鼓励，三级消息池
- **YOYO 吉祥物**：结算页显示庆祝表情 + 星星特效
- **卡片边框**：金色（gold）/银色（silver）/铜色（bronze）根据星级
- 按钮：🔄 Play again /  Home

---

## 十、Game 2 "听音选词"（ListenGame）— 听音选文字

### 10.1 语音提问链
与 MatchGame 相同：
```
/audio/which-one-is.mp3  →  单词音频（如 cat.mp3）
```
- 间隔 400ms
- 气泡显示 `Listen carefully...`
- 同时启动**自动重读定时器**（4秒无操作重读单词）

### 10.2 游戏机制
- 5轮制，2×2 **英文单词** 网格（进阶难度：不看 emoji，看文字）
- 每轮随机从已解锁分类中选词 + 3个干扰项
- 点击选项时清除自动重读定时器

### 10.3 答对反馈
| 元素 | 值 |
|------|-----|
| 视觉 | `Great!`（绿色 feedback-correct，pop 动画） |
| 音效 | `sfxCorrect()` + 随机 `great.mp3`/`good-job.mp3`/`excellent.mp3` |
| 呦呦 | `happy` + 星星 |
| 奖励 | +1 星星 |
| 跳转 | **1.2秒后自动** 进入下一轮 |

### 10.4 答错反馈
| 元素 | 值 |
|------|-----|
| 视觉 | `Try again!`（红色 feedback-wrong，pop 动画） |
| 音效 | `sfxWrong()` + `try-again.mp3` |
| 额外 | 0.5秒后**朗读正确单词**提示 |
| 呦呦 | `encourage` |
| 清除 | 1.5秒后清除反馈，**重新启动自动重读定时器** |

### 10.5 结算页
- **与 MatchGame 相同的增强结算逻辑**（撒花粒子 + 奖杯动画 + 分数显示 + 星星弹出 + 个性化鼓励语 + YOYO 庆祝 + 星级边框）

---

## 十一、Game 3 "翻翻乐"（MemoryGame）— 记忆配对

### 11.1 游戏机制
- 3对（6张卡片），emoji ↔ 英文单词配对
- 3×2 网格
- 每次翻牌播放 `sfxFlip()` + 朗读该卡片单词
- 无自动重读（翻牌模式，孩子自主操作）

### 11.2 配对成功反馈
| 元素 | 值 |
|------|-----|
| 视觉 | 随机 `Match!` / `Found it!` / `Great!`（绿色 feedback-correct，pop 动画） |
| 音效 | `sfxMatch()` + 随机 `great.mp3`/`good-job.mp3`/`excellent.mp3` |
| 朗读 | 0.3秒后朗读配对单词 |
| 动画 | 金色闪光（matchFlash）→ 0.8秒后淡出 |
| 呦呦 | `happy` + 星星 |
| 奖励 | +1 星星 |

### 11.3 配对失败反馈
| 元素 | 值 |
|------|-----|
| 视觉 | 随机 `Not a pair` / `Try again` / `Almost!`（红色 feedback-wrong，pop 动画） |
| 音效 | `sfxWrong()` |
| 动画 | 抖动（cardShake）→ 0.8秒后翻回 |
| 呦呦 | `encourage` |

### 11.4 结算页
- 全部配对后 0.6秒触发 `sfxComplete()`
- 显示 `All Matched!` + 翻牌次数
- 3星评价（≤6次翻牌 → ⭐⭐⭐，≤10次 → ⭐⭐，其他 → ⭐）
- 英文消息：`Super memory!` / `Great memory!` / `Practice makes perfect!`

---

## 十二、游戏通用规则

### 12.1 反馈动画
所有游戏使用统一的 `<Transition name="pop">` 反馈动画：
```css
@keyframes pop {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
```
- 进入: 0.3s bounce
- 退出: 0.2s ease reverse

### 12.2 自动重读机制（仅 MatchGame / ListenGame）
- 4秒无操作自动重读目标单词
- 用户交互（点击选项）时清除定时器
- 答错后清除并重新计时

### 12.3 资源清理
- 组件卸载（`onUnmounted`）时：`stop()` + `clearAutoReplay()` + `clearInterval(countdownTimer)`
- 游戏结束（`finishGame`）时：`clearAutoReplay()`
- 重新开始（`resetGame`）时：`clearAutoReplay()`

---

## 十三、待补充

- [x] Step 3 完整交互规则（跟读环节的详细行为）✅
- [x] Step 4 完整交互规则（自己说环节的详细行为）✅
- [x] 游戏1（找一找 MatchGame）交互规则 ✅
- [x] 游戏2（听音选词 ListenGame）交互规则 ✅
- [x] 游戏3（翻翻乐 MemoryGame）交互规则 ✅
- [ ] 童谣/熏听模块交互规则（Week 2）
- [ ] 复习系统交互规则（Week 2）
