<template>
  <div class="parent-page">
    <header class="parent-header">
      <button class="btn-back" @click="$router.push('/')">
        <span class="back-icon">🏠</span>
      </button>
      <h2>👨‍👩‍👧 家长中心</h2>
      <div class="header-spacer"></div>
    </header>

    <div v-if="!authenticated" class="pin-gate">
      <div class="pin-card anim-fade-up">
        <span class="pin-icon">🔐</span>
        <h3>请输入家长密码</h3>
        <div class="pin-dots">
          <span v-for="i in 4" :key="i" class="pin-dot" :class="{ filled: pinInput.length >= i }"></span>
        </div>
        <p v-if="pinError" class="pin-error">{{ pinError }}</p>
        <div class="pin-pad">
          <button v-for="n in 9" :key="n" class="pin-key" @click="appendPin(String(n))">{{ n }}</button>
          <button class="pin-key pin-key-empty"></button>
          <button class="pin-key" @click="appendPin('0')">0</button>
          <button class="pin-key pin-key-del" @click="deletePin">⌫</button>
        </div>
      </div>
    </div>

    <main v-else class="parent-main">
      <div class="safety-banner">
        <span>🛡️ 所有数据仅存储在本地设备，不会上传到任何服务器。建议定期导出备份。</span>
      </div>

      <section class="section-card">
        <h3>🔐 PIN 管理</h3>
        <div class="row">
          <span>当前 PIN</span>
          <button class="btn-sm" @click="showChangePin = true">修改</button>
        </div>
        <div v-if="showChangePin" class="inline-form anim-fade-up">
          <input v-model="newPin" type="password" maxlength="4" placeholder="4位数字" class="input-pin">
          <button class="btn-save" @click="savePin">保存</button>
          <button class="btn-cancel" @click="showChangePin = false; newPin = ''">取消</button>
        </div>
      </section>

      <section class="section-card">
        <h3>📋 学习控制</h3>
        <div class="row">
          <span>每日限学 1 课</span>
          <button class="toggle" :class="{ on: store.settings.dailyLessonLimit }" @click="toggle('dailyLessonLimit')">
            {{ store.settings.dailyLessonLimit ? 'ON' : 'OFF' }}
          </button>
        </div>
        <div class="row">
          <span>单次时长</span>
          <div class="stepper">
            <button @click="adj(-5)">−5</button>
            <span class="step-val">{{ store.settings.singleSessionMinutes }} 分钟</span>
            <button @click="adj(5)">+5</button>
          </div>
        </div>
        <div class="row">
          <span>锁定时间段</span>
          <div class="time-range">
            <input type="time" :value="store.settings.lockStartTime" @change="e => set('lockStartTime', e.target.value)">
            <span>~</span>
            <input type="time" :value="store.settings.lockEndTime" @change="e => set('lockEndTime', e.target.value)">
          </div>
        </div>
        <div class="row">
          <span>学习模式</span>
          <select class="sel" :value="store.settings.learningMode" @change="e => set('learningMode', e.target.value)">
            <option value="fourStep">🧩 四步科学练</option>
            <option value="card">🃏 传统卡片</option>
          </select>
        </div>
      </section>

      <section class="section-card">
        <h3>🖼️ 宝贝头像</h3>
        <div class="avatar-setup">
          <div class="avatar-preview" @click="triggerUpload">
            <img v-if="store.avatar" :src="store.avatar" class="avatar-img" alt="宝贝头像" />
            <div v-else class="avatar-placeholder">👤</div>
            <span class="avatar-edit">📷</span>
          </div>
          <div class="avatar-info">
            <p>上传宝贝照片，在首页展示</p>
            <p class="avatar-hint">照片仅存储在本地，不会上传到云端</p>
          </div>
          <input ref="fileInput" type="file" accept="image/*" hidden @change="handleAvatarSelect" />
          <button v-if="store.avatar" class="btn-sm btn-remove" @click="removeAvatar">移除</button>
        </div>
        <!-- 在线裁剪弹窗 -->
        <AvatarCropper
          :visible="showCropper"
          :imageSrc="cropImageSrc"
          @confirm="handleCropConfirm"
          @cancel="showCropper = false"
        />
      </section>

      <!-- P3-2: 宝贝性别选择（个性化称呼） -->
      <section class="section-card">
        <h3>👶 宝贝信息</h3>
        <div class="gender-selector">
          <p class="gender-label">宝贝性别（用于呦呦的个性化称呼）</p>
          <div class="gender-options">
            <button class="gender-option" :class="{ active: store.childGender === 'boy' }" @click="setGender('boy')">
              <span class="gender-emoji">👦</span>
              <span>男孩</span>
            </button>
            <button class="gender-option" :class="{ active: store.childGender === 'girl' }" @click="setGender('girl')">
              <span class="gender-emoji">👧</span>
              <span>女孩</span>
            </button>
            <button class="gender-option" :class="{ active: store.childGender === 'neutral' }" @click="setGender('neutral')">
              <span class="gender-emoji">⭐</span>
              <span>通用</span>
            </button>
          </div>
        </div>
      </section>

      <section class="section-card">
        <h3>🎨 主题色设置</h3>
        <p class="theme-hint">选择宝贝喜欢的颜色，全局即时生效</p>
        <div class="theme-grid">
          <button v-for="t in themes" :key="t.key" class="theme-option"
            :class="{ active: store.themeColor === t.key }"
            @click="setTheme(t.key)">
            <span class="theme-swatch" :style="{ background: t.primary }"></span>
            <span class="theme-name">{{ t.label }}</span>
            <span v-if="store.themeColor === t.key" class="theme-check">✓</span>
          </button>
        </div>
      </section>

      <!-- v6.0: 萌宠养成控制 -->
      <section class="section-card" v-if="petStore.petState.value">
        <h3>🐾 萌宠养成</h3>
        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-label">萌宠开关</span>
            <span class="setting-desc">{{ petStore.petState.value.enabled ? '萌宠已开启' : '萌宠已关闭' }}</span>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" :checked="petStore.petState.value.enabled" @change="togglePetEnabled">
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div v-if="petStore.petState.value.enabled" class="pet-settings">
          <div class="pet-status-grid">
            <div class="pet-stat">
              <span class="pet-stat-label">当前等级</span>
              <span class="pet-stat-value">{{ petStore.currentLevelConfig.value.emoji }} {{ petStore.currentLevelConfig.value.name }}</span>
            </div>
            <div class="pet-stat">
              <span class="pet-stat-label">品种</span>
              <span class="pet-stat-value">{{ petStore.petLevel >= 5 && petStore.currentSpecies.value ? petStore.currentSpecies.value.emoji + ' ' + petStore.currentSpecies.value.name : '未孵化' }}</span>
            </div>
            <div class="pet-stat">
              <span class="pet-stat-label">心情</span>
              <span class="pet-stat-value">{{ petStore.petState.value.mood || 'idle' }}</span>
            </div>
            <div class="pet-stat">
              <span class="pet-stat-label">总赞数</span>
              <span class="pet-stat-value">{{ petStore.petState.value.totalLikes || 0 }} 👍</span>
            </div>
          </div>
          <div class="pet-species-select">
            <label class="pet-species-label">指定品种（破壳后生效）</label>
            <select class="pet-species-dropdown" :value="petStore.petState.value.petAssignedSpecies || ''" @change="setPetSpecies($event.target.value)">
              <option v-for="opt in petSpeciesOptions" :key="opt.key" :value="opt.key">{{ opt.label }}</option>
            </select>
          </div>
          <div class="btn-row">
            <button class="btn-act btn-exp" @click="triggerPetHatch" :disabled="petStore.petLevel < 4">🐣 手动破壳</button>
            <button class="btn-act" @click="forceHatch" style="background:#E8F5E9;color:#2E7D32;border:1px solid #A5D6A7">🎉 一键破壳</button>
            <button class="btn-act" @click="resetPet" style="background:#FFF3E0;color:#E65100">🔄 重置萌宠</button>
          </div>
        </div>
      </section>

      <!-- 🔧 调试工具（测试用） -->
      <section class="section-card debug-card">
        <h3>🔧 调试工具</h3>
        <p class="debug-hint">快速设置星星数和点赞数，方便测试萌宠系统</p>
        
        <!-- 星星数设置 -->
        <div class="debug-row">
          <div class="debug-info">
            <span class="debug-label">当前星星数</span>
            <span class="debug-value">⭐ {{ store.totalStars }}</span>
          </div>
          <div class="debug-input-group">
            <input type="number" v-model.number="debugStarsInput" min="0" max="999" placeholder="输入星星数" class="debug-input">
            <button class="btn-debug" @click="setDebugStars">设置</button>
          </div>
        </div>

        <!-- 点赞数设置 -->
        <div class="debug-row">
          <div class="debug-info">
            <span class="debug-label">今日点赞数</span>
            <span class="debug-value">👍 {{ todayTotalLikes }}</span>
          </div>
          <div class="debug-input-group">
            <input type="number" v-model.number="debugLikesInput" min="0" max="999" placeholder="输入点赞数" class="debug-input">
            <button class="btn-debug" @click="setDebugLikes">设置</button>
          </div>
        </div>

        <!-- 快捷按钮 -->
        <div class="debug-quick-btns">
          <button class="btn-quick" @click="quickSetStars(50)">⭐ 50</button>
          <button class="btn-quick" @click="quickSetStars(100)">⭐ 100</button>
          <button class="btn-quick" @click="quickSetStars(300)">⭐ 300</button>
          <button class="btn-quick" @click="quickSetLikes(30)">👍 30</button>
          <button class="btn-quick" @click="quickSetLikes(60)">👍 60</button>
          <button class="btn-quick" @click="quickSetLikes(120)">👍 120</button>
        </div>

        <!-- 重置每日活动 -->
        <div class="debug-row debug-danger">
          <div class="debug-info">
            <span class="debug-label">每日活动记录</span>
            <span class="debug-value">清除今日步骤/星星数据</span>
          </div>
          <button class="btn-debug-danger" @click="clearDailyActivity">清除今日数据</button>
        </div>
      </section>

      <section class="section-card">
        <h3>🎯 游戏难度</h3>
        <p class="diff-hint">调整六款游戏的选项数量，适合不同年龄段</p>
        <div class="diff-grid">
          <button v-for="d in difficulties" :key="d.key" class="diff-option"
            :class="{ active: store.gameDifficulty === d.key }"
            @click="setDifficulty(d.key)">
            <span class="diff-icon">{{ d.icon }}</span>
            <span class="diff-name">{{ d.label }}</span>
            <span class="diff-desc">{{ d.desc }}</span>
            <span v-if="store.gameDifficulty === d.key" class="diff-check">✓</span>
          </button>
        </div>
      </section>

      <section class="section-card">
        <h3>📊 学习报告</h3>
        <!-- 空状态：呦呦趣味引导 -->
        <div v-if="isReportEmpty" class="report-empty anim-fade-up">
          <YoyoMascot :mood="'happy'" :bubble-text="reportBubble" class="empty-yoyo" />
          <p>宝贝还没有开始学习呢~ 选个分类开始吧！</p>
        </div>
        <!-- 有数据：显示统计 -->
        <template v-else>
        <div class="stats-grid">
          <div class="stat"><span class="stat-val">{{ store.masteredWordCount }}</span><span class="stat-lbl">已掌握</span></div>
          <div class="stat"><span class="stat-val">{{ store.totalStars }}</span><span class="stat-lbl">总星星</span></div>
          <div class="stat"><span class="stat-val">{{ store.unlockedCategories }}/{{ ALL_CATEGORIES.length }}</span><span class="stat-lbl">分类</span></div>
        </div>
        <div class="cat-list">
          <div class="cat-section-title">L1 基础词汇</div>
          <div v-for="cat in L1_WORDS" :key="cat.id" class="cat-item">
            <span>{{ cat.emoji }} {{ cat.name }}</span>
            <span class="cat-tag" :class="pct(cat.id) >= 100 ? 't-done' : pct(cat.id) > 0 ? 't-ing' : 't-new'">
              {{ pct(cat.id) >= 100 ? '✅ 掌握' : pct(cat.id) > 0 ? pct(cat.id) + '%' : '未开始' }}
            </span>
          </div>
          <div class="cat-section-title">L2 进阶词汇</div>
          <div v-for="cat in L2_WORDS" :key="cat.id" class="cat-item">
            <span>{{ cat.emoji }} {{ cat.name }}</span>
            <span class="cat-tag" :class="pct(cat.id) >= 100 ? 't-done' : pct(cat.id) > 0 ? 't-ing' : 't-new'">
              {{ pct(cat.id) >= 100 ? '✅ 掌握' : pct(cat.id) > 0 ? pct(cat.id) + '%' : '未开始' }}
            </span>
          </div>
        </div>
        <!-- P0-3: 分类掌握雷达图 -->
        <div class="radar-container" v-if="radarData.length > 0">
          <svg class="radar-chart" :viewBox="`0 0 ${radarSize} ${radarSize}`" preserveAspectRatio="xMidYMid meet">
            <!-- 背景网格 -->
            <polygon v-for="ring in radarRings" :key="'ring' + ring"
              :points="radarRingPoints(ring)"
              fill="none" stroke="#E0E0E0" stroke-width="0.5" />
            <!-- 轴线 -->
            <line v-for="(axis, i) in radarData" :key="'axis' + i"
              :x1="radarCx" :y1="radarCy"
              :x2="radarCx + radarMaxRadius * Math.cos(radarAngle(i))" :y2="radarCy + radarMaxRadius * Math.sin(radarAngle(i))"
              stroke="#E0E0E0" stroke-width="0.5" />
            <!-- 数据区域 -->
            <polygon :points="radarDataPoints"
              fill="rgba(255, 140, 66, 0.15)" stroke="#FF8C42" stroke-width="2" stroke-linejoin="round" />
            <!-- 数据点 -->
            <circle v-for="(pt, i) in radarData" :key="'dot' + i"
              :cx="radarCx + radarMaxRadius * pt.ratio * Math.cos(radarAngle(i))"
              :cy="radarCy + radarMaxRadius * pt.ratio * Math.sin(radarAngle(i))"
              r="3" fill="#FF8C42" />
            <!-- 标签 -->
            <text v-for="(axis, i) in radarData" :key="'lbl' + i"
              :x="radarCx + (radarMaxRadius + 20) * Math.cos(radarAngle(i))"
              :y="radarCy + (radarMaxRadius + 20) * Math.sin(radarAngle(i))"
              text-anchor="middle" dominant-baseline="central" font-size="10" fill="#666">{{ axis.label }}</text>
          </svg>
        </div>
        </template>
      </section>

      <section class="section-card">
        <h3>📅 本周学习</h3>
        <!-- 智能周报评语 -->
        <div class="weekly-comment anim-fade-up">
          <span class="comment-icon">🐯</span>
          <p class="comment-text">{{ store.weeklyReportComment }}</p>
        </div>
        <!-- 空状态：呦呦趣味引导 -->
        <div v-if="isWeekEmpty" class="week-empty anim-fade-up">
          <YoyoMascot :mood="'happy'" :bubble-text="weekBubble" class="empty-yoyo" />
          <p>这周还没有学习记录哦，快去学几个单词吧！</p>
        </div>
        <!-- 有数据：显示图表 -->
        <template v-else>
        <div class="week-summary">
          <div class="week-stat"><span class="week-stat-val">{{ store.weeklySummary.activeDays }}</span><span class="week-stat-lbl">活跃天数</span></div>
          <div class="week-stat"><span class="week-stat-val">{{ store.weeklySummary.totalSteps }}</span><span class="week-stat-lbl">完成步骤</span></div>
          <div class="week-stat"><span class="week-stat-val">{{ store.weeklySummary.totalMastered }}</span><span class="week-stat-lbl">掌握单词</span></div>
          <div class="week-stat"><span class="week-stat-val">{{ store.weeklySummary.totalStars }}</span><span class="week-stat-lbl">获得星星</span></div>
        </div>
        <div class="week-chart">
          <div v-for="day in store.weeklyActivity" :key="day.date" class="week-bar-col" :class="{ today: day.isToday }">
            <div class="week-bar-wrap">
              <div class="week-bar" :style="{ height: barHeight(day.steps) + '%' }" :class="{ active: day.steps > 0 }"></div>
            </div>
            <span class="week-bar-val" v-if="day.steps > 0">{{ day.steps }}</span>
            <span class="week-bar-label">{{ day.dayLabel }}</span>
          </div>
        </div>
        <p class="week-streak" v-if="store.currentStreak > 0">🔥 已连续学习 <strong>{{ store.currentStreak }}</strong> 天，继续加油！</p>
        </template>
      </section>

      <!-- P0-2: 学习趋势折线图 -->
      <section class="section-card">
        <h3>📈 学习趋势</h3>
        <div class="trend-controls">
          <button class="trend-tab" :class="{ active: trendDays === 7 }" @click="trendDays = 7">7 天</button>
          <button class="trend-tab" :class="{ active: trendDays === 14 }" @click="trendDays = 14">14 天</button>
          <button class="trend-tab" :class="{ active: trendDays === 30 }" @click="trendDays = 30">30 天</button>
        </div>
        <div class="trend-legend">
          <span class="legend-item"><span class="legend-dot steps"></span>步骤</span>
          <span class="legend-item"><span class="legend-dot mastered"></span>掌握</span>
          <span class="legend-item"><span class="legend-dot stars"></span>星星</span>
        </div>
        <svg class="trend-chart" :viewBox="`0 0 ${trendChartWidth} ${trendChartHeight}`" preserveAspectRatio="xMidYMid meet">
          <!-- 网格线 -->
          <line v-for="i in 5" :key="'h' + i" :x1="trendMarginLeft" :y1="trendMarginTop + (trendChartHeight - trendMarginTop - trendMarginBottom) * (i - 1) / 4"
            :x2="trendChartWidth - trendMarginRight" :y2="trendMarginTop + (trendChartHeight - trendMarginTop - trendMarginBottom) * (i - 1) / 4"
            stroke="#E8E8E8" stroke-width="1" stroke-dasharray="3,3" />
          <!-- X轴标签 -->
          <text v-for="(label, i) in trendXLabels" :key="'xl' + i"
            :x="trendMarginLeft + i * trendXStep" :y="trendChartHeight - 8"
            text-anchor="middle" font-size="10" fill="#999">{{ label }}</text>
          <!-- 步骤数折线 -->
          <polyline v-if="trendMaxSteps > 0"
            :points="trendStepsData.map((v, i) => `${trendMarginLeft + i * trendXStep},${trendY(v, trendMaxSteps)}`).join(' ')"
            fill="none" stroke="#FF8C42" stroke-width="2" stroke-linejoin="round" />
          <!-- 掌握数折线 -->
          <polyline v-if="trendMaxMastered > 0"
            :points="trendMasteredData.map((v, i) => `${trendMarginLeft + i * trendXStep},${trendY(v, trendMaxMastered)}`).join(' ')"
            fill="none" stroke="#4CAF50" stroke-width="2" stroke-linejoin="round" />
          <!-- 星星数折线 -->
          <polyline v-if="trendMaxStars > 0"
            :points="trendStarsData.map((v, i) => `${trendMarginLeft + i * trendXStep},${trendY(v, trendMaxStars)}`).join(' ')"
            fill="none" stroke="#FFC107" stroke-width="2" stroke-linejoin="round" />
          <!-- 数据点 -->
          <circle v-for="(v, i) in trendStepsData" :key="'ps' + i" v-if="trendMaxSteps > 0"
            :cx="trendMarginLeft + i * trendXStep" :cy="trendY(v, trendMaxSteps)" r="3" fill="#FF8C42" />
          <circle v-for="(v, i) in trendMasteredData" :key="'pm' + i" v-if="trendMaxMastered > 0"
            :cx="trendMarginLeft + i * trendXStep" :cy="trendY(v, trendMaxMastered)" r="3" fill="#4CAF50" />
          <circle v-for="(v, i) in trendStarsData" :key="'pst' + i" v-if="trendMaxStars > 0"
            :cx="trendMarginLeft + i * trendXStep" :cy="trendY(v, trendMaxStars)" r="3" fill="#FFC107" />
        </svg>
      </section>

      <section class="section-card">
        <h3>🎮 游戏成绩</h3>
        <div class="row"><span>🔍 找一找</span><span class="score">{{ gameScoreStars('match') }}</span></div>
        <div class="row"><span>👂 听音选词</span><span class="score">{{ gameScoreStars('listen') }}</span></div>
        <div class="row"><span>🃏 翻翻乐</span><span class="score">{{ gameScoreStars('memory') }}</span></div>
        <div class="row"><span>🎈 气球碰碰</span><span class="score">{{ gameScoreStars('balloon') }}</span></div>
        <div class="row"><span>⚡ 快闪速记</span><span class="score">{{ gameScoreStars('speed-rush') }}</span></div>
        <div class="row"><span>🗂️ 分类小达人</span><span class="score">{{ gameScoreStars('sort-it') }}</span></div>
      </section>

      <!-- P0-4: 学习时间热力图 -->
      <section class="section-card">
        <h3>🗓️ 学习热力图</h3>
        <p class="heatmap-hint">最近 8 周学习活跃度（最近 56 天）</p>
        <div class="heatmap-legend">
          <span class="legend-label">少</span>
          <div class="heatmap-legend-cell" style="background: #EBEDF0"></div>
          <div class="heatmap-legend-cell" style="background: #9BE9A8"></div>
          <div class="heatmap-legend-cell" style="background: #40C463"></div>
          <div class="heatmap-legend-cell" style="background: #30A14E"></div>
          <div class="heatmap-legend-cell" style="background: #216E39"></div>
          <span class="legend-label">多</span>
          <span class="heatmap-total">{{ heatmapTotalDays }} 天活跃</span>
        </div>
        <div class="heatmap-grid">
          <!-- 7 行 = 周日到周六 -->
          <div v-for="(week, wi) in heatmapWeeks" :key="'w' + wi" class="heatmap-week">
            <div v-for="day in week" :key="day.date"
              class="heatmap-cell"
              :class="{ today: day.isToday }"
              :style="{ backgroundColor: heatmapColor(day.steps) }"
              :title="`${day.date}: ${day.steps} 步`">
            </div>
          </div>
        </div>
      </section>

      <!-- v5.0: BGM 控制 -->
      <section class="section-card">
        <h3>🎵 背景音乐</h3>
        <div class="row">
          <span>开关</span>
          <button class="toggle" :class="{ on: bgmEnabled }" @click="toggleBGM">
            {{ bgmEnabled ? 'ON' : 'OFF' }}
          </button>
        </div>
        <div class="row">
          <span>音量</span>
          <div class="volume-slider">
            <input type="range" min="0" max="100" :value="Math.round(bgmVolume * 100)"
              @input="setBGMVolume($event.target.value / 100)" class="vol-range">
            <span class="vol-val">{{ Math.round(bgmVolume * 100) }}%</span>
          </div>
        </div>
      </section>

      <!-- v6.0: 萌宠养成控制 -->
      <section class="section-card" v-if="petEnabled">
        <h3>🐾 萌宠养成</h3>
        <div class="row">
          <span>萌宠系统总开关</span>
          <button class="toggle" :class="{ on: petState?.enabled }" @click="togglePetSetting('enabled')">
            {{ petState?.enabled ? 'ON' : 'OFF' }}
          </button>
        </div>
        <div class="row">
          <span>喂养提醒</span>
          <button class="toggle" :class="{ on: petState?.showHungerAnim }" @click="togglePetSetting('showHungerAnim')">
            {{ petState?.showHungerAnim ? 'ON' : 'OFF' }}
          </button>
        </div>
        <div class="row">
          <span>破壳动画</span>
          <button class="toggle" :class="{ on: petState?.showHatchAnim }" @click="togglePetSetting('showHatchAnim')">
            {{ petState?.showHatchAnim ? 'ON' : 'OFF' }}
          </button>
        </div>
        <div class="row">
          <span>指定下一种精灵品种</span>
          <div class="species-selector">
            <button v-for="sp in petStore.PET_SPECIES" :key="sp.id"
              class="species-option"
              :class="{ active: petState?.petAssignedSpecies === sp.id }"
              @click="setPetAssignedSpecies(sp.id)">
              {{ sp.emoji }}
            </button>
            <button class="species-option species-clear"
              :class="{ active: !petState?.petAssignedSpecies }"
              @click="setPetAssignedSpecies(null)">
              🔀 随机
            </button>
          </div>
        </div>
        <div class="row">
          <span>成长速度</span>
          <div class="volume-slider">
            <input type="range" min="50" max="200" step="10"
              :value="(petState?.growthRate || 1) * 100"
              @input="setGrowthRate($event.target.value / 100)" class="vol-range">
            <span class="vol-val">{{ Math.round((petState?.growthRate || 1) * 100) }}%</span>
          </div>
        </div>
        <!-- 宠物当前状态 -->
        <div class="pet-status-summary" v-if="petState">
          <span>当前阶段：{{ petStore.currentLevelConfig.value?.name || '小蛋蛋' }}</span>
          <span>累计点赞：{{ petState.petTotalLikes }}</span>
          <span v-if="petState.petSpecies">精灵：{{ currentPetSpecies?.emoji }} {{ currentPetSpecies?.name }}</span>
        </div>
      </section>

      <!-- v5.0: 点赞统计 -->
      <section class="section-card">
        <h3>👍 点赞统计</h3>
        <div class="stats-grid">
          <div class="stat"><span class="stat-val">{{ todayTotalLikes }}</span><span class="stat-lbl">今日点赞</span></div>
          <div class="stat"><span class="stat-val">{{ totalAllTimeLikes }}</span><span class="stat-lbl">累计点赞</span></div>
          <div class="stat"><span class="stat-val">{{ favoriteWordsList.length }}</span><span class="stat-lbl">收藏单词</span></div>
        </div>
        <!-- 7天趋势图 -->
        <div class="like-trend-chart">
          <div v-for="day in likeTrend" :key="day.dayLabel" class="like-trend-col" :class="{ today: day.isToday }">
            <div class="like-trend-wrap">
              <div class="like-trend-bar" :style="{ height: (day.count / maxDailyLikes * 100) + '%' }" :class="{ active: day.count > 0 }"></div>
            </div>
            <span class="like-trend-val" v-if="day.count > 0">{{ day.count }}</span>
            <span class="like-trend-label">{{ day.dayLabel }}</span>
          </div>
        </div>
      </section>

      <!-- v5.0: 收藏单词列表 -->
      <section class="section-card">
        <h3>❤️ 收藏单词</h3>
        <div v-if="favoriteWordsList.length === 0" class="fav-empty anim-fade-up">
          <span class="fav-empty-icon">📝</span>
          <p>还没有收藏的单词~</p>
          <p class="fav-hint">在学习页面点击 🤍 可以收藏单词</p>
        </div>
        <div v-else class="fav-grid">
          <div v-for="word in favoriteWordsList" :key="word.id" class="fav-item">
            <span class="fav-emoji">{{ word.emoji }}</span>
            <span class="fav-en">{{ word.en }}</span>
            <button class="fav-unlike" @click="removeFavorite(word.id)">✕</button>
          </div>
        </div>
      </section>

      <section class="section-card">
        <h3>🏅 成就章</h3>
        <p class="medal-hint">孩子通过持续学习解锁的成就</p>
        <!-- 空状态：全部未解锁 -->
        <div v-if="isAllMedalsLocked" class="medals-empty anim-fade-up">
          <YoyoMascot :mood="'excited'" bubble-text="快去解锁你的第一枚勋章吧！" class="empty-yoyo" />
          <p>完成学习任务，收集属于你的成就勋章吧~</p>
        </div>
        <div v-else class="medal-grid">
          <div v-for="m in store.achievements" :key="m.id" class="medal-card"
            :class="{ unlocked: m.unlocked }">
            <div class="medal-icon" :class="{ 'medal-locked': !m.unlocked }">
              {{ m.icon }}
            </div>
            <div class="medal-name">{{ m.name }}</div>
            <div class="medal-name-en">{{ m.nameEn }}</div>
            <div class="medal-condition">{{ m.condition }}</div>
            <div class="medal-progress-bar">
              <div class="medal-progress-fill" :style="{ width: (m.progress / m.max * 100) + '%' }"></div>
            </div>
            <div class="medal-progress-text">{{ m.progress }}/{{ m.max }}</div>
            <span v-if="m.unlocked" class="medal-badge">已解锁</span>
            <button v-if="m.unlocked" class="btn-share-medal" @click="shareAchievement(m)">📥 分享</button>
          </div>
        </div>
      </section>

      <!-- P1-5: 成长里程碑时间线 -->
      <section class="section-card">
        <h3>🌟 成长足迹</h3>
        <div v-if="store.growthMilestones.length === 0" class="milestone-empty anim-fade-up">
          <span class="milestone-empty-icon">🌱</span>
          <p>开始学习后，这里会记录宝贝的成长足迹~</p>
        </div>
        <div v-else class="timeline">
          <div v-for="(m, i) in store.growthMilestones" :key="i" class="timeline-item" :class="{ first: i === 0 }">
            <div class="timeline-icon">{{ m.icon }}</div>
            <div class="timeline-content">
              <div class="timeline-title">{{ m.title }}</div>
              <div class="timeline-desc">{{ m.desc }}</div>
              <div class="timeline-date">{{ m.date }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- P2-3: 成就分享卡弹窗 -->
      <div v-if="showAchievementCard" class="achievement-modal-overlay anim-fade-up" @click.self="showAchievementCard = false">
        <AchievementCard
          :achievement="selectedAchievement"
          :mastered-word-count="store.masteredWordCount"
          :total-stars="store.totalStars"
          :consecutive-days="store.consecutiveDays"
          :theme-color="store.themeColor || 'orange'"
          @close="showAchievementCard = false"
        />
      </div>

      <section class="section-card">
        <h3>💾 数据管理</h3>
        <div class="btn-row">
          <button class="btn-act btn-exp" @click="doExport">📤 导出备份</button>
          <label class="btn-act btn-imp">📥 导入恢复 <input type="file" accept=".json" hidden @change="doImport"></label>
        </div>
      </section>

      <section class="section-card danger-card">
        <h3 class="danger-title">⚠️ 危险操作</h3>
        <button class="btn-danger" @click="confirmReset = true">🗑️ 重置所有数据</button>
        <div v-if="confirmReset" class="reset-box anim-fade-up">
          <p>⚠️ 此操作不可恢复！所有学习记录将被清除。</p>
          <div class="btn-row">
            <button class="btn-danger-solid" @click="doReset">确认重置</button>
            <button class="btn-cancel" @click="confirmReset = false">取消</button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLearningStore } from '@/stores/learning'
