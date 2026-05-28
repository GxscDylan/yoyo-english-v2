/**
 * 呦呦英语启蒙 — 词库数据
 *
 * L1 启蒙（3-4岁）：5 个主题分类 × 10 词 = 50 词
 * L2 进阶（4-6岁）：7 个主题分类 × 10 词 = 70 词
 * 统一数据：12 分类 120 词 + 30 句型
 * 遵循 Lingumi 原则：L1 不显示英文拼写
 */

export const L1_WORDS = [
  // === 动物 · 森林场景 ===
  {
    id: 'animal',
    name: '动物',
    nameEn: 'Animals',
    emoji: '🐾',
    scene: 'forest',
    level: 1,
    nurseryRhyme: 'Old MacDonald',
    words: [
      { id: 'dog', en: 'dog', zh: '狗', emoji: '🐕', phonetic: '/dɒɡ/' },
      { id: 'cat', en: 'cat', zh: '猫', emoji: '🐈', phonetic: '/kæt/' },
      { id: 'bird', en: 'bird', zh: '鸟', emoji: '🐦', phonetic: '/bɜːrd/' },
      { id: 'fish', en: 'fish', zh: '鱼', emoji: '🐟', phonetic: '/fɪʃ/' },
      { id: 'rabbit', en: 'rabbit', zh: '兔子', emoji: '🐰', phonetic: '/ˈræbɪt/' },
      { id: 'bear', en: 'bear', zh: '熊', emoji: '🐻', phonetic: '/ber/' },
      { id: 'duck', en: 'duck', zh: '鸭子', emoji: '🦆', phonetic: '/dʌk/' },
      { id: 'pig', en: 'pig', zh: '猪', emoji: '🐷', phonetic: '/pɪɡ/' },
      { id: 'cow', en: 'cow', zh: '牛', emoji: '🐄', phonetic: '/kaʊ/' },
      { id: 'frog', en: 'frog', zh: '青蛙', emoji: '🐸', phonetic: '/frɔːɡ/' }
    ]
  },

  // === 水果 · 果园场景 ===
  {
    id: 'fruit',
    name: '水果',
    nameEn: 'Fruits',
    emoji: '🍎',
    scene: 'orchard',
    level: 1,
    nurseryRhyme: 'Apples and Bananas',
    words: [
      { id: 'apple', en: 'apple', zh: '苹果', emoji: '🍎', phonetic: '/ˈæpəl/' },
      { id: 'banana', en: 'banana', zh: '香蕉', emoji: '🍌', phonetic: '/bəˈnænə/' },
      { id: 'orange', en: 'orange', zh: '橙子', emoji: '🍊', phonetic: '/ˈɔːrɪndʒ/' },
      { id: 'grape', en: 'grape', zh: '葡萄', emoji: '🍇', phonetic: '/ɡreɪp/' },
      { id: 'pear', en: 'pear', zh: '梨', emoji: '🍐', phonetic: '/per/' },
      { id: 'watermelon', en: 'watermelon', zh: '西瓜', emoji: '🍉', phonetic: '/ˈwɔːtərmelən/' },
      { id: 'cherry', en: 'cherry', zh: '樱桃', emoji: '🍒', phonetic: '/ˈtʃeri/' },
      { id: 'peach', en: 'peach', zh: '桃子', emoji: '🍑', phonetic: '/piːtʃ/' },
      { id: 'mango', en: 'mango', zh: '芒果', emoji: '🥭', phonetic: '/ˈmæŋɡoʊ/' },
      { id: 'lemon', en: 'lemon', zh: '柠檬', emoji: '🍋', phonetic: '/ˈlemən/' }
    ]
  },

  // === 颜色 · 彩虹场景 ===
  {
    id: 'color',
    name: '颜色',
    nameEn: 'Colors',
    emoji: '🎨',
    scene: 'rainbow',
    level: 1,
    nurseryRhyme: 'I Can Sing a Rainbow',
    words: [
      { id: 'red', en: 'red', zh: '红色', emoji: '🔴', phonetic: '/red/' },
      { id: 'blue', en: 'blue', zh: '蓝色', emoji: '🔵', phonetic: '/bluː/' },
      { id: 'yellow', en: 'yellow', zh: '黄色', emoji: '🟡', phonetic: '/ˈjeloʊ/' },
      { id: 'green', en: 'green', zh: '绿色', emoji: '🟢', phonetic: '/ɡriːn/' },
      { id: 'purple', en: 'purple', zh: '紫色', emoji: '🟣', phonetic: '/ˈpɜːrpəl/' },
      { id: 'pink', en: 'pink', zh: '粉色', emoji: '🩷', phonetic: '/pɪŋk/' },
      { id: 'white', en: 'white', zh: '白色', emoji: '⚪', phonetic: '/waɪt/' },
      { id: 'black', en: 'black', zh: '黑色', emoji: '⚫', phonetic: '/blæk/' },
      { id: 'brown', en: 'brown', zh: '棕色', emoji: '🟤', phonetic: '/braʊn/' },
      { id: 'gray', en: 'gray', zh: '灰色', emoji: '🩶', phonetic: '/ɡreɪ/' }
    ]
  },

  // === 身体 · 镜子场景 ===
  {
    id: 'body',
    name: '身体',
    nameEn: 'Body',
    emoji: '👶',
    scene: 'mirror',
    level: 1,
    nurseryRhyme: 'Head Shoulders Knees',
    words: [
      { id: 'eye', en: 'eye', zh: '眼睛', emoji: '👁️', phonetic: '/aɪ/' },
      { id: 'nose', en: 'nose', zh: '鼻子', emoji: '👃', phonetic: '/noʊz/' },
      { id: 'mouth', en: 'mouth', zh: '嘴巴', emoji: '👄', phonetic: '/maʊθ/' },
      { id: 'ear', en: 'ear', zh: '耳朵', emoji: '👂', phonetic: '/ɪr/' },
      { id: 'hand', en: 'hand', zh: '手', emoji: '✋', phonetic: '/hænd/' },
      { id: 'foot', en: 'foot', zh: '脚', emoji: '🦶', phonetic: '/fʊt/' },
      { id: 'head', en: 'head', zh: '头', emoji: '🗣️', phonetic: '/hed/' },
      { id: 'arm', en: 'arm', zh: '手臂', emoji: '💪', phonetic: '/ɑːrm/' },
      { id: 'leg', en: 'leg', zh: '腿', emoji: '🦵', phonetic: '/leɡ/' },
      { id: 'tummy', en: 'tummy', zh: '肚子', emoji: '🫃', phonetic: '/ˈtʌmi/' }
    ]
  },

  // === 家庭 · 客厅场景 ===
  {
    id: 'family',
    name: '家庭',
    nameEn: 'Family',
    emoji: '👨‍👩‍👧',
    scene: 'home',
    level: 1,
    nurseryRhyme: 'Finger Family',
    words: [
      { id: 'mommy', en: 'mommy', zh: '妈妈', emoji: '👩', phonetic: '/ˈmɑːmi/' },
      { id: 'daddy', en: 'daddy', zh: '爸爸', emoji: '👨', phonetic: '/ˈdædi/' },
      { id: 'baby', en: 'baby', zh: '宝宝', emoji: '👶', phonetic: '/ˈbeɪbi/' },
      { id: 'brother', en: 'brother', zh: '哥哥/弟弟', emoji: '👦', phonetic: '/ˈbrʌðər/' },
      { id: 'sister', en: 'sister', zh: '姐姐/妹妹', emoji: '👧', phonetic: '/ˈsɪstər/' },
      { id: 'grandma', en: 'grandma', zh: '奶奶/外婆', emoji: '👵', phonetic: '/ˈɡrænmɑː/' },
      { id: 'grandpa', en: 'grandpa', zh: '爷爷/外公', emoji: '👴', phonetic: '/ˈɡrænpɑː/' },
      { id: 'family', en: 'family', zh: '家庭', emoji: '👪', phonetic: '/ˈfæməli/' },
      { id: 'home', en: 'home', zh: '家', emoji: '🏠', phonetic: '/hoʊm/' },
      { id: 'love', en: 'love', zh: '爱', emoji: '❤️', phonetic: '/lʌv/' }
    ]
  }
]

