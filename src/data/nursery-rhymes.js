/**
 * 呦呦英语启蒙 — 童谣数据（12 首经典英文童谣）
 * 每首关联一个分类，包含标题、歌词行、关键词
 */
export const NURSERY_RHYMES = [
  {
    id: 'old-macdonald',
    title: 'Old MacDonald Had a Farm',
    categoryId: 'animal',
    emoji: '🐾',
    lines: [
      'Old MacDonald had a farm, E-I-E-I-O!',
      'And on his farm he had a cow, E-I-E-I-O!',
      'With a moo moo here,',
      'And a moo moo there,',
      'Here a moo, there a moo,',
      'Everywhere a moo moo!',
      'Old MacDonald had a farm, E-I-E-I-O!'
    ],
    keywords: ['cow', 'moo', 'farm'],
    bgMusic: '🎵'
  },
  {
    id: 'apples-bananas',
    title: 'Apples and Bananas',
    categoryId: 'fruit',
    emoji: '🍎',
    lines: [
      'I like to eat, eat, eat apples and bananas.',
      'I like to eat, eat, eat apples and bananas.',
      'I like to ate, ate, ate ay-ples and ba-nay-nays.',
      'I like to eat, eat, eat eeples and bee-nee-nees.',
      'I like to ite, ite, ite i-ples and bye-ny-nyes.',
      'I like to ote, ote, ote o-ples and bo-no-nos.',
      'I like to ute, ute, ute u-ples and bu-nu-nus.'
    ],
    keywords: ['apples', 'bananas', 'eat'],
    bgMusic: '🍌'
  },
  {
    id: 'sing-a-rainbow',
    title: 'I Can Sing a Rainbow',
    categoryId: 'colors',
    emoji: '🌈',
    lines: [
      'Red and yellow and pink and green,',
      'Purple and orange and blue.',
      'I can sing a rainbow,',
      'Sing a rainbow,',
      'Sing a rainbow too!'
    ],
    keywords: ['red', 'yellow', 'green', 'blue', 'rainbow'],
    bgMusic: '🎨'
  },
  {
    id: 'head-shoulders',
    title: 'Head, Shoulders, Knees and Toes',
    categoryId: 'body',
    emoji: '🪞',
    lines: [
      'Head, shoulders, knees and toes, knees and toes.',
      'Head, shoulders, knees and toes, knees and toes.',
      'And eyes, and ears, and mouth, and nose.',
      'Head, shoulders, knees and toes, knees and toes!'
    ],
    keywords: ['head', 'shoulders', 'knees', 'toes', 'eyes', 'ears'],
    bgMusic: '💪'
  },
  {
    id: 'finger-family',
    title: 'Finger Family',
    categoryId: 'family',
    emoji: '🏠',
    lines: [
      'Daddy finger, daddy finger, where are you?',
      'Here I am, here I am, how do you do?',
      'Mommy finger, mommy finger, where are you?',
      'Here I am, here I am, how do you do?',
      'Brother finger, brother finger, where are you?',
      'Here I am, here I am, how do you do?',
      'Sister finger, sister finger, where are you?',
      'Here I am, here I am, how do you do?',
      'Baby finger, baby finger, where are you?',
      'Here I am, here I am, how do you do?'
    ],
    keywords: ['daddy', 'mommy', 'family'],
    bgMusic: '👨‍👩‍👧‍👦'
  },
  {
    id: 'broccoli-icecream',
    title: 'Do You Like Broccoli Ice Cream?',
    categoryId: 'food',
    emoji: '🍽️',
    lines: [
      'Do you like broccoli?',
      'Yes, I do!',
      'Do you like ice cream?',
      'Yes, I do!',
      'Do you like broccoli ice cream?',
      'Yuck! No, I don\'t!',
      'Yummy! Yes, I do!'
    ],
    keywords: ['broccoli', 'ice cream', 'like'],
    bgMusic: '🥦'
  },
  {
    id: 'wheels-on-bus',
    title: 'The Wheels on the Bus',
    categoryId: 'transport',
    emoji: '🚗',
    lines: [
      'The wheels on the bus go round and round,',
      'Round and round, round and round.',
      'The wheels on the bus go round and round,',
      'All through the town!',
      'The wipers on the bus go swish, swish, swish,',
      'Swish, swish, swish, swish, swish, swish.',
      'The wipers on the bus go swish, swish, swish,',
      'All through the town!'
    ],
    keywords: ['wheels', 'bus', 'round'],
    bgMusic: '🚌'
  },
  {
    id: 'mr-sun',
    title: 'Mr. Sun',
    categoryId: 'weather',
    emoji: '🌤️',
    lines: [
      'Oh, Mr. Sun, Sun, Mr. Golden Sun,',
      'Please shine down on me.',
      'Oh, Mr. Sun, Sun, Mr. Golden Sun,',
      'Hiding behind a tree.',
      'These little children,',
      'Are asking you to come out,',
      'Where we can play with you.',
      'Oh, Mr. Sun, Sun, Mr. Golden Sun,',
      'Please shine down on me!'
    ],
    keywords: ['sun', 'shine', 'tree'],
    bgMusic: '☀️'
  },
  {
    id: 'five-little-ducks',
    title: 'Five Little Ducks',
    categoryId: 'numbers',
    emoji: '🔢',
    lines: [
      'Five little ducks went out one day,',
      'Over the hills and far away.',
      'Mother Duck said, "Quack, quack, quack, quack,"',
      'But only four little ducks came back.',
      'Four little ducks, three little ducks,',
      'Two little ducks, one little duck,',
      'No little ducks came swimming back.',
      'So Mother Duck said, "Quack, quack, quack, quack,"',
      'And all five little ducks came swimming back!'
    ],
    keywords: ['five', 'ducks', 'quack'],
    bgMusic: '🦆'
  },
  {
    id: 'if-youre-happy',
    title: "If You're Happy",
    categoryId: 'actions',
    emoji: '🏃',
    lines: [
      "If you're happy and you know it, clap your hands!",
      "If you're happy and you know it, clap your hands!",
      "If you're happy and you know it,",
      "Then your face will surely show it.",
      "If you're happy and you know it, clap your hands!",
      "If you're happy and you know it, stomp your feet!",
      "If you're happy and you know it, shout hooray!"
    ],
    keywords: ['happy', 'clap', 'hands'],
    bgMusic: '👏'
  },
  {
    id: 'put-on-shoes',
    title: 'Put On Your Shoes',
    categoryId: 'clothes',
    emoji: '👕',
    lines: [
      'Put on your shoes, your pretty shoes,',
      'Put on your shoes, your pretty shoes.',
      'Put on your dress, your pretty dress,',
      'Put on your dress, your pretty dress.',
      'Put on your hat, your pretty hat,',
      'Put on your hat, your pretty hat.',
      'Now you\'re ready to go outside!'
    ],
    keywords: ['shoes', 'dress', 'hat'],
    bgMusic: '👟'
  },
  {
    id: 'happy-know-it',
    title: "If You're Happy and You Know It",
    categoryId: 'emotions',
    emoji: '😊',
    lines: [
      "If you're happy and you know it, smile today!",
      "If you're happy and you know it, give a hug!",
      "If you're happy and you know it, jump up high!",
      "If you're happy and you know it, shout hooray!",
      "We are happy, yes we are,",
      "Happy happy happy, every day!"
    ],
    keywords: ['happy', 'smile', 'hug'],
    bgMusic: '😄'
  }
]

/** 根据分类 ID 获取童谣 */
export function getRhymeByCategory(categoryId) {
  return NURSERY_RHYMES.find(r => r.categoryId === categoryId)
}

/** 获取所有童谣 */
export function getAllRhymes() {
  return NURSERY_RHYMES
}