import { ALL_CATEGORIES, L1_WORDS, L2_WORDS } from '@/data/words'
import AvatarCropper from '@/components/common/AvatarCropper.vue'
import YoyoMascot from '@/components/common/YoyoMascot.vue'
import AchievementCard from '@/components/common/AchievementCard.vue'
import { playBGM, stopBGM, muteBGM, unmuteBGM, setBGMVolume as _setBGMVolume, isBGMEnabled, isBGMPlaying } from '@/composables/useBGM'
import { useThumbsUp } from '@/composables/useThumbsUp'
import { usePetStore } from '@/composables/usePetStore'

// P2-3: 成就分享卡
const showAchievementCard = ref(false)
const selectedAchievement = ref(null)

function shareAchievement(achievement) {
  selectedAchievement.value = achievement
  showAchievementCard.value = true
}

const store = useLearningStore()

// v5.0: BGM 控制
const bgmEnabled = ref(isBGMEnabled())
const bgmVolume = ref(0.6)

function toggleBGM() {
  if (bgmEnabled.value) {
    muteBGM()
  } else {
    unmuteBGM()
    playBGM('parent')
  }
  bgmEnabled.value = isBGMEnabled()
}

function setBGMVolume(v) {
  bgmVolume.value = v
  _setBGMVolume(v)
}