/** L1 所有词条扁平列表（带 level:1） */
export const ALL_L1_WORDS = L1_WORDS.flatMap(cat =>
  cat.words.map(w => ({ ...w, categoryId: cat.id, categoryName: cat.name, level: 1 }))
)

// ============================================================
// L2 进阶（4-6岁）：7 个新分类 × 10 词 = 70 词
// L2 逐渐引入英文单词拼写 + 简单句型模仿
// ============================================================

export const L2_WORDS = [
  // === 食物 · 厨房场景 ===
  {
    id: 'food',
    name: '食物',
    nameEn: 'Food',
    emoji: '🍽️',
    scene: 'kitchen',
    level: 2,
    nurseryRhyme: 'Do You Like Broccoli Ice Cream?',
    words: [
      { id: 'bread', en: 'bread', zh: '面包', emoji: '🍞', phonetic: '/bred/' },
      { id: 'rice', en: 'rice', zh: '米饭', emoji: '🍚', phonetic: '/raɪs/' },
      { id: 'egg', en: 'egg', zh: '鸡蛋', emoji: '🥚', phonetic: '/eɡ/' },
      { id: 'milk', en: 'milk', zh: '牛奶', emoji: '🥛', phonetic: '/mɪlk/' },
      { id: 'cake', en: 'cake', zh: '蛋糕', emoji: '🎂', phonetic: '/keɪk/' },
      { id: 'cookie', en: 'cookie', zh: '饼干', emoji: '🍪', phonetic: '/ˈkʊki/' },
      { id: 'pizza', en: 'pizza', zh: '披萨', emoji: '🍕', phonetic: '/ˈpiːtsə/' },
      { id: 'soup', en: 'soup', zh: '汤', emoji: '🥣', phonetic: '/suːp/' },
      { id: 'candy', en: 'candy', zh: '糖果', emoji: '🍬', phonetic: '/ˈkændi/' },
      { id: 'ice-cream', en: 'ice cream', zh: '冰淇淋', emoji: '🍦', phonetic: '/aɪs kriːm/' }
    ]
  },

  // === 交通工具 · 城市街道场景 ===
  {
    id: 'transport',
    name: '交通工具',
    nameEn: 'Transport',
    emoji: '🚗',
    scene: 'city',
    level: 2,
    nurseryRhyme: 'The Wheels on the Bus',
    words: [
      { id: 'car', en: 'car', zh: '小汽车', emoji: '🚗', phonetic: '/kɑːr/' },
      { id: 'bus', en: 'bus', zh: '公共汽车', emoji: '🚌', phonetic: '/bʌs/' },
      { id: 'train', en: 'train', zh: '火车', emoji: '🚂', phonetic: '/treɪn/' },
      { id: 'bike', en: 'bike', zh: '自行车', emoji: '🚲', phonetic: '/baɪk/' },
      { id: 'plane', en: 'plane', zh: '飞机', emoji: '✈️', phonetic: '/pleɪn/' },
      { id: 'boat', en: 'boat', zh: '小船', emoji: '⛵', phonetic: '/boʊt/' },
      { id: 'ship', en: 'ship', zh: '大船', emoji: '🚢', phonetic: '/ʃɪp/' },
      { id: 'taxi', en: 'taxi', zh: '出租车', emoji: '🚕', phonetic: '/ˈtæksi/' },
      { id: 'truck', en: 'truck', zh: '卡车', emoji: '🚛', phonetic: '/trʌk/' },
      { id: 'helicopter', en: 'helicopter', zh: '直升机', emoji: '🚁', phonetic: '/ˈhelɪkɑːptər/' }
    ]
  },

  // === 天气 · 户外场景 ===
  {
    id: 'weather',
    name: '天气',
    nameEn: 'Weather',
    emoji: '🌤️',
    scene: 'outdoor',
    level: 2,
    nurseryRhyme: 'Mr. Sun',
    words: [
      { id: 'sunny', en: 'sunny', zh: '晴天', emoji: '☀️', phonetic: '/ˈsʌni/' },
      { id: 'rainy', en: 'rainy', zh: '下雨', emoji: '🌧️', phonetic: '/ˈreɪni/' },
      { id: 'cloudy', en: 'cloudy', zh: '多云', emoji: '☁️', phonetic: '/ˈklaʊdi/' },
      { id: 'windy', en: 'windy', zh: '刮风', emoji: '💨', phonetic: '/ˈwɪndi/' },
      { id: 'snowy', en: 'snowy', zh: '下雪', emoji: '🌨️', phonetic: '/ˈsnoʊi/' },
      { id: 'hot', en: 'hot', zh: '热', emoji: '🥵', phonetic: '/hɑːt/' },
      { id: 'cold', en: 'cold', zh: '冷', emoji: '🥶', phonetic: '/koʊld/' },
      { id: 'rainbow', en: 'rainbow', zh: '彩虹', emoji: '🌈', phonetic: '/ˈreɪnboʊ/' },
      { id: 'thunder', en: 'thunder', zh: '打雷', emoji: '⛈️', phonetic: '/ˈθʌndər/' },
      { id: 'star', en: 'star', zh: '星星', emoji: '⭐', phonetic: '/stɑːr/' }
    ]
  },

  // === 数字 · 数学课场景 ===
  {
    id: 'numbers',
    name: '数字',
    nameEn: 'Numbers',
    emoji: '🔢',
    scene: 'classroom',
    level: 2,
    nurseryRhyme: 'Five Little Ducks',
    words: [
      { id: 'one', en: 'one', zh: '一', emoji: '1️⃣', phonetic: '/wʌn/' },
      { id: 'two', en: 'two', zh: '二', emoji: '2️⃣', phonetic: '/tuː/' },
      { id: 'three', en: 'three', zh: '三', emoji: '3️⃣', phonetic: '/θriː/' },
      { id: 'four', en: 'four', zh: '四', emoji: '4️⃣', phonetic: '/fɔːr/' },
      { id: 'five', en: 'five', zh: '五', emoji: '5️⃣', phonetic: '/faɪv/' },
      { id: 'six', en: 'six', zh: '六', emoji: '6️⃣', phonetic: '/sɪks/' },
      { id: 'seven', en: 'seven', zh: '七', emoji: '7️⃣', phonetic: '/ˈsevən/' },
      { id: 'eight', en: 'eight', zh: '八', emoji: '8️⃣', phonetic: '/eɪt/' },
      { id: 'nine', en: 'nine', zh: '九', emoji: '9️⃣', phonetic: '/naɪn/' },
      { id: 'ten', en: 'ten', zh: '十', emoji: '🔟', phonetic: '/ten/' }
    ]
  },

  // === 动作 · 操场场景 ===
  {
    id: 'actions',
    name: '动作',
    nameEn: 'Actions',
    emoji: '🏃',
    scene: 'playground',
    level: 2,
    nurseryRhyme: 'If You\'re Happy',
    words: [
      { id: 'run', en: 'run', zh: '跑', emoji: '🏃', phonetic: '/rʌn/' },
      { id: 'jump', en: 'jump', zh: '跳', emoji: '🤸', phonetic: '/dʒʌmp/' },
      { id: 'walk', en: 'walk', zh: '走', emoji: '🚶', phonetic: '/wɔːk/' },
      { id: 'sit', en: 'sit', zh: '坐', emoji: '🪑', phonetic: '/sɪt/' },
      { id: 'stand', en: 'stand', zh: '站', emoji: '🧍', phonetic: '/stænd/' },
      { id: 'clap', en: 'clap', zh: '拍手', emoji: '👏', phonetic: '/klæp/' },
      { id: 'dance', en: 'dance', zh: '跳舞', emoji: '💃', phonetic: '/dæns/' },
      { id: 'sing', en: 'sing', zh: '唱歌', emoji: '🎤', phonetic: '/sɪŋ/' },
      { id: 'swim', en: 'swim', zh: '游泳', emoji: '🏊', phonetic: '/swɪm/' },
      { id: 'sleep', en: 'sleep', zh: '睡觉', emoji: '😴', phonetic: '/sliːp/' }
    ]
  },

  // === 衣服 · 穿衣镜场景 ===
  {
    id: 'clothes',
    name: '衣服',
    nameEn: 'Clothes',
    emoji: '👕',
    scene: 'bedroom',
    level: 2,
    nurseryRhyme: 'Put On Your Shoes',
    words: [
      { id: 'shirt', en: 'shirt', zh: '衬衫', emoji: '👕', phonetic: '/ʃɜːrt/' },
      { id: 'pants', en: 'pants', zh: '裤子', emoji: '👖', phonetic: '/pænts/' },
      { id: 'shoes', en: 'shoes', zh: '鞋子', emoji: '👟', phonetic: '/ʃuːz/' },
      { id: 'dress', en: 'dress', zh: '连衣裙', emoji: '👗', phonetic: '/dres/' },
      { id: 'hat', en: 'hat', zh: '帽子', emoji: '🎩', phonetic: '/hæt/' },
      { id: 'socks', en: 'socks', zh: '袜子', emoji: '🧦', phonetic: '/sɑːks/' },
      { id: 'jacket', en: 'jacket', zh: '夹克', emoji: '🧥', phonetic: '/ˈdʒækɪt/' },
      { id: 'scarf', en: 'scarf', zh: '围巾', emoji: '🧣', phonetic: '/skɑːrf/' },
      { id: 'gloves', en: 'gloves', zh: '手套', emoji: '🧤', phonetic: '/ɡlʌvz/' },
      { id: 'coat', en: 'coat', zh: '外套', emoji: '🧥', phonetic: '/koʊt/' }
    ]
  },

  // === 情感 · 表情包场景 ===
  {
    id: 'emotions',
    name: '情感',
    nameEn: 'Feelings',
    emoji: '😊',
    scene: 'heart',
    level: 2,
    nurseryRhyme: 'If You\'re Happy and You Know It',
    words: [
      { id: 'happy', en: 'happy', zh: '开心', emoji: '😊', phonetic: '/ˈhæpi/' },
      { id: 'sad', en: 'sad', zh: '难过', emoji: '😢', phonetic: '/sæd/' },
      { id: 'angry', en: 'angry', zh: '生气', emoji: '😠', phonetic: '/ˈæŋɡri/' },
      { id: 'scared', en: 'scared', zh: '害怕', emoji: '😨', phonetic: '/skerd/' },
      { id: 'hungry', en: 'hungry', zh: '饿', emoji: '🤤', phonetic: '/ˈhʌŋɡri/' },
      { id: 'tired', en: 'tired', zh: '累', emoji: '😫', phonetic: '/taɪərd/' },
      { id: 'surprised', en: 'surprised', zh: '惊讶', emoji: '😲', phonetic: '/sərˈpraɪzd/' },
      { id: 'excited', en: 'excited', zh: '兴奋', emoji: '🤩', phonetic: '/ɪkˈsaɪtɪd/' },
      { id: 'proud', en: 'proud', zh: '骄傲', emoji: '😎', phonetic: '/praʊd/' },
      { id: 'loved', en: 'loved', zh: '被爱', emoji: '🥰', phonetic: '/lʌvd/' }
    ]
  }
]