// v5.0: 点赞统计
const { thumbsUpState, getFavoriteWords, getLikeHistory } = useThumbsUp()
const todayTotalLikes = computed(() => thumbsUpState.value.todayLikes || 0)
const totalAllTimeLikes = computed(() => {
  // 计算累计点赞：今日 + 历史记录总和
  const today = thumbsUpState.value.todayLikes || 0
  const history = (thumbsUpState.value.likeHistory || []).reduce((sum, h) => sum + (h.total || 0), 0)
  return today + history
})
const favoriteWordsList = computed(() => getFavoriteWords())

// v6.0: 萌宠养成系统
const petStore = usePetStore()
const petState = computed(() => petStore.petState?.value)
const petEnabled = computed(() => petStore.petState?.value?.enabled !== false)
const currentPetSpecies = computed(() => petStore.currentSpecies.value)
const petSpeciesOptions = [
  { key: '', label: '🎲 随机孵化', emoji: '🎲' },
  { key: 'cat', label: '🐱 小猫咪', emoji: '🐱' },
  { key: 'dog', label: '🐶 小狗狗', emoji: '🐶' },
  { key: 'rabbit', label: '🐰 小兔子', emoji: '🐰' },
  { key: 'dragon', label: '🐲 小龙', emoji: '🐲' },
  { key: 'unicorn', label: '🦄 独角兽', emoji: '🦄' },
  { key: 'tiger', label: '🐯 小老虎', emoji: '🐯' },
  { key: 'lion', label: '🦁 小狮子', emoji: '🦁' },
  { key: 'sheep', label: '🐑 小绵羊', emoji: '🐑' },
]

// 萌宠设置方法
function togglePetSetting(key) {
  const s = petStore.petState.value
  if (!s) return
  s[key] = !s[key]
  petStore.persist()
}

function setPetAssignedSpecies(speciesId) {
  const s = petStore.petState.value
  if (!s) return
  s.petAssignedSpecies = speciesId || null
  petStore.persist()
}

function setGrowthRate(rate) {
  const s = petStore.petState.value
  if (!s) return
  s.growthRate = Math.max(0.5, Math.min(2.0, rate))
  petStore.persist()
}

// 🔧 调试工具
const debugStarsInput = ref(0)
const debugLikesInput = ref(0)

function setDebugStars() {
  if (debugStarsInput.value >= 0 && debugStarsInput.value <= 999) {
    store.totalStars = debugStarsInput.value
    store.persistAll()
  }
}

function quickSetStars(n) {
  debugStarsInput.value = n
  store.totalStars = n
  store.persistAll()
}

function setDebugLikes() {
  if (debugLikesInput.value >= 0 && debugLikesInput.value <= 999) {
    const target = debugLikesInput.value
    const current = thumbsUpState.value.todayLikes || 0
    const diff = target - current
    
    if (diff > 0) {
      const { addLikes } = useThumbsUp()
      addLikes(diff)
    } else if (diff < 0) {
      thumbsUpState.value.todayLikes = target
      const { persist } = useThumbsUp()
      persist()
    }
    
    // 直接同步到萌宠系统（绕过 addLikes 的间接调用）
    try {
      const s = petStore.petState.value
      if (s?.enabled) {
        const historicalTotal = (thumbsUpState.value.likeHistory || []).reduce(
          (sum, h) => sum + (h.total || 0), 0
        )
        const todayLikes = thumbsUpState.value.todayLikes || 0
        const totalLikes = historicalTotal + todayLikes
        console.log(`[Debug] 同步点赞到萌宠: ${s.petTotalLikes} → ${totalLikes}`)
        s.petTotalLikes = totalLikes
        petStore.persist()
        // 手动检测破壳（Lv5 120 赞）
        if (totalLikes >= 120 && !s.petSpecies) {
          petStore.triggerHatch?.()
        }
      }
    } catch(e) {
      console.error('萌宠同步失败:', e)
    }
  }
}