/** L2 所有词条扁平列表 */
export const ALL_L2_WORDS = L2_WORDS.flatMap(cat =>
  cat.words.map(w => ({ ...w, categoryId: cat.id, categoryName: cat.name, level: 2 }))
)

// ============================================================
// 统一数据层（L1 + L2）
// ============================================================

/** 统一分类数组（12 个分类） */
export const ALL_CATEGORIES = [...L1_WORDS, ...L2_WORDS]

/** 统一单词列表（120 词） */
export const ALL_WORDS = [...ALL_L1_WORDS, ...ALL_L2_WORDS]

/** 根据分类 ID 获取分类数据（支持 L1 + L2） */
export function getCategoryById(id) {
  return ALL_CATEGORIES.find(c => c.id === id)
}

/** 获取已解锁分类列表（按解锁规则：顺序解锁，支持全部 12 个分类） */
export function getCategoriesUpTo(maxIndex) {
  return ALL_CATEGORIES.slice(0, Math.min(maxIndex + 1, ALL_CATEGORIES.length))
}

// ============================================================
// L2 句型（30 常用句型）
// ============================================================

export const L2_SENTENCES = [
  // 自我介绍类（6 句）
  { id: 's1', en: "Hello! I'm YoYo.", zh: "你好！我是呦呦。", category: 'greeting', level: 2 },
  { id: 's2', en: "What's your name?", zh: "你叫什么名字？", category: 'greeting', level: 2 },
  { id: 's3', en: "My name is ...", zh: "我的名字是……", category: 'greeting', level: 2 },
  { id: 's4', en: "Nice to meet you!", zh: "很高兴见到你！", category: 'greeting', level: 2 },
  { id: 's5', en: "Good morning!", zh: "早上好！", category: 'greeting', level: 2 },
  { id: 's6', en: "Goodbye!", zh: "再见！", category: 'greeting', level: 2 },

  // 颜色句型（4 句）
  { id: 's7', en: "What color is it?", zh: "这是什么颜色？", category: 'color', level: 2 },
  { id: 's8', en: "It's red.", zh: "它是红色的。", category: 'color', level: 2 },
  { id: 's9', en: "I like blue.", zh: "我喜欢蓝色。", category: 'color', level: 2 },
  { id: 's10', en: "My favorite color is green.", zh: "我最喜欢的颜色是绿色。", category: 'color', level: 2 },

  // 数字句型（4 句）
  { id: 's11', en: "How many?", zh: "有多少？", category: 'number', level: 2 },
  { id: 's12', en: "There are three.", zh: "有三个。", category: 'number', level: 2 },
  { id: 's13', en: "Count with me! 1, 2, 3!", zh: "跟我一起数！1, 2, 3！", category: 'number', level: 2 },
  { id: 's14', en: "I have five fingers.", zh: "我有五个手指。", category: 'number', level: 2 },

  // 动作句型（4 句）
  { id: 's15', en: "I can run!", zh: "我会跑！", category: 'action', level: 2 },
  { id: 's16', en: "Let's jump!", zh: "我们一起跳吧！", category: 'action', level: 2 },
  { id: 's17', en: "Can you dance?", zh: "你会跳舞吗？", category: 'action', level: 2 },
  { id: 's18', en: "I can swim.", zh: "我会游泳。", category: 'action', level: 2 },

  // 天气句型（4 句）
  { id: 's19', en: "How's the weather?", zh: "天气怎么样？", category: 'weather', level: 2 },
  { id: 's20', en: "It's sunny today.", zh: "今天是晴天。", category: 'weather', level: 2 },
  { id: 's21', en: "It's raining.", zh: "下雨了。", category: 'weather', level: 2 },
  { id: 's22', en: "I like snowy days.", zh: "我喜欢下雪天。", category: 'weather', level: 2 },

  // 喜好句型（4 句）
  { id: 's23', en: "Do you like apples?", zh: "你喜欢苹果吗？", category: 'preference', level: 2 },
  { id: 's24', en: "Yes, I do!", zh: "是的，我喜欢！", category: 'preference', level: 2 },
  { id: 's25', en: "No, I don't.", zh: "不，我不喜欢。", category: 'preference', level: 2 },
  { id: 's26', en: "I like cake.", zh: "我喜欢蛋糕。", category: 'preference', level: 2 },

  // 身体句型（4 句）
  { id: 's27', en: "Touch your nose.", zh: "摸摸你的鼻子。", category: 'body', level: 2 },
  { id: 's28', en: "This is my hand.", zh: "这是我的手。", category: 'body', level: 2 },
  { id: 's29', en: "I have two eyes.", zh: "我有两只眼睛。", category: 'body', level: 2 },
  { id: 's30', en: "Clap your hands.", zh: "拍拍你的手。", category: 'body', level: 2 }
]