function quickSetLikes(n) {
  debugLikesInput.value = n
  const { addLikes } = useThumbsUp()
  const current = thumbsUpState.value.todayLikes || 0
  const diff = n - current
  if (diff > 0) {
    addLikes(diff)
  } else if (diff < 0) {
    thumbsUpState.value.todayLikes = n
    const { persist } = useThumbsUp()
    persist()
  }
  
  // 同步到萌宠系统
  try {
    const s = petStore.petState.value
    if (s?.enabled) {
      const historicalTotal = (thumbsUpState.value.likeHistory || []).reduce(
        (sum, h) => sum + (h.total || 0), 0
      )
      const todayLikes = thumbsUpState.value.todayLikes || 0
      const totalLikes = historicalTotal + todayLikes
      console.log(`[Quick] 同步点赞到萌宠: ${s.petTotalLikes} → ${totalLikes}`)
      s.petTotalLikes = totalLikes
      petStore.persist()
    }
  } catch(e) {
    console.error('萌宠同步失败:', e)
  }
}

function clearDailyActivity() {
  const today = new Date().toISOString().slice(0, 10)
  store.dailyActivity[today] = { steps: 0, mastered: 0, stars: 0 }
  store.persistAll()
}

function togglePetEnabled() {
  const s = petStore.petState.value
  if (!s) return
  s.enabled = !s.enabled
  petStore.persist()
}

/** 🎉 一键破壳（调试用，跳过所有检查） */
function forceHatch() {
  const s = petStore.petState.value
  if (!s?.enabled) return
  s.petTotalLikes = 120
  petStore.triggerHatch()
  alert('🎉 破壳成功！刷新首页查看精灵')
}

function setPetSpecies(key) {
  const s = petStore.petState.value
  if (!s) return
  s.petAssignedSpecies = key || null
  petStore.persist()
}

function triggerPetHatch() {
  petStore.triggerHatch()
}

function resetPet() {
  if (confirm('确定要重置萌宠吗？所有养成进度将丢失。')) {
    petStore.resetPet()
  }
}

// 点赞趋势（最近7天）
const likeTrend = computed(() => {
  const history = getLikeHistory()
  const last7 = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const entry = history.find(h => h.date === key)
    last7.push({
      dayLabel: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()],
      isToday: i === 0,
      count: entry?.count || 0
    })
  }
  return last7
})
const maxDailyLikes = computed(() => Math.max(1, ...likeTrend.value.map(d => d.count)))

const authenticated = ref(false)
const pinInput = ref('')
const pinError = ref('')
const showChangePin = ref(false)
const newPin = ref('')
const confirmReset = ref(false)
const fileInput = ref(null)

// Avatar cropper state
const showCropper = ref(false)
const cropImageSrc = ref('')

// 空状态判断
const isReportEmpty = computed(() => {
  return store.masteredWordCount === 0 && store.totalStars === 0 && store.unlockedCategories === 0
})

const isWeekEmpty = computed(() => {
  return store.weeklySummary.activeDays === 0
})

const isAllMedalsLocked = computed(() => {
  return store.achievements.every(m => !m.unlocked)
})

// 呦呦气泡文案（空状态）
const reportBubble = computed(() => {
  const msgs = [
    '宝贝还没开始学习呢~ 选个分类开始吧！',
    '新的一天，新的开始！今天学点什么呢？',
    '万事开头难，但呦呦相信你可以的~ 💪'
  ]
  return msgs[Math.floor(Math.random() * msgs.length)]
})

const weekBubble = computed(() => {
  const msgs = [
    '这周还没有学习记录哦，快去学几个单词吧！',
    '新的一天开始啦，让呦呦陪你一起学习吧~',
    '坚持就是胜利！每天学一点，进步看得见~'
  ]
  return msgs[Math.floor(Math.random() * msgs.length)]
})

// 难度选项
const difficulties = [
  { key: 'simple', icon: '🌱', label: '简单', desc: '2~3 选项' },
  { key: 'medium', icon: '🌟', label: '中等', desc: '3~4 选项' },
  { key: 'hard', icon: '🔥', label: '困难', desc: '4~8 选项' }
]

function setDifficulty(key) {
  store.setGameDifficulty(key)
}

// P0-2: 学习趋势折线图
const trendDays = ref(7)

const trendChartWidth = 600
const trendChartHeight = 200
const trendMarginLeft = 40
const trendMarginRight = 20
const trendMarginTop = 20
const trendMarginBottom = 30

/** 趋势数据源 */
const trendActivity = computed(() => {
  const days = trendDays.value
  const result = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const record = store.dailyActivity[key] || { steps: 0, mastered: 0, stars: 0 }
    result.push({
      date: key,
      dayLabel: `${d.getMonth() + 1}/${d.getDate()}`,
      ...record
    })
  }
  return result
})

const trendStepsData = computed(() => trendActivity.value.map(d => d.steps))
const trendMasteredData = computed(() => trendActivity.value.map(d => d.mastered))
const trendStarsData = computed(() => trendActivity.value.map(d => d.stars))

const trendMaxSteps = computed(() => Math.max(1, ...trendStepsData.value))
const trendMaxMastered = computed(() => Math.max(1, ...trendMasteredData.value))
const trendMaxStars = computed(() => Math.max(1, ...trendStarsData.value))

const trendXStep = (trendChartWidth - trendMarginLeft - trendMarginRight) / Math.max(1, trendDays.value - 1)

/** X轴标签（间隔显示） */
const trendXLabels = computed(() => {
  const data = trendActivity.value
  const total = data.length
  // 最多显示 6 个标签
  const step = Math.max(1, Math.floor(total / 6))
  return data.map((d, i) => i % step === 0 || i === total - 1 ? d.dayLabel : '')
})

/** Y 坐标映射 */
function trendY(value, max) {
  const chartH = trendChartHeight - trendMarginTop - trendMarginBottom
  const ratio = value / max
  return trendMarginTop + chartH * (1 - ratio)
}

// P0-3: 分类掌握雷达图
const radarSize = 220
const radarCx = radarSize / 2
const radarCy = radarSize / 2
const radarMaxRadius = 70
const radarRings = 4

/** 雷达图数据（最多 6 个分类） */
const radarData = computed(() => {
  const cats = [...L1_WORDS, ...L2_WORDS].slice(0, 6)
  return cats.map(cat => ({
    label: cat.emoji,
    pct: pct(cat.id),
    ratio: pct(cat.id) / 100
  }))
})

/** 计算角度（从顶部开始，顺时针） */
function radarAngle(i) {
  const count = radarData.value.length
  if (count <= 1) return 0
  return (2 * Math.PI * i / count) - Math.PI / 2
}

/** 计算环的多边形点 */
function radarRingPoints(ring) {
  const count = radarData.value.length
  const r = (radarMaxRadius / radarRings) * ring
  const pts = []
  for (let i = 0; i < count; i++) {
    const angle = radarAngle(i)
    pts.push(`${radarCx + r * Math.cos(angle)},${radarCy + r * Math.sin(angle)}`)
  }
  return pts.join(' ')
}

/** 数据区域的多边形点 */
const radarDataPoints = computed(() => {
  const pts = []
  radarData.value.forEach((pt, i) => {
    const angle = radarAngle(i)
    const r = radarMaxRadius * pt.ratio
    pts.push(`${radarCx + r * Math.cos(angle)},${radarCy + r * Math.sin(angle)}`)
  })
  return pts.join(' ')
})

// P0-4: 学习时间热力图
const heatmapTotalDays = computed(() => {
  const data = store.dailyActivity
  const today = new Date()
  let count = 0
  for (let i = 0; i < 56; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const record = data[key]
    if (record && (record.steps > 0 || record.mastered > 0)) count++
  }
  return count
})

/** 热力图颜色（类似 GitHub 贡献图） */
function heatmapColor(steps) {
  if (steps === 0) return '#EBEDF0'
  if (steps <= 3) return '#9BE9A8'
  if (steps <= 8) return '#40C463'
  if (steps <= 15) return '#30A14E'
  return '#216E39'
}

/** 热力图数据：按周排列的 56 天 */
const heatmapWeeks = computed(() => {
  const today = new Date()
  const weeks = []
  
  // 获取今天往前 56 天
  const days = []
  for (let i = 55; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const record = store.dailyActivity[key] || { steps: 0, mastered: 0, stars: 0 }
    days.push({
      date: key,
      dayOfWeek: d.getDay(),
      steps: record.steps || 0,
      isToday: i === 0
    })
  }
  
  // 按周分组
  const weeksArr = []
  for (let i = 0; i < days.length; i += 7) {
    weeksArr.push(days.slice(i, i + 7))
  }
  
  // 补齐最后一周（如果不满 7 天）
  if (weeksArr.length > 0) {
    const lastWeek = weeksArr[weeksArr.length - 1]
    while (lastWeek.length < 7) {
      lastWeek.push({ date: '', dayOfWeek: lastWeek.length, steps: 0, isToday: false, empty: true })
    }
  }
  
  return weeksArr
})

/** 周报柱状图高度（相对本周最大 steps） */
function barHeight(steps) {
  const max = store.weeklySummary.maxDailySteps
  if (!max || steps === 0) return 0
  return Math.max(8, Math.round((steps / max) * 100))
}

// 游戏成绩转星级显示
function gameScoreStars(gameId) {
  const raw = store.gameScores[gameId]
  if (!raw) return '-'
  if (gameId === 'memory') return raw + '星'
  // match / listen: 5轮正确数 → 星级
  const stars = raw >= 5 ? 3 : raw >= 3 ? 2 : 1
  return stars + '星'
}

const themes = [
  { key: 'orange', label: '温暖橙', primary: '#FF8C42' },
  { key: 'blue', label: '天空蓝', primary: '#4A90D9' },
  { key: 'pink', label: '樱花粉', primary: '#F08CAE' },
  { key: 'green', label: '森林绿', primary: '#5BAA6B' },
  { key: 'purple', label: '梦幻紫', primary: '#8B6FC0' }
]

function setTheme(key) {
  store.themeColor = key
  document.documentElement.setAttribute('data-theme', key)
  store.persistAll()
}

function appendPin(n) {
  if (pinInput.value.length >= 4) return
  pinInput.value += n
  if (pinInput.value.length === 4) verifyPin()
}
function deletePin() { pinInput.value = pinInput.value.slice(0, -1); pinError.value = '' }
function verifyPin() {
  if (store.verifyPIN(pinInput.value)) { authenticated.value = true; pinError.value = '' }
  else { pinError.value = '密码错误'; setTimeout(() => { pinInput.value = ''; pinError.value = '' }, 1500) }
}
function savePin() {
  if (!/^\d{4}$/.test(newPin.value)) return
  store.updatePIN(newPin.value); showChangePin.value = false; newPin.value = ''
}
function toggle(k) { store.updateSettings(k, !store.settings[k]) }
function set(k, v) { store.updateSettings(k, v) }
function adj(d) { const v = Math.max(5, Math.min(60, store.settings.singleSessionMinutes + d)); store.updateSettings('singleSessionMinutes', v) }
function pct(catId) {
  const cat = ALL_CATEGORIES.find(c => c.id === catId)
  if (!cat) return 0
  const m = cat.words.filter(w => store.isWordMastered(w.id)).length
  return Math.round((m / cat.words.length) * 100)
}
function triggerUpload() { fileInput.value?.click() }
function handleAvatarSelect(e) {
  const f = e.target.files[0]
  if (!f) return
  const r = new FileReader()
  r.onload = ev => {
    cropImageSrc.value = ev.target.result
    showCropper.value = true
  }
  r.readAsDataURL(f)
  e.target.value = ''
}

function handleCropConfirm(croppedBase64) {
  store.avatar = croppedBase64
  store.persistAll()
  showCropper.value = false
  cropImageSrc.value = ''
}
function removeAvatar() { store.avatar = null; store.persistAll() }

// P3-2: 设置宝贝性别
function setGender(g) {
  store.childGender = g
  store.persistAll()
}

// v5.0: 取消收藏
function removeFavorite(wordId) {
  const { toggleFavorite } = useThumbsUp()
  toggleFavorite(wordId)
}
function doExport() {
  const data = store.exportData()
  const b = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const u = URL.createObjectURL(b)
  const a = document.createElement('a')
  a.href = u; a.download = `yoyo-backup-${new Date().toISOString().slice(0,10)}.json`
  a.click(); URL.revokeObjectURL(u)
}
function doImport(e) {
  const f = e.target.files[0]
  if (!f) return
  const r = new FileReader()
  r.onload = ev => {
    try {
      const d = JSON.parse(ev.target.result)
      if (store.importData(d)) { alert('恢复成功！'); window.location.reload() }
      else alert('格式不兼容')
    } catch { alert('解析失败') }
  }
  r.readAsText(f)
}
function doReset() { store.resetAll(); window.location.reload() }
onMounted(async () => {
  await store.loadFromDB()
  // 加载点赞数据（让历史数据补偿生效）
  const { loadFromDB: loadThumbsDB } = useThumbsUp()
  await loadThumbsDB()
  await petStore.loadFromDB()
})
</script>

<style scoped>
.parent-page { width: 100vw; height: 100dvh; display: flex; flex-direction: column; background: var(--bg-main); overflow: hidden; }
.parent-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-md) var(--space-xl); background: rgba(255,255,255,0.9); backdrop-filter: blur(8px);
}
.btn-back {
  display: flex; align-items: center; justify-content: center;
  width: 40px; height: 40px;
  background: var(--border-light);
  border: none; border-radius: 50%;
  cursor: pointer; transition: all 0.2s;
}
.btn-back:hover { background: var(--color-primary-light); transform: scale(1.05); }
.btn-back .back-icon { font-size: 1.3rem; }
.header-spacer { width: 60px; }

.pin-gate { flex: 1; display: flex; align-items: center; justify-content: center; }
.pin-card { background: var(--bg-card); border-radius: var(--radius-xl); padding: var(--space-2xl); text-align: center; box-shadow: 0 8px 40px rgba(0,0,0,0.08); }
.pin-icon { font-size: 3rem; display: block; margin-bottom: var(--space-md); }
.pin-card h3 { margin-bottom: var(--space-xl); }
.pin-dots { display: flex; gap: var(--space-md); justify-content: center; margin-bottom: var(--space-xl); }
.pin-dot { width: 16px; height: 16px; border-radius: 50%; border: 2px solid var(--border-light); transition: all 0.3s; }
.pin-dot.filled { background: var(--color-primary); border-color: var(--color-primary); }
.pin-error { color: var(--color-danger); font-size: var(--font-size-sm); margin-bottom: var(--space-md); animation: shake 0.4s ease; }
.pin-pad { display: grid; grid-template-columns: repeat(3, 64px); gap: var(--space-sm); justify-content: center; }
.pin-key { width: 64px; height: 64px; border-radius: 50%; background: var(--border-light); font-size: var(--font-size-xl); font-weight: 700; color: var(--text-primary); display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.pin-key:active { background: var(--color-primary); color: #fff; }
.pin-key-empty { background: transparent; }
.pin-key-del { font-size: var(--font-size-lg); }

.parent-main { flex: 1; overflow-y: auto; padding: var(--space-lg) var(--space-xl); }
.safety-banner { background: #E3F2FD; border: 1px solid #BBDEFB; border-radius: var(--radius-md); padding: var(--space-md); margin-bottom: var(--space-lg); font-size: var(--font-size-xs); color: #1565C0; }

.section-card { background: var(--bg-card); border-radius: var(--radius-lg); padding: var(--space-lg); margin-bottom: var(--space-md); box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.section-card h3 { font-size: var(--font-size-base); margin-bottom: var(--space-md); font-weight: 700; }
.row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; font-size: var(--font-size-sm); color: var(--text-secondary); }
.row + .row { border-top: 1px solid var(--border-light); }

.toggle { padding: 4px 16px; border-radius: var(--radius-full); font-size: 0.7rem; font-weight: 700; background: #E0E0E0; color: #9E9E9E; transition: all 0.3s; }
.toggle.on { background: var(--color-success); color: #fff; }

.stepper { display: flex; align-items: center; gap: var(--space-sm); }
.stepper button { width: 32px; height: 32px; border-radius: 50%; background: var(--border-light); font-weight: 700; }
.step-val { font-weight: 700; color: var(--text-primary); }

.time-range { display: flex; align-items: center; gap: var(--space-xs); }
.time-range input { padding: 4px 8px; border: 1px solid var(--border-light); border-radius: var(--radius-sm); font-family: inherit; }

.sel { padding: 4px 12px; border: 1px solid var(--border-light); border-radius: var(--radius-sm); font-family: inherit; background: var(--bg-card); }

.inline-form { display: flex; gap: var(--space-sm); margin-top: var(--space-sm); align-items: center; }
.input-pin { padding: var(--space-xs) var(--space-sm); border: 1px solid var(--border-light); border-radius: var(--radius-sm); width: 100px; }
.btn-save { padding: var(--space-xs) var(--space-md); background: var(--color-primary); color: #fff; border-radius: var(--radius-sm); font-weight: 600; }
.btn-cancel { padding: var(--space-xs) var(--space-md); background: var(--border-light); border-radius: var(--radius-sm); }

.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-sm); margin-bottom: var(--space-lg); }
.stat { background: var(--bg-main); border-radius: var(--radius-md); padding: var(--space-md); text-align: center; }
.stat-val { font-size: var(--font-size-xl); font-weight: 800; color: var(--color-primary); display: block; }
.stat-lbl { font-size: 0.6rem; color: var(--text-hint); }

.cat-list { display: flex; flex-direction: column; gap: 4px; }
.cat-section-title { font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); padding: 8px 0 4px; border-bottom: 1px solid var(--border-light); margin-bottom: 4px; }
.cat-item { display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-sm); padding: 4px 0; }
.cat-tag { padding: 2px 10px; border-radius: var(--radius-full); font-size: 0.6rem; font-weight: 700; }
.t-done { background: #E8F5E9; color: #2E7D32; } .t-ing { background: #FFF3E0; color: #E65100; } .t-new { background: var(--border-light); color: var(--text-hint); }

.score { font-weight: 700; color: var(--text-primary); }

/* ===== P0-2: 学习趋势图 ===== */
.trend-controls { display: flex; gap: var(--space-xs); margin-bottom: var(--space-md); }
.trend-tab {
  padding: 4px 14px; border-radius: var(--radius-full);
  border: 1px solid var(--border-light); background: var(--bg-main);
  font-size: 0.65rem; font-weight: 600; color: var(--text-secondary);
  cursor: pointer; transition: all 0.2s;
}
.trend-tab.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }

.trend-legend { display: flex; gap: var(--space-md); margin-bottom: var(--space-sm); font-size: 0.65rem; color: var(--text-hint); }
.legend-item { display: flex; align-items: center; gap: 4px; }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; }
.legend-dot.steps { background: #FF8C42; }
.legend-dot.mastered { background: #4CAF50; }
.legend-dot.stars { background: #FFC107; }

.trend-chart {
  width: 100%; height: auto;
  max-height: 200px;
  background: var(--bg-main);
  border-radius: var(--radius-md);
}

/* ===== P0-3: 雷达图 ===== */
.radar-container {
  display: flex; justify-content: center; align-items: center;
  margin-top: var(--space-md); padding: var(--space-sm) 0;
}
.radar-chart { width: 100%; max-width: 240px; height: auto; }

/* ===== P0-4: 学习时间热力图 ===== */
.heatmap-hint { font-size: var(--font-size-xs); color: var(--text-hint); margin-top: -8px; margin-bottom: var(--space-md); }
.heatmap-legend {
  display: flex; align-items: center; gap: 4px; margin-bottom: var(--space-sm); font-size: 0.6rem; color: var(--text-hint);
}
.heatmap-legend-cell { width: 12px; height: 12px; border-radius: 2px; }
.legend-label { min-width: 20px; }
.heatmap-total { margin-left: auto; font-weight: 600; color: var(--text-secondary); }

.heatmap-grid {
  display: flex; gap: 3px;
  overflow-x: auto; padding-bottom: 4px;
}
.heatmap-week {
  display: flex; flex-direction: column; gap: 3px;
}
.heatmap-cell {
  width: 12px; height: 12px; border-radius: 2px;
  transition: transform 0.15s ease;
}
.heatmap-cell:hover {
  transform: scale(1.4);
}
.heatmap-cell.today {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

/* ===== 本周学习周报 ===== */
.weekly-comment {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-md);
  background: linear-gradient(135deg, var(--color-primary-light), #FFF3E0);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-md);
  border-left: 4px solid var(--color-primary);
}
.comment-icon {
  font-size: 1.8rem;
  flex-shrink: 0;
  margin-top: 2px;
}
.comment-text {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  line-height: 1.6;
  margin: 0;
  font-weight: 500;
}

.week-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-sm); margin-bottom: var(--space-md); }
.week-stat { background: var(--bg-main); border-radius: var(--radius-md); padding: var(--space-sm); text-align: center; }
.week-stat-val { font-size: var(--font-size-lg); font-weight: 800; color: var(--color-primary); display: block; }
.week-stat-lbl { font-size: 0.6rem; color: var(--text-hint); }

.week-chart {
  display: flex; align-items: flex-end; justify-content: space-between; gap: var(--space-xs);
  height: 100px; padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: var(--space-sm);
}
.week-bar-col {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;
  height: 100%;
}
.week-bar-col.today .week-bar-label { color: var(--color-primary); font-weight: 700; }
.week-bar-wrap {
  flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center;
}
.week-bar {
  width: 20px; min-height: 2px; border-radius: 4px 4px 0 0;
  background: var(--border-light);
  transition: height 0.5s ease;
}
.week-bar.active {
  background: linear-gradient(180deg, var(--color-primary), #FFB74D);
}
.week-bar-val { font-size: 0.55rem; font-weight: 700; color: var(--color-primary); }
.week-bar-label { font-size: 0.6rem; color: var(--text-hint); }

.week-streak { font-size: var(--font-size-sm); color: var(--text-secondary); text-align: center; margin-top: var(--space-sm); }

/* ===== 空状态 ===== */
.report-empty, .week-empty, .medals-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-lg) var(--space-md);
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--font-size-base);
}

.empty-yoyo {
  transform: scale(0.9);
}
.week-streak strong { color: #E65100; }

/* ===== P2-3: 成就分享卡弹窗 ===== */
.achievement-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: var(--space-lg);
  overflow-y: auto;
}

.btn-share-medal {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 12px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.medal-card:hover .btn-share-medal {
  opacity: 1;
}

.btn-row { display: flex; gap: var(--space-sm); }
.btn-act { flex: 1; padding: var(--space-sm); border-radius: var(--radius-md); font-size: var(--font-size-sm); font-weight: 600; text-align: center; cursor: pointer; transition: all 0.2s; }
.btn-exp { background: #E3F2FD; color: #1565C0; } .btn-imp { background: #E8F5E9; color: #2E7D32; position: relative; }
.btn-imp input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

.danger-card { border: 1px solid #FFCDD2; }
.danger-title { color: var(--color-danger) !important; }
.btn-danger { padding: var(--space-sm) var(--space-lg); background: #FFEBEE; color: var(--color-danger); border-radius: var(--radius-md); font-weight: 700; }
.btn-danger-solid { background: var(--color-danger) !important; color: #fff !important; padding: var(--space-sm) var(--space-lg); border-radius: var(--radius-md); font-weight: 700; }
.reset-box { margin-top: var(--space-md); }
.reset-box p { font-size: var(--font-size-xs); color: var(--color-danger); margin-bottom: var(--space-sm); }

.avatar-setup { display: flex; align-items: center; gap: var(--space-lg); }
.avatar-preview { position: relative; width: 80px; height: 80px; border-radius: 50%; overflow: hidden; background: var(--border-light); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-placeholder { font-size: 2.5rem; line-height: 1; }
.avatar-edit { position: absolute; bottom: 0; right: 0; background: var(--color-primary); color: #fff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }
.avatar-info { flex: 1; }
.avatar-info p { font-size: var(--font-size-xs); color: var(--text-secondary); }
.avatar-hint { font-size: 0.55rem !important; color: var(--text-hint) !important; margin-top: 4px; }
.btn-remove { padding: 4px 12px; border-radius: var(--radius-full); background: #FFEBEE; color: var(--color-danger); font-size: 0.6rem; font-weight: 600; }

/* ===== 游戏难度 ===== */
.diff-hint { font-size: var(--font-size-xs); color: var(--text-hint); margin-top: -8px; margin-bottom: var(--space-md); }
.diff-grid { display: flex; gap: var(--space-sm); }
.diff-option {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: var(--space-md) var(--space-lg); border-radius: var(--radius-lg);
  background: var(--bg-main); border: 2px solid var(--border-light);
  cursor: pointer; transition: all 0.25s var(--ease-smooth); position: relative;
  flex: 1; min-width: 0;
}
.diff-option:hover { transform: translateY(-2px); box-shadow: var(--shadow-card); }
.diff-option.active { border-color: var(--color-primary); background: var(--color-primary-light); transform: scale(1.03); }
.diff-icon { font-size: 1.5rem; }
.diff-name { font-size: var(--font-size-base); font-weight: 700; color: var(--text-primary); white-space: nowrap; }
.diff-desc { font-size: 0.6rem; color: var(--text-hint); white-space: nowrap; }
.diff-check {
  position: absolute; top: 6px; right: 6px;
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--color-success); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; font-weight: 700;
  animation: pop 0.3s var(--ease-bounce);
}

/* ===== 勋章展示 ===== */
.medal-hint { font-size: var(--font-size-xs); color: var(--text-hint); margin-top: -8px; margin-bottom: var(--space-md); }
.medal-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: var(--space-md); }
.medal-card {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: var(--space-lg) var(--space-md); border-radius: var(--radius-lg);
  background: var(--bg-main); border: 2px solid var(--border-light);
  transition: all 0.3s var(--ease-smooth); position: relative; text-align: center;
}
.medal-card.unlocked { border-color: var(--color-primary); background: linear-gradient(135deg, #FFF3E0, #FFE0B2); }
.medal-icon { font-size: 2.5rem; line-height: 1; }
.medal-icon.medal-locked { filter: grayscale(1) opacity(0.4); }
.medal-name { font-size: var(--font-size-sm); font-weight: 700; color: var(--text-primary); white-space: nowrap; }
.medal-name-en { font-size: 0.6rem; color: var(--text-hint); white-space: nowrap; }
.medal-condition { font-size: 0.55rem; color: var(--text-hint); text-align: center; line-height: 1.3; }
.medal-progress-bar { width: 100%; height: 6px; background: var(--border-light); border-radius: 3px; overflow: hidden; margin-top: 4px; }
.medal-progress-fill { height: 100%; background: var(--color-primary); border-radius: 3px; transition: width 0.5s var(--ease-smooth); }
.medal-progress-text { font-size: 0.55rem; color: var(--text-hint); }
.medal-badge {
  position: absolute; top: 6px; right: 6px;
  padding: 2px 8px; border-radius: var(--radius-full);
  background: var(--color-success); color: #fff;
  font-size: 0.5rem; font-weight: 700;
  animation: pop 0.3s var(--ease-bounce);
}

/* ===== 主题色选择 ===== */
.theme-hint { font-size: var(--font-size-xs); color: var(--text-hint); margin-top: -8px; margin-bottom: var(--space-md); }
.theme-grid { display: flex; gap: var(--space-sm); flex-wrap: wrap; }
.theme-option {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: var(--space-md) var(--space-lg); border-radius: var(--radius-lg);
  background: var(--bg-main); border: 2px solid var(--border-light);
  cursor: pointer; transition: all 0.25s var(--ease-smooth); position: relative;
  min-width: 80px;
}
.theme-option:hover { transform: translateY(-2px); box-shadow: var(--shadow-card); }
.theme-option.active { border-color: var(--color-primary); background: var(--color-primary-light); transform: scale(1.05); }
.theme-swatch { width: 36px; height: 36px; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.15); transition: transform 0.2s; }
.theme-option:hover .theme-swatch { transform: scale(1.15); }
.theme-name { font-size: 0.65rem; color: var(--text-secondary); font-weight: 600; white-space: nowrap; }
.theme-check {
  position: absolute; top: 6px; right: 6px;
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--color-success); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; font-weight: 700;
  animation: pop 0.3s var(--ease-bounce);
}

/* ===== v5.0: BGM 音量滑块 ===== */
.volume-slider { display: flex; align-items: center; gap: var(--space-sm); }
.vol-range {
  -webkit-appearance: none; appearance: none;
  width: 120px; height: 6px; border-radius: 3px;
  background: var(--border-light); outline: none;
}
.vol-range::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 18px; height: 18px; border-radius: 50%;
  background: var(--color-primary); cursor: pointer;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.vol-val { font-size: var(--font-size-xs); color: var(--text-hint); min-width: 36px; }

/* ===== v5.0: 点赞趋势图 ===== */
.like-trend-chart {
  display: flex; align-items: flex-end; justify-content: space-between; gap: var(--space-xs);
  height: 60px; padding: var(--space-sm) 0;
  border-top: 1px solid var(--border-light);
  margin-top: var(--space-sm);
}
.like-trend-col {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px;
  height: 100%;
}
.like-trend-col.today .like-trend-label { color: var(--color-primary); font-weight: 700; }
.like-trend-wrap {
  flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center;
}
.like-trend-bar {
  width: 16px; min-height: 2px; border-radius: 4px 4px 0 0;
  background: var(--border-light);
  transition: height 0.5s ease;
}
.like-trend-bar.active {
  background: linear-gradient(180deg, #2196F3, #64B5F6);
}
.like-trend-val { font-size: 0.5rem; font-weight: 700; color: #2196F3; }
.like-trend-label { font-size: 0.55rem; color: var(--text-hint); }

/* ===== v5.0: 收藏单词列表 ===== */
.fav-empty {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-sm);
  padding: var(--space-lg) 0; text-align: center;
}
.fav-empty-icon { font-size: 2.5rem; }
.fav-empty p { font-size: var(--font-size-sm); color: var(--text-secondary); margin: 0; }
.fav-hint { font-size: 0.6rem !important; color: var(--text-hint); }

.fav-grid {
  display: flex; flex-wrap: wrap; gap: var(--space-xs);
}
.fav-item {
  display: flex; align-items: center; gap: var(--space-xs);
  padding: 6px 10px; border-radius: var(--radius-lg);
  background: var(--bg-main); border: 1px solid var(--border-light);
  font-size: var(--font-size-sm);
  transition: all 0.2s;
}
.fav-item:hover { border-color: #EF9A9A; background: #FFF3F3; }
.fav-emoji { font-size: 1.2rem; }
.fav-en { font-weight: 600; color: var(--text-primary); }
.fav-unlike {
  width: 20px; height: 20px; border-radius: 50%;
  border: none; background: transparent; color: #ccc;
  font-size: 0.7rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.fav-unlike:hover { background: #EF5350; color: #fff; }

/* ===== P3-2: 性别选择器 ===== */
.gender-label {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin-bottom: var(--space-md);
}
.gender-options {
  display: flex;
  gap: var(--space-md);
}
.gender-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-md) var(--space-sm);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  cursor: pointer;
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}
.gender-option:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}
.gender-option.active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  color: var(--text-primary);
  box-shadow: 0 2px 8px rgba(255, 140, 66, 0.2);
}
.gender-emoji {
  font-size: 2rem;
}

/* ===== P1-5: 成长里程碑时间线 ===== */
.milestone-empty { display: flex; flex-direction: column; align-items: center; gap: var(--space-sm); padding: var(--space-lg) 0; text-align: center; }
.milestone-empty-icon { font-size: 2.5rem; }
.milestone-empty p { font-size: var(--font-size-sm); color: var(--text-secondary); margin: 0; }

.timeline {
  position: relative;
  padding-left: 28px;
}
.timeline::before {
  content: '';
  position: absolute;
  left: 12px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, var(--color-primary), var(--border-light));
}
.timeline-item {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
  position: relative;
}
.timeline-item::before {
  content: '';
  position: absolute;
  left: -20px;
  top: 4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 2px solid var(--bg-card);
}
.timeline-icon { font-size: 1.3rem; flex-shrink: 0; }
.timeline-content { flex: 1; }
.timeline-title { font-size: var(--font-size-sm); font-weight: 700; color: var(--text-primary); }
.timeline-desc { font-size: 0.65rem; color: var(--text-hint); margin-top: 2px; }
.timeline-date { font-size: 0.6rem; color: var(--text-hint); margin-top: 2px; font-family: monospace; }

/* ===== 🔧 调试工具 ===== */
.debug-card {
  border: 2px dashed #FFB300;
  background: linear-gradient(135deg, #FFF8E1, #FFF3E0);
}
.debug-hint {
  font-size: var(--font-size-xs);
  color: var(--text-hint);
  margin-top: -8px;
  margin-bottom: var(--space-md);
}
.debug-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) 0;
}
.debug-row + .debug-row {
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
}
.debug-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.debug-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
}
.debug-value {
  font-size: var(--font-size-base);
  font-weight: 700;
  color: var(--color-primary);
}
.debug-input-group {
  display: flex;
  gap: var(--space-xs);
  align-items: center;
}
.debug-input {
  width: 100px;
  padding: 6px 10px;
  border: 1.5px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: 600;
  text-align: center;
  background: white;
}
.debug-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-light);
}
.btn-debug {
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: white;
  font-size: var(--font-size-sm);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-debug:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(255, 140, 66, 0.3);
}
.btn-debug:active {
  transform: scale(0.95);
}
.btn-debug-danger {
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  background: #FF5722;
  color: white;
  font-size: var(--font-size-sm);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-debug-danger:hover {
  background: #E64A19;
  transform: scale(1.05);
}
.debug-quick-btns {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-top: var(--space-sm);
  padding-top: var(--space-sm);
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
}
.btn-quick {
  padding: 6px 12px;
  border-radius: var(--radius-full);
  background: white;
  border: 1.5px solid var(--color-primary-light);
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-quick:hover {
  background: var(--color-primary);
  color: white;
  transform: scale(1.05);
}
.btn-quick:active {
  transform: scale(0.95);
}
.debug-danger .debug-label {
  color: #FF5722;
}
.debug-danger .debug-value {
  color: #FF5722;
}

/* ===== v6.0: 萌宠设置 ===== */
.species-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.species-option {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 2px solid var(--border-light);
  background: var(--bg-card);
  font-size: 1.3rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.species-option.active {
  border-color: #CE93D8;
  background: #F3E5F5;
  box-shadow: 0 2px 8px rgba(206, 147, 216, 0.3);
}
.species-option.species-clear {
  font-size: 0.7rem;
  width: auto;
  padding: 0 10px;
}
.pet-status-summary {
  margin-top: 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 0.75rem;
  color: var(--text-secondary);
}
</style>