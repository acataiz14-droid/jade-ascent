/* ============================================================
   JADE ARENA: TOP-DOWN MULTIPLAYER COLOR PAD BATTLE (1-4 PLAYERS)
   WITH CHINESE VOCABULARY GOLDEN LOCK MECHANICS
   ============================================================ */
import { profileManager } from './auth.js';

export const BOT_DIFFICULTY_PROFILES = {
  very_easy: {
    name: 'ง่ายมาก',
    speed: 130, // 50% ของความเร็วปกติ (260) บอทเดินช้ามาก
    reactionMin: 2.2,
    reactionMax: 3.5,
    aiWanderPower: 0.6,
    feverChance: 0.05
  },
  easy: {
    name: 'ง่าย',
    speed: 175, // ~67% ของความเร็วปกติ
    reactionMin: 1.5,
    reactionMax: 2.4,
    aiWanderPower: 0.45,
    feverChance: 0.12
  },
  medium: {
    name: 'ปานกลาง',
    speed: 215, // ~83% ของความเร็วปกติ
    reactionMin: 1.0,
    reactionMax: 1.8,
    aiWanderPower: 0.35,
    feverChance: 0.20
  },
  hard: {
    name: 'ยาก',
    speed: 260, // 100% ความเร็วปกติของบอทในปัจจุบัน
    reactionMin: 0.6,
    reactionMax: 1.2,
    aiWanderPower: 0.20,
    feverChance: 0.30
  }
};

export const ARENA_CHARACTERS = [
  { id: 4, name: 'แพนด้ากายแกร่ง (Iron Body)', emoji: '🐼' },
  { id: 5, name: 'ลิงเมฆา (Cloud Master)', emoji: '🐒' },
  { id: 6, name: 'เซียนน้อยพู่กันจีน (Ink Sage)', emoji: '🖌️' },
  { id: 3, name: 'ปู่เต่าอายุยืน (Longevity Master)', emoji: '🐢' },
  { id: 2, name: 'เด็กเนิร์ดนำโชค (Fortune Sage)', emoji: '🤓' },
  { id: 1, name: 'ตั๊กแตนวายุ (Wind Seeker)', emoji: '🦗' }
];

export const ARENA_TOPICS = {
  hsk1_4: {
    id: 'hsk1_4',
    name: 'HSK 1 - บท 4 👨‍👩‍👧🏠',
    floorColors: ['#15803d', '#16a34a', '#14532d'],
    words: [
      { char: '家', pinyin: 'jiā', english: 'family / home', thai: 'ครอบครัว / บ้าน' },
      { char: '口', pinyin: 'kǒu', english: 'measure word for family members', thai: 'ลักษณนามคนในครอบครัว' },
      { char: '人', pinyin: 'rén', english: 'person / people', thai: 'คน / ผู้คน' },
      { char: '有', pinyin: 'yǒu', english: 'have', thai: 'มี' },
      { char: '女儿', pinyin: 'nǚ’ér', english: 'daughter', thai: 'ลูกสาว' },
      { char: '几', pinyin: 'jǐ', english: 'how many', thai: 'กี่ / เท่าไหร่' },
      { char: '岁', pinyin: 'suì', english: 'years old', thai: 'ขวบ / ปี' },
      { char: '了', pinyin: 'le', english: 'indicating a change/new situation', thai: 'แล้ว' },
      { char: '今年', pinyin: 'jīnnián', english: 'this year', thai: 'ปีนี้' },
      { char: '多大', pinyin: 'duō dà', english: 'how old', thai: 'อายุเท่าไหร่' }
    ]
  },
  hsk1_5: {
    id: 'hsk1_5',
    name: 'HSK 1 - บท 5 🍜🥢',
    floorColors: ['#b45309', '#d97706', '#78350f'],
    words: [
      { char: '会', pinyin: 'huì', english: 'can / know how to', thai: 'เป็น / สามารถ' },
      { char: '说', pinyin: 'shuō', english: 'speak / say', thai: 'พูด' },
      { char: '妈妈', pinyin: 'māma', english: 'mother / mom', thai: 'แม่' },
      { char: '菜', pinyin: 'cài', english: 'dish / food / vegetable', thai: 'อาหาร / กับข้าว / ผัก' },
      { char: '很', pinyin: 'hěn', english: 'very', thai: 'มาก' },
      { char: '好吃', pinyin: 'hǎochī', english: 'delicious', thai: 'อร่อย' },
      { char: '做', pinyin: 'zuò', english: 'make / do', thai: 'ทำ' },
      { char: '写', pinyin: 'xiě', english: 'write', thai: 'เขียน' },
      { char: '汉字', pinyin: 'Hànzì', english: 'Chinese character', thai: 'ตัวอักษรจีน' },
      { char: '怎么', pinyin: 'zěnme', english: 'how', thai: 'อย่างไร' },
      { char: '读', pinyin: 'dú', english: 'read', thai: 'อ่าน' }
    ]
  },
  kitchen: {
    id: 'kitchen',
    name: 'สิ่งของในห้องครัว 🍳🥢',
    floorColors: ['#b45309', '#d97706', '#78350f'],
    words: [
      { char: '冰箱', pinyin: 'bīngxiāng', english: 'Refrigerator', thai: 'ตู้เย็น' },
      { char: '微波炉', pinyin: 'wēibōlú', english: 'Microwave', thai: 'ไมโครเวฟ' },
      { char: '盘子', pinyin: 'pánzi', english: 'Plate', thai: 'จาน' },
      { char: '碗', pinyin: 'wǎn', english: 'Bowl', thai: 'ชาม' },
      { char: '勺子', pinyin: 'sháozi', english: 'Spoon', thai: 'ช้อน' },
      { char: '叉子', pinyin: 'chāzi', english: 'Fork', thai: 'ส้อม' },
      { char: '筷子', pinyin: 'kuàizi', english: 'Chopsticks', thai: 'ตะเกียบ' },
      { char: '杯子', pinyin: 'bēizi', english: 'Cup', thai: 'ถ้วย / แก้ว' }
    ]
  },
  fruits: {
    id: 'fruits',
    name: 'ด่าน 1: ผลไม้ (Fruits) 🎋🍎',
    floorColors: ['#15803d', '#16a34a', '#166534'],
    words: [
      { char: '苹果', pinyin: 'píngguǒ', english: 'apple', thai: 'แอปเปิ้ล' },
      { char: '香蕉', pinyin: 'xiāngjiāo', english: 'banana', thai: 'กล้วย' },
      { char: '葡萄', pinyin: 'pútao', english: 'grape', thai: 'องุ่น' },
      { char: '西瓜', pinyin: 'xīguā', english: 'watermelon', thai: 'แตงโม' },
      { char: '草莓', pinyin: 'cǎoméi', english: 'strawberry', thai: 'สตรอว์เบอร์รี่' },
      { char: '芒果', pinyin: 'mángguǒ', english: 'mango', thai: 'มะม่วง' },
      { char: '橙子', pinyin: 'chéngzi', english: 'orange', thai: 'ส้ม' },
      { char: '桃子', pinyin: 'táozi', english: 'peach', thai: 'ลูกท้อ' },
      { char: '菠萝', pinyin: 'bōluó', english: 'pineapple', thai: 'สับปะรด' },
      { char: '梨', pinyin: 'lí', english: 'pear', thai: 'ลูกแพร์' }
    ]
  },
  animals: {
    id: 'animals',
    name: 'ด่าน 2: สัตว์ (Animals) ☁️🐶',
    floorColors: ['#047857', '#059669', '#064e3b'],
    words: [
      { char: '狗', pinyin: 'gǒu', english: 'dog', thai: 'สุนัข' },
      { char: '猫', pinyin: 'māo', english: 'cat', thai: 'แมว' },
      { char: '兔子', pinyin: 'tùzi', english: 'rabbit', thai: 'กระต่าย' },
      { char: '牛', pinyin: 'niú', english: 'cow', thai: 'วัว' },
      { char: '鸡', pinyin: 'jī', english: 'chicken', thai: 'ไก่' },
      { char: '鱼', pinyin: 'yú', english: 'fish', thai: 'ปลา' },
      { char: '羊', pinyin: 'yáng', english: 'sheep', thai: 'แกะ' },
      { char: '鸟', pinyin: 'niǎo', english: 'bird', thai: 'นก' },
      { char: '鸭子', pinyin: 'yāzi', english: 'duck', thai: 'เป็ด' },
      { char: '马', pinyin: 'mǎ', english: 'horse', thai: 'ม้า' }
    ]
  },
  body: {
    id: 'body',
    name: 'ด่าน 3: อวัยวะ (Body Parts) 🌌👤',
    floorColors: ['#312e81', '#3730a3', '#1e1b4b'],
    words: [
      { char: '头', pinyin: 'tóu', english: 'head', thai: 'หัว' },
      { char: '眼睛', pinyin: 'yǎnjing', english: 'eyes', thai: 'ตา' },
      { char: '耳朵', pinyin: 'ěrduo', english: 'ears', thai: 'หู' },
      { char: '鼻子', pinyin: 'bízi', english: 'nose', thai: 'จมูก' },
      { char: '嘴', pinyin: 'zuǐ', english: 'mouth', thai: 'ปาก' },
      { char: '手', pinyin: 'shǒu', english: 'hand', thai: 'มือ' },
      { char: '脚', pinyin: 'jiǎo', english: 'foot', thai: 'เท้า' },
      { char: '头发', pinyin: 'tóufa', english: 'hair', thai: 'ผม' },
      { char: '肩膀', pinyin: 'jiānbǎng', english: 'shoulder', thai: 'ไหล่' },
      { char: '膝盖', pinyin: 'xīgài', english: 'knee', thai: 'เข่า' }
    ]
  },
  colors: {
    id: 'colors',
    name: 'ด่าน 4: สีสัน (Colors) ⚡🎨',
    floorColors: ['#6b21a8', '#7c3aed', '#4c1d95'],
    words: [
      { char: '红色', pinyin: 'hóngsè', english: 'red', thai: 'สีแดง' },
      { char: '蓝色', pinyin: 'lánsè', english: 'blue', thai: 'สีน้ำเงิน' },
      { char: '绿色', pinyin: 'lǜsè', english: 'green', thai: 'สีเขียว' },
      { char: '黄色', pinyin: 'huángsè', english: 'yellow', thai: 'สีเหลือง' },
      { char: '黑色', pinyin: 'hēisè', english: 'black', thai: 'สีดำ' },
      { char: '白色', pinyin: 'báisè', english: 'white', thai: 'สีขาว' },
      { char: '橙色', pinyin: 'chéngsè', english: 'orange', thai: 'สีส้ม' },
      { char: '紫色', pinyin: 'zǐsè', english: 'purple', thai: 'สีม่วง' },
      { char: '灰色', pinyin: 'huīsè', english: 'gray', thai: 'สีเทา' },
      { char: '棕色', pinyin: 'zōngsè', english: 'brown', thai: 'สีน้ำตาล' }
    ]
  },
  nongkao: {
    id: 'nongkao',
    name: 'ด่านของน้องเก้า 🌸🧸',
    floorColors: ['#be185d', '#db2777', '#831843'],
    words: [
      { char: '爱', pinyin: 'ài', english: 'love', thai: 'รัก' },
      { char: '泰国', pinyin: 'Tàiguó', english: 'Thailand', thai: 'ประเทศไทย' },
      { char: '水', pinyin: 'shuǐ', english: 'water', thai: 'น้ำ' },
      { char: '来', pinyin: 'lái', english: 'come', thai: 'มา' },
      { char: '二', pinyin: 'èr', english: 'two (2)', thai: 'สอง' },
      { char: '三', pinyin: 'sān', english: 'three (3)', thai: 'สาม' },
      { char: '六', pinyin: 'liù', english: 'six (6)', thai: 'หก' },
      { char: '九', pinyin: 'jiǔ', english: 'nine (9)', thai: 'เก้า' },
      { char: '妹', pinyin: 'mèi', english: 'younger sister', thai: 'น้องสาว' },
      { char: '跑', pinyin: 'pǎo', english: 'run', thai: 'วิ่ง' }
    ]
  },
  worldwide: {
    id: 'worldwide',
    name: 'Worldwide 🌍 (ประเทศ & บุคคล)',
    floorColors: ['#1e40af', '#2563eb', '#172554'],
    words: [
      { char: '泰国', pinyin: 'Tàiguó', english: 'Thailand', thai: 'ประเทศไทย' },
      { char: '中国', pinyin: 'Zhōngguó', english: 'China', thai: 'ประเทศจีน' },
      { char: '日本', pinyin: 'Rìběn', english: 'Japan', thai: 'ประเทศญี่ปุ่น' },
      { char: '韩国', pinyin: 'Hánguó', english: 'South Korea', thai: 'ประเทศเกาหลี' },
      { char: '英国', pinyin: 'Yīngguó', english: 'UK / England', thai: 'ประเทศอังกฤษ' },
      { char: '美国', pinyin: 'Měiguó', english: 'USA', thai: 'ประเทศอเมริกา' },
      { char: '加拿大', pinyin: 'Jiānádà', english: 'Canada', thai: 'ประเทศแคนาดา' },
      { char: '法国', pinyin: 'Fǎguó', english: 'France', thai: 'ประเทศฝรั่งเศส' },
      { char: '同学', pinyin: 'tóngxué', english: 'classmate', thai: 'เพื่อนร่วมชั้น' },
      { char: '朋友', pinyin: 'péngyou', english: 'friend', thai: 'เพื่อน' }
    ]
  },
  appliances: {
    id: 'appliances',
    name: 'เครื่องใช้ไฟฟ้า ⚡🔌',
    floorColors: ['#0e7490', '#0891b2', '#164e63'],
    words: [
      { char: '手机', pinyin: 'shǒujī', english: 'mobile phone', thai: 'โทรศัพท์มือถือ' },
      { char: '电脑', pinyin: 'diànnǎo', english: 'computer', thai: 'คอมพิวเตอร์' },
      { char: '电视', pinyin: 'diànshì', english: 'television / TV', thai: 'โทรทัศน์' },
      { char: '冰箱', pinyin: 'bīngxiāng', english: 'refrigerator', thai: 'ตู้เย็น' },
      { char: '风扇', pinyin: 'fēngshàn', english: 'fan', thai: 'พัดลม' },
      { char: '空调', pinyin: 'kōngtiáo', english: 'air conditioner', thai: 'เครื่องปรับอากาศ' },
      { char: '灯', pinyin: 'dēng', english: 'light / lamp', thai: 'โคมไฟ' },
      { char: '微波炉', pinyin: 'wēibōlú', english: 'microwave', thai: 'ไมโครเวฟ' },
      { char: '洗衣机', pinyin: 'xǐyījī', english: 'washing machine', thai: 'เครื่องซักผ้า' },
      { char: '电饭煲', pinyin: 'diànfànbāo', english: 'rice cooker', thai: 'หม้อหุงข้าว' }
    ]
  },
  dailylife: {
    id: 'dailylife',
    name: 'ชีวิตประจำวัน 🌅🏠',
    floorColors: ['#c2410c', '#ea580c', '#7c2d12'],
    words: [
      { char: '起床', pinyin: 'qǐchuáng', english: 'get up', thai: 'ตื่นนอน' },
      { char: '刷牙', pinyin: 'shuāyá', english: 'brush teeth', thai: 'แปรงฟัน' },
      { char: '洗澡', pinyin: 'xǐzǎo', english: 'take a shower', thai: 'อาบน้ำ' },
      { char: '睡觉', pinyin: 'shuìjiào', english: 'sleep', thai: 'นอน' },
      { char: '吃早饭', pinyin: 'chī zǎofàn', english: 'eat breakfast', thai: 'กินอาหารเช้า' },
      { char: '吃午饭', pinyin: 'chī wǔfàn', english: 'eat lunch', thai: 'กินอาหารกลางวัน' },
      { char: '吃晚饭', pinyin: 'chī wǎnfàn', english: 'eat dinner', thai: 'กินอาหารเย็น' },
      { char: '去学校', pinyin: 'qù xuéxiào', english: 'go to school', thai: 'ไปโรงเรียน' },
      { char: '回家', pinyin: 'huí jiā', english: 'go home', thai: 'กลับบ้าน' },
      { char: '做作业', pinyin: 'zuò zuòyè', english: 'do homework', thai: 'ทำการบ้าน' }
    ]
  },
  hobbies: {
    id: 'hobbies',
    name: 'งานอดิเรก 🎨⚽🎮',
    floorColors: ['#7e22ce', '#9333ea', '#581c87'],
    words: [
      { char: '看书', pinyin: 'kànshū', english: 'read a book', thai: 'อ่านหนังสือ' },
      { char: '看电视', pinyin: 'kàn diànshì', english: 'watch TV', thai: 'ดูทีวี' },
      { char: '画画', pinyin: 'huàhuà', english: 'draw / paint', thai: 'วาดรูป' },
      { char: '游泳', pinyin: 'yóuyǒng', english: 'swim', thai: 'ว่ายน้ำ' },
      { char: '踢足球', pinyin: 'tī zúqiú', english: 'play football', thai: 'เตะฟุตบอล' },
      { char: '听音乐', pinyin: 'tīng yīnyuè', english: 'listen to music', thai: 'ฟังเพลง' },
      { char: '玩游戏', pinyin: 'wán yóuxì', english: 'play games', thai: 'เล่นเกม' },
      { char: '唱歌', pinyin: 'chànggē', english: 'sing', thai: 'ร้องเพลง' },
      { char: '跳舞', pinyin: 'tiàowǔ', english: 'dance', thai: 'เต้นรำ' },
      { char: '跑步', pinyin: 'pǎobù', english: 'run', thai: 'วิ่ง' }
    ]
  },
  hsk1_3: {
    id: 'hsk1_3',
    name: 'HSK 1 - บท 3 📜👨‍🏫🇨🇳',
    floorColors: ['#b91c1c', '#dc2626', '#7f1d1d'],
    words: [
      { char: '叫', pinyin: 'jiào', english: 'to be called / call', thai: 'ชื่อว่า / เรียก' },
      { char: '什么', pinyin: 'shénme', english: 'what', thai: 'อะไร' },
      { char: '名字', pinyin: 'míngzi', english: 'name', thai: 'ชื่อ' },
      { char: '我', pinyin: 'wǒ', english: 'I / me', thai: 'ฉัน' },
      { char: '是', pinyin: 'shì', english: 'am / is / are', thai: 'คือ / เป็น' },
      { char: '老师', pinyin: 'lǎoshī', english: 'teacher', thai: 'คุณครู' },
      { char: '吗', pinyin: 'ma', english: 'question particle', thai: 'ไหม / หรือไม่' },
      { char: '学生', pinyin: 'xuésheng', english: 'student', thai: 'นักเรียน' },
      { char: '人', pinyin: 'rén', english: 'person / people', thai: 'คน' },
      { char: '中国', pinyin: 'Zhōngguó', english: 'China', thai: 'ประเทศจีน' }
    ]
  },
  special_objects: {
    id: 'special_objects',
    name: 'คำศัพท์เฉพาะกิจ 📱🪑💻',
    floorColors: ['#0369a1', '#0284c7', '#075985'],
    words: [
      { char: '门', pinyin: 'mén', english: 'door', thai: 'ประตู' },
      { char: '窗户', pinyin: 'chuānghu', english: 'window', thai: 'หน้าต่าง' },
      { char: '灯', pinyin: 'dēng', english: 'light', thai: 'ไฟ' },
      { char: '枕头', pinyin: 'zhěntou', english: 'pillow', thai: 'หมอน' },
      { char: '床', pinyin: 'chuáng', english: 'bed', thai: 'เตียง' },
      { char: '被子', pinyin: 'bèizi', english: 'blanket', thai: 'ผ้าห่ม' },
      { char: '水杯', pinyin: 'shuǐbēi', english: 'water cup', thai: 'แก้วน้ำ' },
      { char: '桌子', pinyin: 'zhuōzi', english: 'table', thai: 'โต๊ะ' },
      { char: '椅子', pinyin: 'yǐzi', english: 'chair', thai: 'เก้าอี้' },
      { char: '手机', pinyin: 'shǒujī', english: 'mobile phone', thai: 'โทรศัพท์มือถือ' },
      { char: '电脑', pinyin: 'diànnǎo', english: 'computer', thai: 'คอมพิวเตอร์' },
      { char: '电视', pinyin: 'diànshì', english: 'TV', thai: 'ทีวี' },
      { char: '玩具', pinyin: 'wánjù', english: 'toy', thai: 'ของเล่น' },
      { char: '冰箱', pinyin: 'bīngxiāng', english: 'refrigerator', thai: 'ตู้เย็น' },
      { char: '微波炉', pinyin: 'wēibōlú', english: 'microwave', thai: 'ไมโครเวฟ' },
      { char: '盘子', pinyin: 'pánzi', english: 'plate', thai: 'จาน' },
      { char: '碗', pinyin: 'wǎn', english: 'bowl', thai: 'ชาม' },
      { char: '勺子', pinyin: 'sháozi', english: 'spoon', thai: 'ช้อน' },
      { char: '叉子', pinyin: 'chāzi', english: 'fork', thai: 'ส้อม' },
      { char: '筷子', pinyin: 'kuàizi', english: 'chopsticks', thai: 'ตะเกียบ' },
      { char: '杯子', pinyin: 'bēizi', english: 'cup', thai: 'ถ้วย / แก้ว' }
    ]
  },
  hotel_inn: {
    id: 'hotel_inn',
    name: 'โรงแรม & โรงเตี๊ยม 🏨🛎️',
    floorColors: ['#b45309', '#d97706', '#78350f'],
    words: [
      { char: '酒店', pinyin: 'jiǔdiàn', english: 'Hotel', thai: 'โรงแรม / โรงเตี๊ยม' },
      { char: '入住', pinyin: 'rùzhù', english: 'Check in / Check into a hotel', thai: 'เช็คอิน / เข้าพักโรงแรม' },
      { char: '预订', pinyin: 'yùdìng', english: 'Reservation / Book', thai: 'การจอง / จองล่วงหน้า' },
      { char: '护照', pinyin: 'hùzhào', english: 'Passport', thai: 'หนังสือเดินทาง / พาสปอร์ต' },
      { char: '房间', pinyin: 'fángjiān', english: 'Room', thai: 'ห้องพัก / ห้อง' },
      { char: '房卡', pinyin: 'fángkǎ', english: 'Room key card', thai: 'คีย์การ์ดห้องพัก' }
    ]
  }
};

export class ArenaEngine {
  constructor(canvas, ctx, onExit) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.onExit = onExit;

    this.V_WIDTH = 1200;
    this.V_HEIGHT = 800;

    this.running = false;
    this.paused = false;
    this.animationFrameId = null;
    this.lastTime = 0;

    // Match Configuration
    this.config = {
      playerCount: 2, // 1 to 4
      botCount: 1,    // AI bots filling slots
      duration: 60,   // seconds
      topic: 'hsk1_4',
      botDifficulty: 'hard', // 'very_easy' | 'easy' | 'medium' | 'hard'
      gameMode: 'battle' // 'battle' | 'adventure'
    };

    // Game State
    this.matchTime = 60;
    this.gameState = 'LOBBY'; // 'COUNTDOWN', 'PLAYING', 'GAME_OVER'
    this.countdownTimer = 3.5;

    // Adventure Mode Gauntlet State
    this.isAdventure = false;
    this.adventureSubStage = 1;
    this.adventureTotalStages = 0;
    this.adventureDeck = [];
    this.adventureTargetWord = null;
    this.adventureMistakes = 0;
    this.adventureResetting = false;
    this.screenShake = 0;

    // Active Topic & Vocab Pool for current match
    this.currentTopicData = ARENA_TOPICS.hsk1_4;
    this.vocabPool = [...ARENA_TOPICS.hsk1_4.words];

    // Current Target Chinese Word
    this.currentTarget = null;
    this.targetTimer = 0;

    // Arena geometry (Pillar & Obstacle positions matching the symmetrical video arena)
    this.walls = [];
    this.pads = [];
    this.players = [];
    this.particles = [];
    this.floatingTexts = [];

    // Player definitions (Red, Blue, Yellow, Green)
    this.playerDefs = [
      { id: 0, name: 'P1 RED', color: '#ef4444', lightColor: '#fca5a5', darkColor: '#991b1b', baseCorner: 'BL' },
      { id: 1, name: 'P2 BLUE', color: '#3b82f6', lightColor: '#93c5fd', darkColor: '#1e40af', baseCorner: 'TR' },
      { id: 2, name: 'P3 YELLOW', color: '#eab308', lightColor: '#fef08a', darkColor: '#854d0e', baseCorner: 'TL' },
      { id: 3, name: 'P4 GREEN', color: '#22c55e', lightColor: '#86efac', darkColor: '#166534', baseCorner: 'BR' }
    ];

    // Audio SFX
    this.sfx = {
      capture: new Audio('assets/claybound/coin-pickup-d4kv-Dau.wav'),
      goldenLock: new Audio('assets/claybound/shape-match-CngoM9A8.wav'),
      fever: new Audio('assets/claybound/flower-victory-4bT9WopA.wav'),
      bump: new Audio('assets/claybound/enemy-head-impact-BL9Yhh1v.wav'),
      finish: new Audio('assets/claybound/finish-bell-1vPK9VCS.wav'),
      click: new Audio('assets/claybound/switch-press-BRz_CuqN.wav')
    };

    // Energetic arena BGM
    this.arenaBgm = new Audio('assets/claybound/marble-quarry-variation-z48duQ99.mp3');
    this.arenaBgm.loop = true;
    this.arenaBgm.volume = 0.5;

    // Input tracker for up to 4 players
    this.inputState = [
      { x: 0, y: 0, action: false }, // P1
      { x: 0, y: 0, action: false }, // P2
      { x: 0, y: 0, action: false }, // P3
      { x: 0, y: 0, action: false }  // P4
    ];

    // Active touch / pointer tracking for virtual joysticks
    this.activePointers = new Map();
    this.touchPointers = this.activePointers; // backwards-compatible alias

    // Bind event handlers
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handlePointerCancel = this.handlePointerCancel.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
  }

  playSFX(name, vol = 0.7) {
    if (this.sfx && this.sfx[name]) {
      const a = this.sfx[name].cloneNode();
      a.volume = vol;
      a.play().catch(() => {});
    }
  }

  setupEventListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    // Primary: Pointer Events with Pointer Capture (Standard across iPadOS / iOS Safari 13+ & modern browsers)
    if (window.PointerEvent) {
      this.canvas.addEventListener('pointerdown', this.handlePointerDown, { passive: false });
      this.canvas.addEventListener('pointermove', this.handlePointerMove, { passive: false });
      this.canvas.addEventListener('pointerup', this.handlePointerUp, { passive: false });
      this.canvas.addEventListener('pointercancel', this.handlePointerCancel, { passive: false });
    } else {
      // Fallback: Legacy Touch Events
      this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
      this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
      this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
      this.canvas.addEventListener('touchcancel', this.handleTouchEnd, { passive: false });
    }
  }

  removeEventListeners() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);

    if (window.PointerEvent) {
      this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
      this.canvas.removeEventListener('pointermove', this.handlePointerMove);
      this.canvas.removeEventListener('pointerup', this.handlePointerUp);
      this.canvas.removeEventListener('pointercancel', this.handlePointerCancel);
    } else {
      this.canvas.removeEventListener('touchstart', this.handleTouchStart);
      this.canvas.removeEventListener('touchmove', this.handleTouchMove);
      this.canvas.removeEventListener('touchend', this.handleTouchEnd);
      this.canvas.removeEventListener('touchcancel', this.handleTouchEnd);
    }

    // Reset all pointers and inputs
    this.activePointers.clear();
    for (let i = 0; i < 4; i++) {
      if (this.inputState[i]) {
        this.inputState[i].x = 0;
        this.inputState[i].y = 0;
        this.inputState[i].action = false;
      }
    }
  }

  handleKeyDown(e) {
    const key = e.key.toLowerCase();

    // Player 1 (WASD + Space)
    if (key === 'w') this.inputState[0].y = -1;
    if (key === 's') this.inputState[0].y = 1;
    if (key === 'a') this.inputState[0].x = -1;
    if (key === 'd') this.inputState[0].x = 1;
    if (key === ' ' || key === 'spacebar') {
      this.inputState[0].action = true;
      this.triggerDragonFever(0);
    }

    // Player 2 (Arrow Keys + Enter)
    if (key === 'arrowup') this.inputState[1].y = -1;
    if (key === 'arrowdown') this.inputState[1].y = 1;
    if (key === 'arrowleft') this.inputState[1].x = -1;
    if (key === 'arrowright') this.inputState[1].x = 1;
    if (key === 'enter') {
      this.inputState[1].action = true;
      this.triggerDragonFever(1);
    }

    // Player 3 (IJKL + U)
    if (key === 'i') this.inputState[2].y = -1;
    if (key === 'k') this.inputState[2].y = 1;
    if (key === 'j') this.inputState[2].x = -1;
    if (key === 'l') this.inputState[2].x = 1;
    if (key === 'u') {
      this.inputState[2].action = true;
      this.triggerDragonFever(2);
    }

    // Player 4 (Numpad 8, 5/2, 4, 6 + 0)
    if (key === '8') this.inputState[3].y = -1;
    if (key === '5' || key === '2') this.inputState[3].y = 1;
    if (key === '4') this.inputState[3].x = -1;
    if (key === '6') this.inputState[3].x = 1;
    if (key === '0' || key === '+') {
      this.inputState[3].action = true;
      this.triggerDragonFever(3);
    }

    // ESC to exit or pause
    if (e.key === 'Escape') {
      this.exitArena();
    }
  }

  handleKeyUp(e) {
    const key = e.key.toLowerCase();
    // P1
    if (key === 'w' && this.inputState[0].y < 0) this.inputState[0].y = 0;
    if (key === 's' && this.inputState[0].y > 0) this.inputState[0].y = 0;
    if (key === 'a' && this.inputState[0].x < 0) this.inputState[0].x = 0;
    if (key === 'd' && this.inputState[0].x > 0) this.inputState[0].x = 0;
    if (key === ' ' || key === 'spacebar') this.inputState[0].action = false;

    // P2
    if (key === 'arrowup' && this.inputState[1].y < 0) this.inputState[1].y = 0;
    if (key === 'arrowdown' && this.inputState[1].y > 0) this.inputState[1].y = 0;
    if (key === 'arrowleft' && this.inputState[1].x < 0) this.inputState[1].x = 0;
    if (key === 'arrowright' && this.inputState[1].x > 0) this.inputState[1].x = 0;
    if (key === 'enter') this.inputState[1].action = false;

    // P3
    if (key === 'i' && this.inputState[2].y < 0) this.inputState[2].y = 0;
    if (key === 'k' && this.inputState[2].y > 0) this.inputState[2].y = 0;
    if (key === 'j' && this.inputState[2].x < 0) this.inputState[2].x = 0;
    if (key === 'l' && this.inputState[2].x > 0) this.inputState[2].x = 0;
    if (key === 'u') this.inputState[2].action = false;

    // P4
    if (key === '8' && this.inputState[3].y < 0) this.inputState[3].y = 0;
    if ((key === '5' || key === '2') && this.inputState[3].y > 0) this.inputState[3].y = 0;
    if (key === '4' && this.inputState[3].x < 0) this.inputState[3].x = 0;
    if (key === '6' && this.inputState[3].x > 0) this.inputState[3].x = 0;
    if (key === '0' || key === '+') this.inputState[3].action = false;
  }

  // --- TOUCH & POINTER JOYSTICK HANDLING ---
  getCornerForPos(x, y) {
    // 1 Player or Adventure Mode: The entire screen controls Player 1
    if (this.isAdventure || this.config.playerCount === 1) {
      return 0; // P1
    }

    // 2 Players: Left half = P1, Right half = P2
    if (this.config.playerCount === 2) {
      return (x < this.V_WIDTH / 2) ? 0 : 1;
    }

    // 3 or 4 Players: 4 corners (BL: P1, TR: P2, TL: P3, BR: P4)
    const isLeft = x < this.V_WIDTH / 2;
    const isTop = y < this.V_HEIGHT / 2;
    if (isLeft && !isTop) return 0;  // Bottom-Left: P1 (Red)
    if (!isLeft && isTop) return 1;  // Top-Right: P2 (Blue)
    if (isLeft && isTop) return 2;   // Top-Left: P3 (Yellow)
    if (!isLeft && !isTop) return 3; // Bottom-Right: P4 (Green)
    return 0;
  }

  getPointerCanvasCoord(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.V_WIDTH / rect.width;
    const scaleY = this.V_HEIGHT / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  handlePointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.cancelable) e.preventDefault();

    // Lock pointer capture to this canvas so sliding fast or outside edge never drops tracking
    try {
      if (e.target && e.target.setPointerCapture) {
        e.target.setPointerCapture(e.pointerId);
      }
    } catch (_) {}

    const pos = this.getPointerCanvasCoord(e);
    const pid = this.getCornerForPos(pos.x, pos.y);

    if (pid >= 0 && pid < this.config.playerCount && this.players[pid] && !this.players[pid].isBot) {
      this.activePointers.set(e.pointerId, {
        pid,
        startX: pos.x,
        startY: pos.y,
        currX: pos.x,
        currY: pos.y,
        startTime: performance.now()
      });
      this.updateTouchInput(pid, 0, 0);
    }
  }

  handlePointerMove(e) {
    if (e.cancelable) e.preventDefault();
    const pt = this.activePointers.get(e.pointerId);
    if (!pt) return;

    const pos = this.getPointerCanvasCoord(e);
    pt.currX = pos.x;
    pt.currY = pos.y;

    const dx = pt.currX - pt.startX;
    const dy = pt.currY - pt.startY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = 55;
    const deadZone = 6;

    if (dist > deadZone) {
      // Dynamic floating joystick follow: pull center along if finger drags far
      if (dist > maxRadius * 1.5) {
        const angle = Math.atan2(dy, dx);
        pt.startX = pt.currX - Math.cos(angle) * (maxRadius * 1.5);
        pt.startY = pt.currY - Math.sin(angle) * (maxRadius * 1.5);
      }

      const curDx = pt.currX - pt.startX;
      const curDy = pt.currY - pt.startY;
      const curDist = Math.hypot(curDx, curDy);
      const factor = Math.min(curDist, maxRadius) / maxRadius;
      const nx = (curDx / (curDist || 1)) * factor;
      const ny = (curDy / (curDist || 1)) * factor;
      this.updateTouchInput(pt.pid, nx, ny);
    } else {
      this.updateTouchInput(pt.pid, 0, 0);
    }
  }

  handlePointerUp(e) {
    if (e.cancelable) e.preventDefault();
    const pt = this.activePointers.get(e.pointerId);
    if (pt) {
      const dist = Math.hypot(pt.currX - pt.startX, pt.currY - pt.startY);
      const duration = performance.now() - pt.startTime;
      // Quick tap without significant movement triggers Dragon Rush
      if (dist < 18 && duration < 350) {
        this.triggerDragonFever(pt.pid);
      }
      this.updateTouchInput(pt.pid, 0, 0);
      this.activePointers.delete(e.pointerId);
    }

    try {
      if (e.target && e.target.hasPointerCapture && e.target.hasPointerCapture(e.pointerId)) {
        e.target.releasePointerCapture(e.pointerId);
      }
    } catch (_) {}
  }

  handlePointerCancel(e) {
    this.handlePointerUp(e);
  }

  getTouchCanvasCoord(touch) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.V_WIDTH / rect.width;
    const scaleY = this.V_HEIGHT / rect.height;
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    };
  }

  handleTouchStart(e) {
    if (e.cancelable) e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const pos = this.getTouchCanvasCoord(touch);
      const pid = this.getCornerForPos(pos.x, pos.y);
      if (pid >= 0 && pid < this.config.playerCount && this.players[pid] && !this.players[pid].isBot) {
        this.activePointers.set(touch.identifier, {
          pid,
          startX: pos.x,
          startY: pos.y,
          currX: pos.x,
          currY: pos.y,
          startTime: performance.now()
        });
        this.updateTouchInput(pid, 0, 0);
      }
    }
  }

  handleTouchMove(e) {
    if (e.cancelable) e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const pt = this.activePointers.get(touch.identifier);
      if (pt) {
        const pos = this.getTouchCanvasCoord(touch);
        pt.currX = pos.x;
        pt.currY = pos.y;
        const dx = pt.currX - pt.startX;
        const dy = pt.currY - pt.startY;
        const dist = Math.hypot(dx, dy);
        const maxRadius = 55;
        const deadZone = 6;
        if (dist > deadZone) {
          if (dist > maxRadius * 1.5) {
            const angle = Math.atan2(dy, dx);
            pt.startX = pt.currX - Math.cos(angle) * (maxRadius * 1.5);
            pt.startY = pt.currY - Math.sin(angle) * (maxRadius * 1.5);
          }
          const curDx = pt.currX - pt.startX;
          const curDy = pt.currY - pt.startY;
          const curDist = Math.hypot(curDx, curDy);
          const factor = Math.min(curDist, maxRadius) / maxRadius;
          this.updateTouchInput(pt.pid, (curDx / (curDist || 1)) * factor, (curDy / (curDist || 1)) * factor);
        } else {
          this.updateTouchInput(pt.pid, 0, 0);
        }
      }
    }
  }

  handleTouchEnd(e) {
    if (e.cancelable) e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const pt = this.activePointers.get(touch.identifier);
      if (pt) {
        const dist = Math.hypot(pt.currX - pt.startX, pt.currY - pt.startY);
        const duration = performance.now() - pt.startTime;
        if (dist < 18 && duration < 350) {
          this.triggerDragonFever(pt.pid);
        }
        this.updateTouchInput(pt.pid, 0, 0);
        this.activePointers.delete(touch.identifier);
      }
    }
  }

  updateTouchInput(pid, x, y) {
    if (this.inputState[pid]) {
      this.inputState[pid].x = x;
      this.inputState[pid].y = y;
    }
  }

  triggerDragonFever(pid) {
    const pl = this.players[pid];
    if (pl && pl.energy >= 5 && pl.feverTimer <= 0) {
      pl.energy = 0;
      pl.feverTimer = 5.5; // 5.5s fever speed and super knockback
      this.playSFX('fever', 0.85);

      // Burst particles
      for (let i = 0; i < 30; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 120 + Math.random() * 220;
        this.particles.push({
          x: pl.x,
          y: pl.y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          color: pl.color,
          size: 6 + Math.random() * 6,
          life: 0.6,
          maxLife: 0.6
        });
      }

      this.floatingTexts.push({
        x: pl.x,
        y: pl.y - 30,
        text: '⚡ DRAGON RUSH! ⚡',
        color: pl.color,
        life: 1.2
      });
    }
  }

  // --- INITIALIZATION & ARENA GENERATION ---
  initMatch(settings = {}) {
    this.config.gameMode = settings.gameMode || this.config.gameMode || 'battle';
    this.isAdventure = this.config.gameMode === 'adventure';

    if (this.isAdventure) {
      this.config.playerCount = 1;
      this.config.botCount = 0;
      this.config.duration = 'endless';
      this.config.topic = settings.topic || 'hsk1_4';
      this.isEndless = true;
      this.matchTime = 0;
      this.adventureSubStage = 1;
      this.adventureMistakes = 0;
      this.adventureResetting = false;
      this.screenShake = 0;
    } else {
      this.config.playerCount = settings.playerCount || 2;
      this.config.botCount = settings.botCount !== undefined ? settings.botCount : (4 - this.config.playerCount);
      this.config.duration = settings.duration !== undefined ? settings.duration : 60;
      this.config.topic = settings.topic || 'hsk1_4';
      this.config.botDifficulty = settings.botDifficulty || this.config.botDifficulty || 'hard';

      this.isEndless = this.config.duration === 'endless' || this.config.duration === 0;
      this.matchTime = this.isEndless ? 0 : this.config.duration;
    }

    this.countdownTimer = 3.5;
    this.gameState = 'COUNTDOWN';

    this.particles = [];
    this.floatingTexts = [];

    // Build symmetric walled layout
    this.buildArenaLayout();

    // Spawn Players & assign Bots
    this.buildPlayers();

    if (this.isAdventure) {
      this.setupAdventureRun();
    } else {
      // Build non-repeating question queue from all pads
      this.unaskedPadIds = this.pads.map(p => p.id).sort(() => Math.random() - 0.5);
      this.totalQuestions = this.pads.length;
      this.completedQuestions = 0;

      // Pick initial vocabulary target
      this.pickNextVocabTarget();
    }

    // Start BGM
    try {
      this.arenaBgm.currentTime = 0;
      this.arenaBgm.play().catch(() => {});
    } catch (e) {}
  }

  buildArenaLayout() {
    const W = this.V_WIDTH;
    const H = this.V_HEIGHT;

    this.walls = [];
    this.pads = [];

    // 1. Boundary walls with wooden arena rim
    const wallThick = 40;
    this.walls.push({ x: 0, y: 0, w: W, h: wallThick }); // Top
    this.walls.push({ x: 0, y: H - wallThick, w: W, h: wallThick }); // Bottom
    this.walls.push({ x: 0, y: 0, w: wallThick, h: H }); // Left
    this.walls.push({ x: W - wallThick, y: 0, w: wallThick, h: H }); // Right

    // 2. Corner Base Inset walls (creating the step-corner bases like in screenshot)
    const cornerSize = 140;
    // Top-Left corner notch
    this.walls.push({ x: cornerSize, y: wallThick, w: 20, h: 60 });
    this.walls.push({ x: wallThick, y: cornerSize, w: 60, h: 20 });

    // Top-Right corner notch
    this.walls.push({ x: W - cornerSize - 20, y: wallThick, w: 20, h: 60 });
    this.walls.push({ x: W - cornerSize, y: cornerSize, w: 60, h: 20 });

    // Bottom-Left corner notch
    this.walls.push({ x: cornerSize, y: H - cornerSize, w: 20, h: 60 });
    this.walls.push({ x: wallThick, y: H - cornerSize - 20, w: 60, h: 20 });

    // Bottom-Right corner notch
    this.walls.push({ x: W - cornerSize - 20, y: H - cornerSize, w: 20, h: 60 });
    this.walls.push({ x: W - cornerSize, y: H - cornerSize - 20, w: 60, h: 20 });

    // 3. Central Obstacle Block (Center Pit / Altar) - only in Battle mode!
    if (!this.isAdventure) {
      this.walls.push({ x: W / 2 - 40, y: H / 2 - 40, w: 80, h: 80, isAltar: true });
    }

    // 4. Symmetrical Stone Pillars / Barriers
    // In adventure mode, omit inner ring pillars so the center altar pad has open clearance
    const pillarConfig = this.isAdventure ? [
      // Mid-field symmetrical pillars
      { x: W / 2 - 270, y: H / 2 - 140, w: 65, h: 65 },
      { x: W / 2 + 205, y: H / 2 - 140, w: 65, h: 65 },
      { x: W / 2 - 270, y: H / 2 + 75,  w: 65, h: 65 },
      { x: W / 2 + 205, y: H / 2 + 75,  w: 65, h: 65 },

      // Outer flank barriers (horizontal slats)
      { x: W / 2 - 380, y: H / 2 - 15, w: 70, h: 30 },
      { x: W / 2 + 310, y: H / 2 - 15, w: 70, h: 30 },
      { x: W / 2 - 380, y: H / 2 - 150, w: 60, h: 30 },
      { x: W / 2 + 320, y: H / 2 - 150, w: 60, h: 30 },
      { x: W / 2 - 380, y: H / 2 + 120, w: 60, h: 30 },
      { x: W / 2 + 320, y: H / 2 + 120, w: 60, h: 30 }
    ] : [
      // Inner ring surrounding center
      { x: W / 2 - 130, y: H / 2 - 35, w: 55, h: 70 },
      { x: W / 2 + 75,  y: H / 2 - 35, w: 55, h: 70 },
      { x: W / 2 - 35,  y: H / 2 - 130, w: 70, h: 55 },
      { x: W / 2 - 35,  y: H / 2 + 75,  w: 70, h: 55 },

      // Mid-field symmetrical pillars
      { x: W / 2 - 270, y: H / 2 - 140, w: 65, h: 65 },
      { x: W / 2 + 205, y: H / 2 - 140, w: 65, h: 65 },
      { x: W / 2 - 270, y: H / 2 + 75,  w: 65, h: 65 },
      { x: W / 2 + 205, y: H / 2 + 75,  w: 65, h: 65 },

      // Outer flank barriers (horizontal slats)
      { x: W / 2 - 380, y: H / 2 - 15, w: 70, h: 30 },
      { x: W / 2 + 310, y: H / 2 - 15, w: 70, h: 30 },
      { x: W / 2 - 380, y: H / 2 - 150, w: 60, h: 30 },
      { x: W / 2 + 320, y: H / 2 - 150, w: 60, h: 30 },
      { x: W / 2 - 380, y: H / 2 + 120, w: 60, h: 30 },
      { x: W / 2 + 320, y: H / 2 + 120, w: 60, h: 30 }
    ];

    for (const p of pillarConfig) {
      this.walls.push({ x: p.x, y: p.y, w: p.w, h: p.h, isPillar: true });
    }

    const topicKey = this.config.topic || 'hsk1_4';
    const topicData = ARENA_TOPICS[topicKey] || ARENA_TOPICS.hsk1_4;
    this.currentTopicData = topicData;

    // 5. Symmetric Pad Grid
    if (this.isAdventure) {
      // ADVENTURE MODE: Exactly 5 Symmetrical Option Pads (4 corners + 1 center altar)
      const padPositions = [
        { x: 280, y: 220 }, // Top-Left
        { x: 920, y: 220 }, // Top-Right
        { x: 280, y: 580 }, // Bottom-Left
        { x: 920, y: 580 }, // Bottom-Right
        { x: 600, y: 400 }  // Center Golden Altar Pad
      ];

      this.pads = padPositions.map((pos, idx) => ({
        id: idx,
        x: pos.x,
        y: pos.y,
        radius: 48,
        owner: -1,
        vocab: null,
        isTarget: false,
        disabledTimer: 0,
        pulseAnim: Math.random() * Math.PI * 2,
        flipAnim: 0,
        isSolved: false
      }));
    } else {
      // BATTLE MODE: 8, 10 or 11 Symmetrical Color Pads
      let padPositions = [];
      if (topicData.words.length === 8) {
        padPositions = [
          { x: 260, y: 170 }, // TL Outer
          { x: 940, y: 170 }, // TR Outer
          { x: 260, y: 630 }, // BL Outer
          { x: 940, y: 630 }, // BR Outer
          { x: 600, y: 175 }, // Top Center
          { x: 600, y: 625 }, // Bottom Center
          { x: 420, y: 400 }, // Center Left
          { x: 780, y: 400 }  // Center Right
        ];
      } else {
        padPositions = [
          // 4 Outer Corner Plazas
          { x: 260, y: 170 }, // TL Outer
          { x: 940, y: 170 }, // TR Outer
          { x: 260, y: 630 }, // BL Outer
          { x: 940, y: 630 }, // BR Outer

          // 2 Far Flank Corridors
          { x: 140, y: 400 }, // Far Left
          { x: 1060, y: 400 }, // Far Right

          // 2 Center Vertical Plazas
          { x: 600, y: 175 }, // Top Center
          { x: 600, y: 625 }, // Bottom Center

          // 2 Center Inner Plazas
          { x: 420, y: 400 }, // Center Left
          { x: 780, y: 400 }  // Center Right
        ];

        if (topicData.words.length === 11) {
          padPositions.push({ x: 600, y: 400 });
        }
      }

      const numPads = padPositions.length;
      let selectedVocab = [];
      if (topicData.words.length >= numPads) {
        const shuffledPool = [...topicData.words].sort(() => Math.random() - 0.5);
        selectedVocab = shuffledPool.slice(0, numPads);
      } else {
        while (selectedVocab.length < numPads) {
          selectedVocab = selectedVocab.concat([...topicData.words].sort(() => Math.random() - 0.5));
        }
        selectedVocab = selectedVocab.slice(0, numPads);
      }
      this.vocabPool = selectedVocab;

      const shuffledVocab = [...this.vocabPool].sort(() => Math.random() - 0.5);

      this.pads = padPositions.map((pos, idx) => {
        const vocabItem = shuffledVocab[idx];
        return {
          id: idx,
          x: pos.x,
          y: pos.y,
          radius: 44,
          owner: -1,
          vocab: vocabItem,
          disabledTimer: 0,
          pulseAnim: Math.random() * Math.PI * 2,
          flipAnim: 0,
          isSolved: false
        };
      });
    }
  }

  // --- ADVENTURE MODE GAUNTLET ENGINE ---
  setupAdventureRun() {
    const topicWords = [...this.currentTopicData.words];
    // Shuffle all words for this adventure run so questions appear in random order
    this.adventureDeck = [...topicWords].sort(() => Math.random() - 0.5);
    this.adventureTotalStages = this.adventureDeck.length;
    this.adventureSubStage = 1;
    this.setupAdventureSubStage();
  }

  setupAdventureSubStage() {
    if (this.adventureSubStage > this.adventureTotalStages) {
      this.handleAdventureVictory();
      return;
    }

    const targetWord = this.adventureDeck[this.adventureSubStage - 1];
    this.adventureTargetWord = targetWord;

    // Pick 4 distractors from current topic (or other topics if needed)
    const topicWords = this.currentTopicData.words;
    let distractorPool = topicWords.filter(w => w.char !== targetWord.char);
    distractorPool = [...distractorPool].sort(() => Math.random() - 0.5);
    let chosenDistractors = distractorPool.slice(0, 4);

    if (chosenDistractors.length < 4) {
      for (const tKey in ARENA_TOPICS) {
        if (chosenDistractors.length >= 4) break;
        const extraWords = ARENA_TOPICS[tKey].words.filter(w => w.char !== targetWord.char && !chosenDistractors.some(d => d.char === w.char));
        chosenDistractors = chosenDistractors.concat(extraWords.slice(0, 4 - chosenDistractors.length));
      }
    }

    // Combine 1 target + 4 distractors and shuffle onto the 5 pads
    const roundOptions = [targetWord, ...chosenDistractors].sort(() => Math.random() - 0.5);

    for (let i = 0; i < 5; i++) {
      const pad = this.pads[i];
      if (!pad) continue;
      const word = roundOptions[i];
      pad.vocab = word;
      pad.isTarget = (word.char === targetWord.char);
      pad.owner = -1;
      pad.disabledTimer = 0;
      pad.isSolved = false;
      pad.flipAnim = 0.8;
    }

    this.currentTarget = {
      char: targetWord.char,
      pinyin: targetWord.pinyin,
      english: targetWord.english,
      thai: targetWord.thai,
      targetPadId: this.pads.findIndex(p => p.isTarget),
      questionIndex: this.adventureSubStage,
      total: this.adventureTotalStages
    };

    if (this.players[0]) {
      this.players[0].standingOnPadId = null;
    }
  }

  handleAdventureCorrect(pad, pl) {
    pad.isSolved = true;
    pad.owner = pl.id;
    pad.flipAnim = 1.0;
    pl.score += 10;

    pl.emotion = 'happy';
    pl.emotionTimer = 1.4;
    pl.squashX = 0.65;
    pl.squashY = 1.5;
    pl.bounceVz = 240;

    this.playSFX('goldenLock', 1.0);

    // Burst celebration particles
    for (let k = 0; k < 30; k++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 90 + Math.random() * 180;
      this.particles.push({
        x: pad.x,
        y: pad.y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        color: Math.random() < 0.5 ? '#fbbf24' : '#10b981',
        size: 5 + Math.random() * 5,
        life: 0.7,
        maxLife: 0.7
      });
    }

    profileManager.recordLearnedVocab(pad.vocab.char);

    this.floatingTexts.push({
      x: pad.x,
      y: pad.y - 25,
      text: `✨ ถูกต้อง! (${pad.vocab.char} - ${pad.vocab.pinyin}) ผ่านด่าน ${this.adventureSubStage}/${this.adventureTotalStages}`,
      color: '#10b981',
      life: 1.5
    });

    if (this.adventureSubStage >= this.adventureTotalStages) {
      // Victory!
      setTimeout(() => {
        if (!this.running) return;
        this.handleAdventureVictory();
      }, 600);
    } else {
      this.adventureSubStage++;
      setTimeout(() => {
        if (!this.running) return;
        this.setupAdventureSubStage();
      }, 500);
    }
  }

  handleAdventureWrong(pad, pl) {
    this.adventureMistakes++;
    this.adventureResetting = true;

    pl.emotion = 'sad';
    pl.emotionTimer = 1.6;
    pl.squashX = 1.5;
    pl.squashY = 0.55;

    this.playSFX('bump', 0.9);
    this.screenShake = 0.45;

    pad.disabledTimer = 2.0;

    // Red warning burst particles
    for (let k = 0; k < 25; k++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 60 + Math.random() * 140;
      this.particles.push({
        x: pad.x,
        y: pad.y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        color: '#ef4444',
        size: 5 + Math.random() * 5,
        life: 0.6,
        maxLife: 0.6
      });
    }

    this.floatingTexts.push({
      x: pl.x,
      y: pl.y - 35,
      text: `❌ ผิดคำตอบ! (${pad.vocab.char} = ${pad.vocab.english || pad.vocab.thai})`,
      color: '#ef4444',
      life: 1.6
    });

    this.floatingTexts.push({
      x: pl.x,
      y: pl.y - 12,
      text: `🔄 เริ่มต้นใหม่ที่ด่านย่อยที่ 1!`,
      color: '#f59e0b',
      life: 1.6
    });

    setTimeout(() => {
      if (!this.running) return;
      this.adventureResetting = false;

      // Reshuffle deck as requested: "(Recommended) สุ่มสลับลำดับคำศัพท์ใหม่ทุกครั้งที่รีเซ็ต"
      const topicWords = [...this.currentTopicData.words];
      this.adventureDeck = [...topicWords].sort(() => Math.random() - 0.5);
      this.adventureSubStage = 1;

      // Respawn player at bottom-left corner
      pl.x = 100;
      pl.y = this.V_HEIGHT - 100;
      pl.vx = 0;
      pl.vy = 0;
      pl.standingOnPadId = null;
      pl.emotion = 'normal';

      this.setupAdventureSubStage();

      this.floatingTexts.push({
        x: pl.x,
        y: pl.y - 25,
        text: `🚩 ลุยด่านย่อยที่ 1!`,
        color: '#38bdf8',
        life: 1.2
      });
    }, 1200);
  }

  handleAdventureVictory() {
    this.gameState = 'GAME_OVER';
    this.playSFX('finish', 1.0);

    // Award bonus jade for clearing adventure gauntlet!
    profileManager.addJade(25);
    const prof = profileManager.getActiveProfile();
    if (prof) {
      if (!prof.arenaStats) prof.arenaStats = { matchesPlayed: 0, wins: 0, adventureCleared: [] };
      prof.arenaStats.matchesPlayed = (prof.arenaStats.matchesPlayed || 0) + 1;
      prof.arenaStats.wins = (prof.arenaStats.wins || 0) + 1;
      if (!Array.isArray(prof.arenaStats.adventureCleared)) prof.arenaStats.adventureCleared = [];
      if (!prof.arenaStats.adventureCleared.includes(this.config.topic)) {
        prof.arenaStats.adventureCleared.push(this.config.topic);
      }
      profileManager.saveUserData(prof);
    }

    this.showGameOverModal();
  }

  buildPlayers() {
    const W = this.V_WIDTH;
    const H = this.V_HEIGHT;

    // Spawn points at 4 corners
    const spawnPoints = [
      { x: 100, y: H - 100 }, // P1 Red: Bottom-Left
      { x: W - 100, y: 100 }, // P2 Blue: Top-Right
      { x: 100, y: 100 },     // P3 Yellow: Top-Left
      { x: W - 100, y: H - 100 } // P4 Green: Bottom-Right
    ];

    this.players = [];

    if (this.isAdventure) {
      // ADVENTURE MODE: Strictly 1 Human Player (P1 Red) ONLY! No bots!
      const def = this.playerDefs[0];
      const sp = spawnPoints[0];
      const p1Assign = (this.config.playerAssignments && this.config.playerAssignments[0]) || null;
      const activeProf = profileManager.getActiveProfile();
      const p1UserId = p1Assign?.userId || activeProf?.userId || null;
      const p1Name = p1Assign?.userName || activeProf?.name || def.name;
      const p1Avatar = p1Assign?.userAvatar || activeProf?.avatar || '🐼';
      const p1Char = (p1Assign && p1Assign.charId) || (activeProf && activeProf.selectedCharacter) || 4;
      const charObj = ARENA_CHARACTERS.find(c => c.id === p1Char) || ARENA_CHARACTERS[0];

      this.players.push({
        id: 0,
        name: def.name,
        displayName: p1Name,
        userId: p1UserId,
        userAvatar: p1Avatar,
        charId: charObj.id,
        charName: charObj.name,
        charIcon: charObj.emoji,
        color: def.color,
        lightColor: def.lightColor,
        darkColor: def.darkColor,
        baseCorner: def.baseCorner,
        x: sp.x,
        y: sp.y,
        vx: 0,
        vy: 0,
        radius: 20,
        speed: 270,
        isBot: false,
        botDifficulty: 'none',
        score: 0,
        heldPads: 0,
        standingOnPadId: null,
        energy: 0,
        feverTimer: 0,
        stunTimer: 0,
        walkAnim: 0,
        facingAngle: -Math.PI / 4,
        targetAiPad: null,
        aiTimer: 0,
        botReactionTimer: 0,
        squashX: 1,
        squashY: 1,
        squashVx: 0,
        squashVy: 0,
        targetSquashX: 1,
        targetSquashY: 1,
        bounceZ: 0,
        bounceVz: 0,
        emotion: 'normal',
        emotionTimer: 0
      });
      return;
    }

    const humanCount = this.config.playerCount - this.config.botCount;
    const assignments = this.config.playerAssignments || [];
    const activeProf = profileManager.getActiveProfile();

    for (let i = 0; i < this.config.playerCount; i++) {
      const def = this.playerDefs[i];
      const sp = spawnPoints[i];
      const isHuman = i < humanCount;
      const isBot = !isHuman;

      const botDiff = this.config.botDifficulty || 'hard';
      const botProfile = BOT_DIFFICULTY_PROFILES[botDiff] || BOT_DIFFICULTY_PROFILES.hard;
      const speed = isBot ? botProfile.speed : 260;

      const assign = assignments[i] || null;
      let userId = null;
      let displayName = def.name;
      let userAvatar = '👤';
      let charId = 4;
      let charName = 'แพนด้า';
      let charIcon = '🐼';

      if (isHuman) {
        if (assign) {
          userId = assign.userId || null;
          displayName = assign.userName || def.name;
          userAvatar = assign.userAvatar || '👤';
          charId = assign.charId || (i + 1);
          charName = assign.charName || '';
          charIcon = assign.charIcon || '🥋';
        } else if (i === 0 && activeProf) {
          userId = activeProf.userId;
          displayName = activeProf.name;
          userAvatar = activeProf.avatar || '🐼';
          charId = activeProf.selectedCharacter || 4;
          const charObj = ARENA_CHARACTERS.find(c => c.id === charId) || ARENA_CHARACTERS[0];
          charName = charObj.name;
          charIcon = charObj.emoji;
        } else {
          displayName = `ผู้เล่น ${i + 1}`;
          charId = i + 1;
          const charObj = ARENA_CHARACTERS.find(c => c.id === charId) || ARENA_CHARACTERS[i % ARENA_CHARACTERS.length];
          charName = charObj.name;
          charIcon = charObj.emoji;
        }
      } else {
        // Bot slot
        const botNames = ['บอทมังกรฟ้า (Bot Blue)', 'บอทพยัคฆ์ทอง (Bot Yellow)', 'บอทหยกมงคล (Bot Green)'];
        const botEmojis = ['🐒', '🐢', '🖌️'];
        const botIdx = Math.max(0, i - humanCount);
        displayName = assign?.userName || botNames[botIdx] || `บอท ${def.name}`;
        userAvatar = '🤖';
        charIcon = assign?.charIcon || botEmojis[botIdx % botEmojis.length] || '🤖';
      }

      this.players.push({
        id: i,
        name: def.name,
        displayName: displayName,
        userId: userId,
        userAvatar: userAvatar,
        charId: charId,
        charName: charName,
        charIcon: charIcon,
        color: def.color,
        lightColor: def.lightColor,
        darkColor: def.darkColor,
        baseCorner: def.baseCorner,
        x: sp.x,
        y: sp.y,
        vx: 0,
        vy: 0,
        radius: 20,
        speed: speed,
        isBot: isBot,
        botDifficulty: botDiff,
        score: 0,
        heldPads: 0,
        standingOnPadId: null,
        energy: 0, // 0 to 5 pips
        feverTimer: 0,
        stunTimer: 0,
        walkAnim: 0,
        facingAngle: i === 0 ? -Math.PI / 4 : (i === 1 ? Math.PI * 0.75 : 0),
        targetAiPad: null,
        aiTimer: Math.random() * 0.5,
        botReactionTimer: isBot ? (botProfile.reactionMin + Math.random() * (botProfile.reactionMax - botProfile.reactionMin)) : 0,
        // Cartoon Animation & Squash & Stretch (ClaudeAnimationBase principles)
        squashX: 1,
        squashY: 1,
        squashVx: 0,
        squashVy: 0,
        targetSquashX: 1,
        targetSquashY: 1,
        bounceZ: 0,
        bounceVz: 0,
        emotion: 'normal', // 'normal', 'happy', 'sad', 'fierce'
        emotionTimer: 0
      });
    }
  }

  pickNextVocabTarget() {
    if (this.unaskedPadIds && this.unaskedPadIds.length > 0) {
      const nextPadId = this.unaskedPadIds.shift();
      const chosenPad = this.pads.find(p => p.id === nextPadId);
      if (chosenPad) {
        chosenPad.disabledTimer = 0;
      }

      this.completedQuestions = (this.completedQuestions || 0) + 1;
      this.currentTarget = {
        char: chosenPad.vocab.char,
        pinyin: chosenPad.vocab.pinyin,
        english: chosenPad.vocab.english,
        thai: chosenPad.vocab.thai,
        targetPadId: chosenPad.id,
        questionIndex: this.completedQuestions,
        total: this.totalQuestions || this.pads.length
      };
      this.targetTimer = 0;

      // Reset bot reaction timers so they have realistic reading delays based on difficulty
      for (const pl of this.players) {
        if (pl.isBot) {
          const profile = BOT_DIFFICULTY_PROFILES[pl.botDifficulty] || BOT_DIFFICULTY_PROFILES.hard;
          pl.botReactionTimer = profile.reactionMin + Math.random() * (profile.reactionMax - profile.reactionMin);
        }
      }
    } else {
      // All vocabulary words exhausted -> END GAME!
      this.currentTarget = null;
      this.gameState = 'GAME_OVER';
      this.updateScores();
      this.playSFX('finish', 1.0);
      setTimeout(() => {
        this.showGameOverModal();
      }, 500);
    }
  }

  start() {
    this.running = true;
    this.paused = false;
    this.setupEventListeners();
    this.initMatch(this.config);
    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.removeEventListeners();
    try {
      this.arenaBgm.pause();
    } catch (e) {}
  }

  exitArena() {
    this.stop();
    if (this.onExit) this.onExit();
  }

  loop(currentTime) {
    if (!this.running) return;

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    if (!this.paused) {
      this.update(dt);
    }
    this.render();

    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  // --- GAMEPLAY UPDATE LOOP ---
  update(dt) {
    if (this.gameState === 'COUNTDOWN') {
      this.countdownTimer -= dt;
      if (this.countdownTimer <= 0) {
        this.gameState = 'PLAYING';
      }
      return;
    }

    if (this.gameState === 'GAME_OVER') {
      return;
    }

    // 1. Match Timer Countdown / Endless Mode
    if (this.isEndless) {
      this.matchTime += dt;
    } else {
      this.matchTime -= dt;
      if (this.matchTime <= 0) {
        this.matchTime = 0;
        this.gameState = 'GAME_OVER';
        this.updateScores();
        this.playSFX('finish', 0.9);
        this.showGameOverModal();
        return;
      }
    }

    // Screen Shake decay
    if (this.screenShake > 0) {
      this.screenShake -= dt;
      if (this.screenShake < 0) this.screenShake = 0;
    }

    // Update Pad Disabled Timers (2s lockout on wrong steps)
    for (const pad of this.pads) {
      if (pad.disabledTimer > 0) {
        pad.disabledTimer -= dt;
        if (pad.disabledTimer < 0) pad.disabledTimer = 0;
      }
    }

    // 2. Update AI Bots Decision Making (Battle Mode only)
    if (!this.isAdventure) {
      this.updateAI(dt);
    }

    // 3. Update Players Physics, Movement & Collisions
    for (let i = 0; i < this.config.playerCount; i++) {
      const pl = this.players[i];

      if (pl.wrongCooldown > 0) pl.wrongCooldown -= dt;

      // Handle Stun
      if (pl.stunTimer > 0) {
        pl.stunTimer -= dt;
        pl.vx *= 0.85;
        pl.vy *= 0.85;
        continue;
      }

      // Handle Fever timer
      if (pl.feverTimer > 0) {
        pl.feverTimer -= dt;
        // Fever sparks
        if (Math.random() < 0.4) {
          this.particles.push({
            x: pl.x + (Math.random() - 0.5) * 20,
            y: pl.y + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 50,
            vy: (Math.random() - 0.5) * 50,
            color: pl.color,
            size: 4 + Math.random() * 3,
            life: 0.35,
            maxLife: 0.35
          });
        }
      }

      if (this.adventureResetting) {
        pl.vx = 0;
        pl.vy = 0;
      } else {
        const input = this.inputState[i];
        let moveX = input.x;
        let moveY = input.y;

        const len = Math.hypot(moveX, moveY);
        if (len > 0.05) {
          moveX /= Math.max(1, len);
          moveY /= Math.max(1, len);
          pl.facingAngle = Math.atan2(moveY, moveX);
          pl.walkAnim += dt * 12;
          // Motion stretch: stretch along movement direction, compress across
          pl.targetSquashX = 1.14;
          pl.targetSquashY = 0.88;
        } else {
          pl.targetSquashX = 1.0;
          pl.targetSquashY = 1.0;
          // Breathing idle animation (Clawd / cartoon principle: never completely still)
          if (pl.bounceZ === 0 && pl.emotion === 'normal') {
            const breathe = Math.sin(performance.now() * 0.005 + pl.id * 1.5) * 0.045;
            pl.targetSquashX = 1 - breathe;
            pl.targetSquashY = 1 + breathe;
          }
        }

        const currentSpeed = pl.feverTimer > 0 ? pl.speed * 1.55 : pl.speed;
        pl.vx = moveX * currentSpeed;
        pl.vy = moveY * currentSpeed;

        // Apply movement
        pl.x += pl.vx * dt;
        pl.y += pl.vy * dt;
      }

      // Damped Spring Simulation for snappy cartoon overshoot
      const tension = 180;
      const damping = 14;
      const ax = (pl.targetSquashX - pl.squashX) * tension - pl.squashVx * damping;
      const ay = (pl.targetSquashY - pl.squashY) * tension - pl.squashVy * damping;
      pl.squashVx += ax * dt;
      pl.squashVy += ay * dt;
      pl.squashX += pl.squashVx * dt;
      pl.squashY += pl.squashVy * dt;

      // Vertical bounce hop physics (for happy celebration jumps)
      if (pl.bounceZ > 0 || pl.bounceVz !== 0) {
        pl.bounceVz -= 900 * dt;
        pl.bounceZ += pl.bounceVz * dt;
        if (pl.bounceZ <= 0) {
          pl.bounceZ = 0;
          pl.bounceVz = 0;
          // Landing impact squash!
          pl.squashX = 1.35;
          pl.squashY = 0.72;
        }
      }

      // Emotion timer countdown
      if (pl.emotionTimer > 0) {
        pl.emotionTimer -= dt;
        if (pl.emotionTimer <= 0) {
          pl.emotion = pl.feverTimer > 0 ? 'fierce' : 'normal';
        }
      }

      // Wall Collisions
      this.handleWallCollisions(pl);
    }

    // 4. Player vs Player Bump Collisions
    this.handlePlayerCollisions();

    // 5. Check Pad Stealing & Chinese Vocab Match
    this.handlePadCollisions();

    // 6. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }

    // 7. Update Floating Text
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 25 * dt;
      ft.life -= dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    // 8. Recalculate Scores
    this.updateScores();
  }

  // --- SMART AI BOT STEERING ---
  updateAI(dt) {
    for (let i = 0; i < this.config.playerCount; i++) {
      const pl = this.players[i];
      if (!pl.isBot) continue;

      const profile = BOT_DIFFICULTY_PROFILES[pl.botDifficulty] || BOT_DIFFICULTY_PROFILES.hard;

      // Bot reading/reaction delay
      if (pl.botReactionTimer > 0) {
        pl.botReactionTimer -= dt;
        // Mild wander while reading
        pl.aiTimer -= dt;
        if (pl.aiTimer <= 0) {
          pl.aiTimer = 0.35;
          const wanderPower = profile.aiWanderPower || 0.3;
          this.inputState[i].x = (Math.random() - 0.5) * wanderPower;
          this.inputState[i].y = (Math.random() - 0.5) * wanderPower;
        }
        continue;
      }

      pl.aiTimer -= dt;
      if (pl.aiTimer <= 0) {
        pl.aiTimer = 0.15 + Math.random() * 0.15;

        let bestTarget = null;
        if (this.currentTarget) {
          bestTarget = this.pads[this.currentTarget.targetPadId];
        }

        // Steer towards target
        if (bestTarget) {
          const dx = bestTarget.x - pl.x;
          const dy = bestTarget.y - pl.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 10) {
            this.inputState[i].x = dx / dist;
            this.inputState[i].y = dy / dist;
          }
        }

        // AI trigger Dragon Fever if energy full
        if (pl.energy >= 5 && pl.feverTimer <= 0 && Math.random() < profile.feverChance) {
          this.triggerDragonFever(i);
        }
      }
    }
  }

  // --- WALL & PILLAR CIRCLE-BOX COLLISION ---
  handleWallCollisions(pl) {
    const r = pl.radius;

    for (const w of this.walls) {
      // Find closest point on rectangle to circle
      const closestX = Math.max(w.x, Math.min(pl.x, w.x + w.w));
      const closestY = Math.max(w.y, Math.min(pl.y, w.y + w.h));

      const dx = pl.x - closestX;
      const dy = pl.y - closestY;
      const dist = Math.hypot(dx, dy);

      if (dist < r) {
        // Push out of wall
        const overlap = r - dist;
        if (dist > 0.001) {
          pl.x += (dx / dist) * overlap;
          pl.y += (dy / dist) * overlap;
        } else {
          pl.x += r;
        }
      }
    }
  }

  // --- PLAYER VS PLAYER BUMP & FEVER KNOCKBACK ---
  handlePlayerCollisions() {
    for (let i = 0; i < this.config.playerCount; i++) {
      for (let j = i + 1; j < this.config.playerCount; j++) {
        const p1 = this.players[i];
        const p2 = this.players[j];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.hypot(dx, dy);
        const minDist = p1.radius + p2.radius;

        if (dist < minDist && dist > 0.001) {
          const overlap = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;

          // Push apart
          p1.x -= nx * overlap * 0.5;
          p1.y -= ny * overlap * 0.5;
          p2.x += nx * overlap * 0.5;
          p2.y += ny * overlap * 0.5;

          // Impact Squash & Stretch deformation
          p1.squashX = 0.76;
          p1.squashY = 1.32;
          p2.squashX = 0.76;
          p2.squashY = 1.32;

          // Fever Knockback impact
          if (p1.feverTimer > 0 && p2.feverTimer <= 0) {
            p2.vx += nx * 450;
            p2.vy += ny * 450;
            p2.stunTimer = 1.0;
            this.playSFX('bump', 0.8);
            this.spawnExplosion(p2.x, p2.y, p1.color);
          } else if (p2.feverTimer > 0 && p1.feverTimer <= 0) {
            p1.vx -= nx * 450;
            p1.vy -= ny * 450;
            p1.stunTimer = 1.0;
            this.playSFX('bump', 0.8);
            this.spawnExplosion(p1.x, p1.y, p2.color);
          } else {
            this.playSFX('bump', 0.4);
          }
        }
      }
    }
  }

  // --- PAD CAPTURE & CHINESE VOCAB MATCHING ---
  handlePadCollisions() {
    // 0. Adventure Mode Collision Handling (5-Pad Gauntlet)
    if (this.isAdventure) {
      if (this.adventureResetting) return;
      const pl = this.players[0];
      if (!pl) return;
      let touchingAnyPad = false;

      for (const pad of this.pads) {
        const dist = Math.hypot(pad.x - pl.x, pad.y - pl.y);

        if (dist < pad.radius + pl.radius - 6) {
          touchingAnyPad = true;

          if (pl.standingOnPadId !== pad.id) {
            pl.standingOnPadId = pad.id;

            if (pad.isTarget) {
              this.handleAdventureCorrect(pad, pl);
              return;
            } else {
              this.handleAdventureWrong(pad, pl);
              return;
            }
          }
        }
      }

      if (!touchingAnyPad) {
        pl.standingOnPadId = null;
      }
      return;
    }

    for (let i = 0; i < this.config.playerCount; i++) {
      const pl = this.players[i];
      let touchingAnyPad = false;

      for (const pad of this.pads) {
        const dist = Math.hypot(pad.x - pl.x, pad.y - pl.y);

        if (dist < pad.radius + pl.radius - 6) {
          touchingAnyPad = true;

          // If this pad is already solved from a previous question, it is claimed territory:
          // NEVER penalize players for walking or standing on an already solved pad!
          if (pad.isSolved) {
            pl.standingOnPadId = pad.id;
            continue;
          }

          // If pad is currently locked out for 2s due to a wrong step, ignore collisions
          if (pad.disabledTimer > 0) {
            pl.standingOnPadId = pad.id;
            continue;
          }

          // 1. Check if this pad is the TARGET CHINESE VOCABULARY WORD!
          if (this.currentTarget && pad.id === this.currentTarget.targetPadId) {
            const isSteal = pad.owner >= 0 && pad.owner !== pl.id;
            pad.isSolved = true;
            pad.owner = pl.id;
            pad.flipAnim = 1.0;
            pad.disabledTimer = 0;
            pl.standingOnPadId = pad.id;

            // Score & Energy rewards
            pl.score += 5;
            pl.energy = Math.min(5, pl.energy + 1.5);
            if (pl.id === 0 && pad.vocab && pad.vocab.char) {
              profileManager.recordLearnedVocab(pad.vocab.char);
            }

            // Trigger Happy Cartoon Take & Spring Stretch!
            pl.emotion = 'happy';
            pl.emotionTimer = 1.3;
            pl.squashX = 0.68;
            pl.squashY = 1.48;
            pl.bounceVz = 220;

            this.playSFX('goldenLock', 0.95);

            // Celebration Gold & Color Particles
            for (let k = 0; k < 25; k++) {
              const ang = Math.random() * Math.PI * 2;
              const spd = 80 + Math.random() * 160;
              this.particles.push({
                x: pad.x,
                y: pad.y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                color: Math.random() < 0.5 ? '#fbbf24' : pl.color,
                size: 5 + Math.random() * 5,
                life: 0.7,
                maxLife: 0.7
              });
            }

            const label = isSteal ? '🔥 STOLEN!' : '✨ ถูกต้อง!';
            this.floatingTexts.push({
              x: pad.x,
              y: pad.y - 25,
              text: `${label} +5 (${pad.vocab.char} - ${pad.vocab.pinyin})`,
              color: pl.color,
              life: 1.5
            });

            // Immediately advance to next English Question!
            this.pickNextVocabTarget();
            break;
          } else {
            // Player stepped on an INCORRECT pad:
            // Only trigger penalty ONCE when player newly steps onto this pad!
            if (pl.standingOnPadId !== pad.id) {
              pl.standingOnPadId = pad.id;

              // 1. Penalty: -1 score (allowed to go negative as requested by user!)
              pl.score -= 1;

              // 2. Lock out this pad for 2 seconds!
              pad.disabledTimer = 2.0;

              // Trigger Disappointed Cartoon Pancake Squash & Sweat Drop!
              pl.emotion = 'sad';
              pl.emotionTimer = 1.2;
              pl.squashX = 1.45;
              pl.squashY = 0.58;

              this.playSFX('bump', 0.6);

              // Red warning particles
              for (let k = 0; k < 14; k++) {
                const ang = Math.random() * Math.PI * 2;
                const spd = 50 + Math.random() * 90;
                this.particles.push({
                  x: pad.x,
                  y: pad.y,
                  vx: Math.cos(ang) * spd,
                  vy: Math.sin(ang) * spd,
                  color: '#ef4444',
                  size: 4 + Math.random() * 4,
                  life: 0.55,
                  maxLife: 0.55
                });
              }

              this.floatingTexts.push({
                x: pl.x,
                y: pl.y - 22,
                text: `❌ -1 (${pad.vocab.char} = ${pad.vocab.english})`,
                color: '#ef4444',
                life: 1.5
              });
            }
          }
        }
      }

      if (!touchingAnyPad) {
        pl.standingOnPadId = null;
      }
    }
  }

  updateScores() {
    // Reset base count from held pads
    const padCounts = [0, 0, 0, 0];
    for (const pad of this.pads) {
      if (pad.owner >= 0 && pad.owner < 4) {
        padCounts[pad.owner]++;
      }
    }
    // Update live scores
    for (let i = 0; i < this.config.playerCount; i++) {
      this.players[i].heldPads = padCounts[i];
    }
  }

  spawnExplosion(x, y, color) {
    for (let i = 0; i < 18; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 60 + Math.random() * 150;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        color,
        size: 5 + Math.random() * 4,
        life: 0.45,
        maxLife: 0.45
      });
    }
  }

  // --- RENDERING PIPELINE ---
  render() {
    const ctx = this.ctx;
    const W = this.V_WIDTH;
    const H = this.V_HEIGHT;

    ctx.save();
    ctx.clearRect(0, 0, W, H);

    // Dynamic Screen Shake effect (triggered on mistakes or impacts)
    if (this.screenShake > 0) {
      const shakeMag = this.screenShake * 16;
      const sx = (Math.random() - 0.5) * shakeMag;
      const sy = (Math.random() - 0.5) * shakeMag;
      ctx.translate(sx, sy);
    }

    // 1. Thematic Arena Floor Color by Topic
    const floorCols = (this.currentTopicData && this.currentTopicData.floorColors) || ['#15803d', '#16a34a', '#14532d'];
    const grassGrad = ctx.createLinearGradient(0, 0, W, H);
    grassGrad.addColorStop(0, floorCols[0]);
    grassGrad.addColorStop(0.5, floorCols[1]);
    grassGrad.addColorStop(1, floorCols[2] || floorCols[0]);
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle arena grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 60; x < W; x += 60) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 60; y < H; y += 60) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // 2. Draw Pads (Octagonal Color Pedestals with Chinese characters)
    this.renderPads(ctx);

    // 3. Draw Symmetrical Obstacles, Walls & Corner Bases
    this.renderArenaWalls(ctx);

    // 4. Draw Players (Top-down clay creatures with facing direction)
    this.renderPlayers(ctx);

    // 5. Draw Particles
    for (const pt of this.particles) {
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.size * (pt.life / pt.maxLife)), 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Draw Floating Texts
    for (const ft of this.floatingTexts) {
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 16px "Mali", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
    }

    // 7. Draw HUD (Scores, Timer, Target Vocabulary Banner, Mobile Corner Joysticks)
    this.renderHUD(ctx);

    // 8. Countdown / Game Over Overlay
    if (this.gameState === 'COUNTDOWN') {
      this.renderCountdown(ctx);
    } else if (this.gameState === 'GAME_OVER') {
      this.renderGameOver(ctx);
    }

    ctx.restore();
  }

  // --- RENDER OCTAGONAL COLOR PADS ---
  renderPads(ctx) {
    for (const pad of this.pads) {
      ctx.save();
      const r = pad.radius;

      // Soft drop shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.beginPath();
      ctx.ellipse(pad.x, pad.y + 6, r * 1.05, r * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();

      // Octagonal Beveled Stone Base
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI) / 4 + Math.PI / 8;
        const px = pad.x + Math.cos(ang) * r;
        const py = pad.y + Math.sin(ang) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      // Fill stone base
      const stoneGrad = ctx.createLinearGradient(pad.x - r, pad.y - r, pad.x + r, pad.y + r);
      stoneGrad.addColorStop(0, '#e2e8f0');
      stoneGrad.addColorStop(0.5, '#cbd5e1');
      stoneGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = stoneGrad;
      ctx.fill();

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Golden Sparkle on top-left bevel (from screenshot)
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(pad.x - r * 0.5, pad.y - r * 0.5, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // --- CENTER COLOR INDICATOR & STEPPING BUTTON ---
      const btnR = r * 0.76; // Large 33.5px radius for crystal-clear readability and generous margins!

      // Glowing aura if captured
      if (pad.owner >= 0 && pad.owner < 4) {
        const def = this.playerDefs[pad.owner];
        ctx.fillStyle = `${def.color}44`;
        ctx.beginPath();
        ctx.arc(pad.x, pad.y, r * 1.05, 0, Math.PI * 2);
        ctx.fill();
      }

      // Circular Center Stepping Button
      if (pad.owner >= 0 && pad.owner < 4) {
        // Captured by player: rich vibrant player theme
        const def = this.playerDefs[pad.owner];
        const cGrad = ctx.createLinearGradient(pad.x, pad.y - btnR, pad.x, pad.y + btnR);
        cGrad.addColorStop(0, def.lightColor);
        cGrad.addColorStop(1, def.color);
        ctx.fillStyle = cGrad;
        ctx.beginPath();
        ctx.arc(pad.x, pad.y, btnR, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = def.darkColor;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      } else {
        // Neutral: Clean bright porcelain jade white surface
        const cGrad = ctx.createLinearGradient(pad.x, pad.y - btnR, pad.x, pad.y + btnR);
        cGrad.addColorStop(0, '#ffffff');
        cGrad.addColorStop(1, '#f1f5f9');
        ctx.fillStyle = cGrad;
        ctx.beginPath();
        ctx.arc(pad.x, pad.y, btnR, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // --- CHINESE CHARACTER & PINYIN ON PAD ---
      if (pad.vocab) {
        const isCaptured = pad.owner >= 0 && pad.owner < 4;
        const charLen = pad.vocab.char.length;
        let fontSize = 24;
        if (charLen === 2) fontSize = 19;
        else if (charLen === 3) fontSize = 15;
        else if (charLen >= 4) fontSize = 12.5;

        // Main Hanzi Text
        ctx.fillStyle = isCaptured ? '#ffffff' : '#0f172a';
        ctx.font = `900 ${fontSize}px "Noto Sans SC", "Outfit", "Mali", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (isCaptured) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetY = 1;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fillText(pad.vocab.char, pad.x, pad.y - 4);
        ctx.shadowBlur = 0; // Reset shadow

        // Pinyin Subtext
        ctx.fillStyle = isCaptured ? '#fef08a' : '#475569';
        const pinyinSize = pad.vocab.pinyin.length > 9 ? 9.5 : 11;
        ctx.font = `bold ${pinyinSize}px "Mali", sans-serif`;
        ctx.fillText(pad.vocab.pinyin, pad.x, pad.y + 15);
      }

      // --- SOLVED BADGE (Small golden seal with checkmark) ---
      if (pad.isSolved) {
        ctx.save();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(pad.x + r * 0.58, pad.y - r * 0.58, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#78350f';
        ctx.font = '900 11px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✓', pad.x + r * 0.58, pad.y - r * 0.58);
        ctx.restore();
      }

      // --- DISABLED 2s LOCKOUT OVERLAY (When stepped on incorrectly) ---
      if (pad.disabledTimer > 0 && !pad.isSolved) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.55)';
        ctx.beginPath();
        ctx.arc(pad.x, pad.y, btnR, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Lock / Seconds indicator
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 15px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(`❌ ${pad.disabledTimer.toFixed(1)}s`, pad.x, pad.y);
        ctx.shadowBlur = 0;
      }

      ctx.restore();
    }
  }

  // --- RENDER ARENA WALLS & CORNER BASES ---
  renderArenaWalls(ctx) {
    const W = this.V_WIDTH;
    const H = this.V_HEIGHT;

    // 1. Corner Bases (Red BL, Blue TR, Yellow TL, Green BR)
    const corners = [
      { id: 0, x: 40, y: H - 140, w: 100, h: 100 }, // BL Red
      { id: 1, x: W - 140, y: 40, w: 100, h: 100 }, // TR Blue
      { id: 2, x: 40, y: 40, w: 100, h: 100 },       // TL Yellow
      { id: 3, x: W - 140, y: H - 140, w: 100, h: 100 } // BR Green
    ];

    for (const c of corners) {
      if (this.isAdventure && c.id !== 0) continue;
      if (!this.isAdventure && c.id >= this.config.playerCount) continue;
      const def = this.playerDefs[c.id];
      ctx.save();
      // Base Floor Pad with Diamond (as in screenshot)
      ctx.fillStyle = `${def.color}26`;
      ctx.fillRect(c.x, c.y, c.w, c.h);

      ctx.strokeStyle = def.color;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(c.x + 8, c.y + 8, c.w - 16, c.h - 16);

      // Inner diamond
      ctx.beginPath();
      ctx.moveTo(c.x + c.w / 2, c.y + 12);
      ctx.lineTo(c.x + c.w - 12, c.y + c.h / 2);
      ctx.lineTo(c.x + c.w / 2, c.y + c.h - 12);
      ctx.lineTo(c.x + 12, c.y + c.h / 2);
      ctx.closePath();
      ctx.stroke();

      // Vertical 5-Pip Energy Gate (From Screenshot!)
      const pl = this.players[c.id];
      const energyLevel = pl ? Math.floor(pl.energy) : 0;

      const barX = c.id === 0 || c.id === 2 ? c.x + c.w + 6 : c.x - 22;
      const barY = c.y + 10;
      const barW = 16;
      const barH = c.h - 20;

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH, 6);
      ctx.fill();
      ctx.strokeStyle = def.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // 5 Pip Slots
      const pipH = (barH - 12) / 5;
      for (let p = 0; p < 5; p++) {
        const pipY = barY + 6 + (4 - p) * pipH; // bottom to top
        ctx.fillStyle = p < energyLevel ? def.color : '#334155';
        ctx.beginPath();
        ctx.arc(barX + barW / 2, pipY + pipH / 2, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // 2. Solid Arena Walls & Pillars
    for (const w of this.walls) {
      ctx.save();

      // Drop shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.fillRect(w.x + 4, w.y + 6, w.w, w.h);

      if (w.isAltar) {
        // Dark center altar pit
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.strokeRect(w.x, w.y, w.w, w.h);
      } else {
        // Wooden rim / Clay stone barrier
        const wGrad = ctx.createLinearGradient(w.x, w.y, w.x + w.w, w.y + w.h);
        wGrad.addColorStop(0, '#78350f'); // rich mahogany / teak wood
        wGrad.addColorStop(0.5, '#92400e');
        wGrad.addColorStop(1, '#451a03');
        ctx.fillStyle = wGrad;
        ctx.beginPath();
        ctx.roundRect(w.x, w.y, w.w, w.h, 6);
        ctx.fill();

        ctx.strokeStyle = '#291102';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner wood highlight
        ctx.strokeStyle = 'rgba(254, 215, 170, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(w.x + 2, w.y + 2, Math.max(1, w.w - 4), Math.max(1, w.h - 4));
      }

      ctx.restore();
    }
  }

  // --- RENDER PLAYERS (CLAY CHARACTERS) ---
  renderPlayers(ctx) {
    for (let i = 0; i < this.config.playerCount; i++) {
      const pl = this.players[i];
      ctx.save();
      ctx.translate(pl.x, pl.y);

      // Stun wobble
      if (pl.stunTimer > 0) {
        ctx.rotate(Math.sin(performance.now() * 0.03) * 0.25);
      }

      // 1. Perspective Drop Shadow (scales with bounceZ)
      const shadowScale = Math.max(0.4, 1 - (pl.bounceZ || 0) / 75);
      ctx.fillStyle = `rgba(15, 23, 42, ${0.3 * shadowScale})`;
      ctx.beginPath();
      ctx.ellipse(0, pl.radius * 0.8, pl.radius * 0.9 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Dragon Fever Aura Ring
      if (pl.feverTimer > 0) {
        ctx.save();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, -(pl.bounceZ || 0), pl.radius + 8 + Math.sin(performance.now() * 0.015) * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Rotated Character Body with Facing Angle, Vertical Hop & Squash/Stretch
      ctx.save();
      ctx.translate(0, -(pl.bounceZ || 0)); // Vertical hop
      ctx.rotate(pl.facingAngle);
      ctx.scale(pl.squashX || 1, pl.squashY || 1); // Cartoon Squash & Stretch!

      // Stepping Feet (Claybound style)
      const step = Math.sin(pl.walkAnim) * 5;
      ctx.fillStyle = pl.darkColor;
      ctx.beginPath();
      ctx.ellipse(pl.radius * 0.4, -pl.radius * 0.6 + step, 5, 3.5, 0, 0, Math.PI * 2);
      ctx.ellipse(pl.radius * 0.4, pl.radius * 0.6 - step, 5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main Dough Body (Round Clay with Dual Inner Shadows)
      const r = pl.radius;
      const bGrad = ctx.createLinearGradient(-r, -r, r, r);
      bGrad.addColorStop(0, pl.lightColor);
      bGrad.addColorStop(0.5, pl.color);
      bGrad.addColorStop(1, pl.darkColor);
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Top specular highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.arc(-r * 0.35, -r * 0.35, r * 0.32, 0, Math.PI * 2);
      ctx.fill();

      // Contour outline
      ctx.strokeStyle = pl.darkColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Facial Expressions based on pl.emotion (ClaudeAnimationBase Cartoon Principles)
      if (pl.emotion === 'happy') {
        // Happy Curved Arch Eyes ^ ^
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(r * 0.45, -r * 0.28, 3.4, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(r * 0.45, r * 0.28, 3.4, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();

        // Happy open mouth :D
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(r * 0.65, 0, 3.8, -Math.PI / 2, Math.PI / 2);
        ctx.fill();

        // Rosy cheeks
        ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
        ctx.beginPath();
        ctx.arc(r * 0.35, -r * 0.52, 2.5, 0, Math.PI * 2);
        ctx.arc(r * 0.35, r * 0.52, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (pl.emotion === 'sad' || pl.stunTimer > 0) {
        // Dizzy / Disappointed > < eyes
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.2;
        // Top Eye >
        ctx.beginPath();
        ctx.moveTo(r * 0.36, -r * 0.36);
        ctx.lineTo(r * 0.48, -r * 0.28);
        ctx.lineTo(r * 0.36, -r * 0.20);
        ctx.stroke();
        // Bottom Eye >
        ctx.beginPath();
        ctx.moveTo(r * 0.36, r * 0.20);
        ctx.lineTo(r * 0.48, r * 0.28);
        ctx.lineTo(r * 0.36, r * 0.36);
        ctx.stroke();

        // Wavy mouth ~
        ctx.beginPath();
        ctx.moveTo(r * 0.62, -2.5);
        ctx.quadraticCurveTo(r * 0.67, 0, r * 0.62, 2.5);
        ctx.stroke();

        // Sweat Drop Emote 💧 (floating off forehead)
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(r * 0.2, -r * 0.8, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(r * 0.2, -r * 1.15);
        ctx.lineTo(r * 0.2 - 2.8, -r * 0.8);
        ctx.lineTo(r * 0.2 + 2.8, -r * 0.8);
        ctx.fill();
      } else if (pl.feverTimer > 0 || pl.emotion === 'fierce') {
        // Fierce / Dragon Rush Eyes \ /
        ctx.strokeStyle = '#7c2d12';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(r * 0.36, -r * 0.38);
        ctx.lineTo(r * 0.54, -r * 0.26);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(r * 0.36, r * 0.38);
        ctx.lineTo(r * 0.54, r * 0.26);
        ctx.stroke();

        // Burning gold pupils
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(r * 0.44, -r * 0.28, 2.4, 0, Math.PI * 2);
        ctx.arc(r * 0.44, r * 0.28, 2.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Normal Cute Glossy Cartoon Eyes
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(r * 0.45, -r * 0.3, 3.2, 0, Math.PI * 2);
        ctx.arc(r * 0.45, r * 0.3, 3.2, 0, Math.PI * 2);
        ctx.fill();

        // Eye white sparkles
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(r * 0.52, -r * 0.34, 1.3, 0, Math.PI * 2);
        ctx.arc(r * 0.52, r * 0.26, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore(); // end rotation & squash

      // Player Label Badge (Floating pill with Avatar + Name + Live Score)
      ctx.save();
      const badgeAvatar = pl.isBot ? '🤖' : (pl.userAvatar || pl.charIcon || '👤');
      const badgeName = pl.displayName || pl.name;
      const badgeText = `${badgeAvatar} ${badgeName} (${pl.score || 0})`;
      ctx.font = 'bold 11px "Outfit", "Noto Sans Thai", sans-serif';
      const textWidth = ctx.measureText(badgeText).width;
      const pillW = Math.max(textWidth + 16, 52);
      const pillH = 20;
      const pillX = -pillW / 2;
      const pillY = -pl.radius - 23;

      // Pill shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.beginPath();
      ctx.roundRect(pillX, pillY + 1.5, pillW, pillH, 10);
      ctx.fill();

      // Pill background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 10);
      ctx.fill();

      // Pill border matching player's bright accent
      ctx.strokeStyle = pl.lightColor || pl.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Text
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, 0, pillY + pillH / 2);
      ctx.restore();

      ctx.restore();
    }
  }

  // --- RENDER HUD (SCORES, TIMER, CHINESE VOCAB BANNER, TOUCH CONTROLS) ---
  renderHUD(ctx) {
    if (this.isAdventure) {
      this.renderAdventureHUD(ctx);
      return;
    }

    const W = this.V_WIDTH;
    const H = this.V_HEIGHT;

    const timeDisplay = this.isEndless ? '∞' : this.formatTime(this.matchTime);

    // 1. Top Scoreboard (Inverted 180° for Player 2 / Player 3 facing across table!)
    ctx.save();
    ctx.translate(W / 2, 38);
    ctx.rotate(Math.PI); // Invert so top player sees it right-side up!

    // Blue Score & Timer Capsule
    this.renderScoreCapsule(ctx, this.players[1] ? this.players[1].score : 0, this.playerDefs[1].color, timeDisplay);
    ctx.restore();

    // 2. Bottom Scoreboard (Normal for Player 1 / Player 4)
    ctx.save();
    ctx.translate(W / 2, H - 38);
    // Red Score & Timer Capsule
    this.renderScoreCapsule(ctx, this.players[0] ? this.players[0].score : 0, this.playerDefs[0].color, timeDisplay);
    ctx.restore();

    // 3. Central Target English Question Banner (QUESTION PROMPT)
    if (this.currentTarget) {
      ctx.save();
      const bannerW = 660;
      const bannerH = 50;
      const bx = W / 2 - bannerW / 2;
      const by = 64; // High enough to avoid crowding top pads!

      // Drop shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.beginPath();
      ctx.roundRect(bx, by + 4, bannerW, bannerH, 25);
      ctx.fill();

      // Golden Clay Scroll Background
      const sGrad = ctx.createLinearGradient(bx, by, bx, by + bannerH);
      sGrad.addColorStop(0, '#ffffff');
      sGrad.addColorStop(0.3, '#fef9c3');
      sGrad.addColorStop(1, '#fde047');
      ctx.fillStyle = sGrad;
      ctx.beginPath();
      ctx.roundRect(bx, by, bannerW, bannerH, 25);
      ctx.fill();

      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Top Prompt Header with Question Counter
      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 12px "Mali", sans-serif';
      ctx.textAlign = 'center';
      const qNumText = this.currentTarget.questionIndex ? `คำถามที่ ${this.currentTarget.questionIndex}/${this.currentTarget.total}` : 'โจทย์';
      ctx.fillText(`🎯 ${qNumText} 👉 วิ่งไปเหยียบตัวอักษรจีนที่ถูกต้อง:`, W / 2, by + 17);

      // Large English & Thai Meaning Target (responsive sizing)
      const meaningText = this.currentTarget.thai
        ? `"${this.currentTarget.english}" (${this.currentTarget.thai})`
        : `"${this.currentTarget.english}"`;
      const engSize = meaningText.length > 32 ? 14 : (meaningText.length > 20 ? 17 : 20);
      ctx.fillStyle = '#0f172a';
      ctx.font = `900 ${engSize}px "Outfit", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(meaningText, W / 2, by + 38);

      ctx.restore();
    }

    // 4. Draw Touch Joysticks in Corners (On touch devices or for multiplayer)
    this.renderTouchControls(ctx);
  }

  renderAdventureHUD(ctx) {
    const W = this.V_WIDTH;
    const H = this.V_HEIGHT;

    // 1. Top Sub-Stage Tracker Bar
    ctx.save();
    const total = this.adventureTotalStages || 8;
    const trackerW = Math.min(840, Math.max(560, total * 62 + 200));
    const trackerH = 48;
    const tx = W / 2 - trackerW / 2;
    const ty = 12;

    // Drop shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    ctx.beginPath();
    ctx.roundRect(tx, ty + 3, trackerW, trackerH, 18);
    ctx.fill();

    // Dark sleek glass capsule
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(tx, ty, trackerW, trackerH, 18);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Left label: Mode badge
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px "Outfit", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('🗺️ ADVENTURE', tx + 16, ty + trackerH / 2);

    // Right label: Mistakes count
    ctx.fillStyle = this.adventureMistakes > 0 ? '#f87171' : '#a7f3d0';
    ctx.font = 'bold 12px "Outfit", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`💔 พลาด: ${this.adventureMistakes} ครั้ง`, tx + trackerW - 16, ty + trackerH / 2);

    // Center sub-stage step pips
    const pipsStartX = tx + 140;
    const pipsEndX = tx + trackerW - 140;
    const stepSpacing = (pipsEndX - pipsStartX) / Math.max(1, total - 1);

    // Background connecting line
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(pipsStartX, ty + trackerH / 2);
    ctx.lineTo(pipsEndX, ty + trackerH / 2);
    ctx.stroke();

    // Completed line
    if (this.adventureSubStage > 1) {
      const activeX = pipsStartX + (this.adventureSubStage - 1) * stepSpacing;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(pipsStartX, ty + trackerH / 2);
      ctx.lineTo(activeX, ty + trackerH / 2);
      ctx.stroke();
    }

    // Step Pips
    for (let s = 1; s <= total; s++) {
      const pipX = pipsStartX + (s - 1) * stepSpacing;
      const pipY = ty + trackerH / 2;

      if (s < this.adventureSubStage) {
        // Cleared pip
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(pipX, pipY, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 11px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✓', pipX, pipY);
      } else if (s === this.adventureSubStage) {
        // Current Active pip (pulsing gold)
        const pulse = Math.sin(performance.now() * 0.008) * 2.2;
        ctx.save();
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(pipX, pipY, 14 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#78350f';
        ctx.font = '900 12px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${s}`, pipX, pipY);
      } else {
        // Upcoming pip
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(pipX, pipY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 10px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${s}`, pipX, pipY);
      }
    }
    ctx.restore();

    // 2. Central Question Prompt Banner
    if (this.currentTarget) {
      ctx.save();
      const bannerW = 660;
      const bannerH = 50;
      const bx = W / 2 - bannerW / 2;
      const by = 68;

      // Drop shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.beginPath();
      ctx.roundRect(bx, by + 4, bannerW, bannerH, 25);
      ctx.fill();

      // Golden Scroll Gradient
      const sGrad = ctx.createLinearGradient(bx, by, bx, by + bannerH);
      sGrad.addColorStop(0, '#ffffff');
      sGrad.addColorStop(0.3, '#fef9c3');
      sGrad.addColorStop(1, '#fde047');
      ctx.fillStyle = sGrad;
      ctx.beginPath();
      ctx.roundRect(bx, by, bannerW, bannerH, 25);
      ctx.fill();

      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Header Prompt
      ctx.fillStyle = '#92400e';
      ctx.font = 'bold 12px "Mali", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🎯 ด่านย่อยที่ ${this.adventureSubStage}/${this.adventureTotalStages} 👉 วิ่งไปเหยียบตัวอักษรจีนที่ถูกต้อง:`, W / 2, by + 17);

      // Large English & Thai Target
      const meaningText = this.currentTarget.thai
        ? `"${this.currentTarget.english}" (${this.currentTarget.thai})`
        : `"${this.currentTarget.english}"`;
      const engSize = meaningText.length > 32 ? 14 : (meaningText.length > 20 ? 17 : 20);
      ctx.fillStyle = '#0f172a';
      ctx.font = `900 ${engSize}px "Outfit", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(meaningText, W / 2, by + 37);
      ctx.restore();
    }

    // 3. Bottom Player Status Capsule
    ctx.save();
    const botW = 380;
    const botH = 38;
    const botX = W / 2 - botW / 2;
    const botY = H - 46;

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(botX, botY, botW, botH, 19);
    ctx.fill();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const scoreVal = this.players[0] ? this.players[0].score : 0;
    const timeVal = this.formatTime(this.matchTime);
    ctx.fillText(`⭐️ ${scoreVal} pts   |   ⏱️ ${timeVal}   |   ⚠️ ตอบผิดเริ่มด่าน 1 ใหม่`, W / 2, botY + botH / 2);
    ctx.restore();

    // 4. Touch Joystick for mobile (Bottom-Left corner)
    this.renderTouchControls(ctx);
  }

  renderScoreCapsule(ctx, score, color, timeStr) {
    // Score Badge Left
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-110, -22, 90, 44, 10);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = '900 28px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${score}`, -65, 0);

    // Timer Badge Right
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-10, -22, 120, 44, 10);
    ctx.fill();
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = '900 24px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(timeStr, 50, 0);
    ctx.restore();
  }

  renderTouchControls(ctx) {
    // 1. Render all active floating virtual joysticks under player fingers
    if (this.activePointers && this.activePointers.size > 0) {
      for (const [id, pt] of this.activePointers.entries()) {
        const pDef = this.playerDefs[pt.pid] || { color: '#ef4444', lightColor: '#fca5a5' };
        const color = pDef.color;

        ctx.save();

        // Outer boundary base ring
        ctx.beginPath();
        ctx.arc(pt.startX, pt.startY, 54, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Inner reference circle
        ctx.beginPath();
        ctx.arc(pt.startX, pt.startY, 18, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Calculate thumb knob offset clamped to max radius
        const dx = pt.currX - pt.startX;
        const dy = pt.currY - pt.startY;
        const dist = Math.hypot(dx, dy);
        const maxKnobDist = 44;
        const clampedDist = Math.min(dist, maxKnobDist);
        const angle = Math.atan2(dy, dx);
        const knobX = pt.startX + (dist > 0 ? Math.cos(angle) * clampedDist : 0);
        const knobY = pt.startY + (dist > 0 ? Math.sin(angle) * clampedDist : 0);

        // Connecting tactile rod
        if (dist > 6) {
          ctx.beginPath();
          ctx.moveTo(pt.startX, pt.startY);
          ctx.lineTo(knobX, knobY);
          ctx.strokeStyle = color;
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // Joystick knob (Thumb puck) with glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(knobX, knobY, 22, 0, Math.PI * 2);
        ctx.fillStyle = pDef.lightColor || '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Inner center pip
        ctx.beginPath();
        ctx.arc(knobX, knobY, 6, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.restore();
      }
    }

    // 2. Idle visual hints when no touches are active
    if (this.config.playerCount === 1 || this.isAdventure) {
      // In 1P / Adventure Mode: Display single corner anchor guide when idle
      if (!this.activePointers || this.activePointers.size === 0) {
        ctx.save();
        const baseCx = 75;
        const baseCy = this.V_HEIGHT - 75;

        ctx.beginPath();
        ctx.arc(baseCx, baseCy, 46, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.16)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 6]);
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🕹️', baseCx, baseCy - 6);

        ctx.font = 'bold 12px "Outfit", sans-serif';
        ctx.fillText('ลากเพื่อเดิน', baseCx, baseCy + 18);
        ctx.restore();
      }
    } else {
      // Multiplayer Corner Guides
      const corners = [
        { id: 0, cx: 75, cy: this.V_HEIGHT - 75, color: '#ef4444', label: 'P1' },
        { id: 1, cx: this.V_WIDTH - 75, cy: 75, color: '#3b82f6', label: 'P2' },
        { id: 2, cx: 75, cy: 75, color: '#eab308', label: 'P3' },
        { id: 3, cx: this.V_WIDTH - 75, cy: this.V_HEIGHT - 75, color: '#22c55e', label: 'P4' }
      ];

      for (let i = 0; i < this.config.playerCount; i++) {
        const c = corners[i];
        const pl = this.players[i];
        if (!pl || pl.isBot) continue;

        // Don't draw idle disc if player is currently touching
        let isTouching = false;
        if (this.activePointers) {
          for (const pt of this.activePointers.values()) {
            if (pt.pid === i) {
              isTouching = true;
              break;
            }
          }
        }
        if (isTouching) continue;

        ctx.save();
        ctx.fillStyle = `${c.color}22`;
        ctx.beginPath();
        ctx.arc(c.cx, c.cy, 48, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `${c.color}66`;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 5]);
        ctx.stroke();

        ctx.fillStyle = c.color;
        ctx.font = 'bold 18px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`👆 ${c.label}`, c.cx, c.cy);
        ctx.restore();
      }
    }
  }

  renderCountdown(ctx) {
    const W = this.V_WIDTH;
    const H = this.V_HEIGHT;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const count = Math.ceil(this.countdownTimer);
    const text = count > 0 ? (count === 1 ? 'READY...' : `${count}`) : 'START BATTLE!';
    const scale = 1 + (this.countdownTimer % 1) * 0.3;

    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#f59e0b';
    ctx.font = '900 64px "Outfit", sans-serif';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 20;
    ctx.fillText(text, 0, 0);
    ctx.restore();

    if (this.isAdventure) {
      const topicTitle = (this.currentTopicData && this.currentTopicData.name) || 'HSK 1 - บท 4';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Mali", sans-serif';
      ctx.fillText(`🗺️ โหมดผจญภัย: ${topicTitle}`, W / 2, H / 2 + 65);
      ctx.font = 'bold 15px "Mali", sans-serif';
      ctx.fillStyle = '#fef08a';
      ctx.fillText('🏃 ตอบถูก 5 แท่นตัวเลือกเพื่อผ่านด่านย่อย / ตอบผิดเริ่มด่าน 1 ใหม่ทันที!', W / 2, H / 2 + 95);
      ctx.font = 'bold 14px "Mali", sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`🎯 พิชิตให้ครบทั้ง ${this.adventureTotalStages} ด่านย่อย`, W / 2, H / 2 + 122);
    } else {
      const topicTitle = (this.currentTopicData && this.currentTopicData.name) || 'HSK 1 - บท 4';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px "Mali", sans-serif';
      ctx.fillText(`📚 ${topicTitle}`, W / 2, H / 2 + 65);
      ctx.font = 'bold 15px "Mali", sans-serif';
      ctx.fillText('🏃 วิ่งยึดแท่นสี & ชิงแท่นคำศัพท์ภาษาจีนเพื่อล็อกแท่นทองคำ!', W / 2, H / 2 + 92);

      if (this.config.botCount > 0) {
        const botDiff = this.config.botDifficulty || 'hard';
        const botProfile = BOT_DIFFICULTY_PROFILES[botDiff] || BOT_DIFFICULTY_PROFILES.hard;
        ctx.font = 'bold 14px "Mali", sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.fillText(`🤖 ระดับบอท: ${botProfile.name} (${botProfile.speed === 260 ? 'ความเร็วปกติ' : 'เดินช้า ' + Math.round((botProfile.speed / 260) * 100) + '%'})`, W / 2, H / 2 + 118);
      }
    }
    ctx.restore();
  }

  renderGameOver(ctx) {
    const W = this.V_WIDTH;
    const H = this.V_HEIGHT;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, 0, W, H);

    if (this.isAdventure) {
      const boxW = 540;
      const boxH = 400;
      const bx = W / 2 - boxW / 2;
      const by = H / 2 - boxH / 2;

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(bx, by, boxW, boxH, 20);
      ctx.fill();

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#fbbf24';
      ctx.font = '900 32px "Outfit", sans-serif';
      ctx.fillText(`🏆 ADVENTURE CLEARED! 🏆`, W / 2, by + 50);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 22px "Mali", sans-serif';
      ctx.fillText(`🎉 ผ่านครบทั้ง ${this.adventureTotalStages} ด่านย่อยสำเร็จ! 🎉`, W / 2, by + 90);

      // Stats card in canvas
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(bx + 40, by + 120, boxW - 80, 180, 14);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "Outfit", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`ด่านย่อยที่ผ่าน:`, bx + 65, by + 160);
      ctx.fillText(`เริ่มใหม่ทั้งหมด:`, bx + 65, by + 200);
      ctx.fillText(`เวลาที่ใช้:`, bx + 65, by + 240);
      ctx.fillText(`คะแนนสะสม:`, bx + 65, by + 280);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`${this.adventureTotalStages}/${this.adventureTotalStages} (100%)`, bx + boxW - 65, by + 160);
      ctx.fillStyle = this.adventureMistakes > 0 ? '#ef4444' : '#10b981';
      ctx.fillText(`${this.adventureMistakes} ครั้ง`, bx + boxW - 65, by + 200);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`${this.formatTime(this.matchTime)}`, bx + boxW - 65, by + 240);
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`${this.players[0] ? this.players[0].score : 0} pts`, bx + boxW - 65, by + 280);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px "Mali", sans-serif';
      ctx.fillText('กดปุ่มด้านล่างเพื่อเริ่มเกมใหม่ หรือกลับหน้าหลัก', W / 2, by + boxH - 30);

      ctx.restore();
      return;
    }

    // Sort players by score
    const ranked = [...this.players].sort((a, b) => (b.score || 0) - (a.score || 0) || (b.heldPads || 0) - (a.heldPads || 0));
    const winner = ranked[0];

    // Podium Box
    const boxW = 520;
    const boxH = 420;
    const bx = W / 2 - boxW / 2;
    const by = H / 2 - boxH / 2;

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(bx, by, boxW, boxH, 20);
    ctx.fill();

    ctx.strokeStyle = winner.color;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fbbf24';
    ctx.font = '900 32px "Outfit", sans-serif';
    ctx.fillText(`🏆 จบเกม! ครบ ${this.totalQuestions || this.pads.length} คำแล้ว 🏆`, W / 2, by + 50);

    ctx.fillStyle = winner.color;
    ctx.font = 'bold 24px "Mali", sans-serif';
    ctx.fillText(`🎉 ${winner.name} WINS! (${winner.score} PTS, ${winner.heldPads} PADS)`, W / 2, by + 95);

    // Score Table
    for (let r = 0; r < this.config.playerCount; r++) {
      const pl = ranked[r];
      const py = by + 150 + r * 42;

      ctx.fillStyle = `${pl.color}33`;
      ctx.beginPath();
      ctx.roundRect(bx + 40, py - 18, boxW - 80, 36, 10);
      ctx.fill();

      ctx.fillStyle = pl.color;
      ctx.font = 'bold 18px "Outfit", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`#${r + 1} ${pl.name}`, bx + 60, py + 4);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${pl.score} pts (${pl.heldPads} Pads)`, bx + boxW - 60, py + 4);
    }

    // Interactive Buttons Prompt
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px "Mali", sans-serif';
    ctx.fillText('กดปุ่มด้านล่างเพื่อเริ่มเกมใหม่ หรือกลับหน้าหลัก', W / 2, by + boxH - 30);

    ctx.restore();
  }

  showGameOverModal() {
    const modal = document.getElementById('arena-game-over-modal');
    if (!modal) return;

    if (this.isAdventure) {
      const titleEl = document.getElementById('arena-game-over-title');
      if (titleEl) titleEl.textContent = '🏆 ADVENTURE CLEARED! 🏆';

      const winnerTitle = document.getElementById('arena-winner-title');
      if (winnerTitle) {
        winnerTitle.textContent = `🎉 พิชิตด่าน ${this.currentTopicData.name} สำเร็จ! 🎉`;
        winnerTitle.style.color = '#10b981';
      }

      // Award adventure clear rewards to P1 profile
      const p1 = this.players[0];
      const p1User = p1 && p1.userId ? p1.userId : null;
      const advJade = 25;
      profileManager.addJade(advJade, p1User);
      if (p1User) {
        const uData = profileManager.loadUserData(p1User);
        if (uData) {
          if (!uData.arenaStats) uData.arenaStats = { matchesPlayed: 0, wins: 0, adventureCleared: [] };
          if (!uData.arenaStats.adventureCleared) uData.arenaStats.adventureCleared = [];
          if (!uData.arenaStats.adventureCleared.includes(this.config.topic)) {
            uData.arenaStats.adventureCleared.push(this.config.topic);
          }
          profileManager.saveUserData(uData);
          const active = profileManager.getActiveProfile();
          if (active && active.userId === p1User) {
            profileManager.activeProfile = uData;
            profileManager.notifyChange();
          }
        }
      }

      const podiumEl = document.getElementById('arena-podium-results');
      if (podiumEl) {
        podiumEl.innerHTML = `
          <div style="background: linear-gradient(135deg, #fef3c7, #fde047); border: 2px solid #f59e0b; border-radius: 12px; padding: 12px 16px; margin-bottom: 12px; text-align: center;">
            <div style="font-weight: 900; font-size: 1.15rem; color: #78350f;">🌟 ยอดเยี่ยมมาก! ตะลุยผ่านครบทุกด่านย่อยรวดเดียว 🌟</div>
            <div style="font-size: 0.88rem; color: #92400e; margin-top: 4px;">ทบทวนและจดจำคำศัพท์ ${this.currentTopicData.name} ได้ครบถ้วนสมบูรณ์ (+25 หยกเขียว)</div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 6px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 10px; text-align: center;">
              <div style="font-size: 0.8rem; color: #64748b; font-weight: 700;">🎯 ด่านย่อยที่ผ่าน</div>
              <div style="font-size: 1.25rem; color: #0f172a; font-weight: 900;">${this.adventureTotalStages}/${this.adventureTotalStages}</div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 10px; text-align: center;">
              <div style="font-size: 0.8rem; color: #64748b; font-weight: 700;">💔 พลาดเริ่มใหม่</div>
              <div style="font-size: 1.25rem; color: ${this.adventureMistakes > 0 ? '#ef4444' : '#10b981'}; font-weight: 900;">${this.adventureMistakes} ครั้ง</div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 10px; text-align: center;">
              <div style="font-size: 0.8rem; color: #64748b; font-weight: 700;">⏱️ เวลาที่ใช้</div>
              <div style="font-size: 1.25rem; color: #0f172a; font-weight: 900;">${this.formatTime(this.matchTime)}</div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 10px; text-align: center;">
              <div style="font-size: 0.8rem; color: #64748b; font-weight: 700;">⭐️ คะแนนสะสม</div>
              <div style="font-size: 1.25rem; color: #d97706; font-weight: 900;">${this.players[0] ? this.players[0].score : 0} pts</div>
            </div>
          </div>
        `;
      }

      modal.classList.remove('hidden');
      return;
    }

    const titleEl = document.getElementById('arena-game-over-title');
    if (titleEl) titleEl.textContent = '🏆 การประลองเสร็จสิ้น! 🏆';

    const ranked = [...this.players].sort((a, b) => (b.score || 0) - (a.score || 0) || (b.heldPads || 0) - (a.heldPads || 0));
    const winner = ranked[0];

    // Base rewards by finish rank: 1st=15, 2nd=10, 3rd=8, 4th=5
    const RANK_JADE_BASE = [15, 10, 8, 5];

    // Award jade and arena match stats per human player to their respective user profile!
    ranked.forEach((pl, rankIdx) => {
      if (pl.isBot) {
        pl.earnedJade = 0;
        return;
      }

      const baseJade = RANK_JADE_BASE[rankIdx] || 5;
      const scoreBonus = Math.floor((pl.score || 0) / 5);
      const totalJade = baseJade + scoreBonus;
      pl.earnedJade = totalJade;

      if (pl.userId) {
        // Save to specific user profile
        profileManager.addJade(totalJade, pl.userId);
        const uData = profileManager.loadUserData(pl.userId);
        if (uData) {
          if (!uData.arenaStats) uData.arenaStats = { matchesPlayed: 0, wins: 0, adventureCleared: [] };
          uData.arenaStats.matchesPlayed = (uData.arenaStats.matchesPlayed || 0) + 1;
          if (winner && winner.id === pl.id) {
            uData.arenaStats.wins = (uData.arenaStats.wins || 0) + 1;
          }
          if (uData.arenaStats.highScore == null || (pl.score || 0) > uData.arenaStats.highScore) {
            uData.arenaStats.highScore = pl.score || 0;
          }
          profileManager.saveUserData(uData);

          // If this user is currently active, sync activeProfile reference & update top bar
          const active = profileManager.getActiveProfile();
          if (active && active.userId === pl.userId) {
            profileManager.activeProfile = uData;
            profileManager.notifyChange();
          }
        }
      }
    });

    const winnerTitleEl = document.getElementById('arena-winner-title');
    if (winnerTitleEl && winner) {
      winnerTitleEl.textContent = `🎉 ${winner.displayName || winner.name} ชนะการประลอง! (${winner.score || 0} คะแนน, ${winner.heldPads || 0} ช่อง)`;
      winnerTitleEl.style.color = winner.color;
    }

    const rankMedals = ['🥇', '🥈', '🥉', '4️⃣'];
    const topicTitle = (this.currentTopicData && this.currentTopicData.name) || 'HSK 1 - บท 4';
    const podiumEl = document.getElementById('arena-podium-results');
    if (podiumEl) {
      podiumEl.innerHTML = `
        <div style="text-align: center; color: #b45309; font-weight: 800; font-size: 0.92rem; margin-bottom: 12px; background: #fef3c7; border: 2px solid #fde047; border-radius: 12px; padding: 10px 14px;">
          ✨ ทบทวนคำศัพท์ <strong>${topicTitle}</strong> เรียบร้อยแล้ว! (${this.totalQuestions || this.pads.length} คำ) ✨
        </div>
      ` + ranked.map((pl, idx) => {
        const medal = rankMedals[idx] || `#${idx + 1}`;
        const avatarDisplay = pl.isBot ? '🤖' : (pl.userAvatar || '👤');
        const charDisplay = pl.charIcon ? `${pl.charIcon}` : '';
        const jadeBadge = pl.isBot
          ? `<span class="arena-bot-badge">🤖 บอท</span>`
          : `<span class="podium-jade-badge">+${pl.earnedJade || 0} 💎 หยก (บันทึกแล้ว)</span>`;
        const subTitle = pl.isBot ? 'ผู้เล่น AI จำลอง' : (pl.userId ? `เซฟบัญชี: ${pl.displayName}` : 'ผู้เล่นทั่วไป (Guest)');

        return `
          <div class="podium-item-row" style="border-left: 5px solid ${pl.color};">
            <div class="podium-item-left">
              <div class="podium-item-rank">${medal}</div>
              <div class="podium-item-avatar" style="border-color: ${pl.lightColor};">${avatarDisplay}</div>
              <div class="podium-item-info">
                <div class="podium-player-name" style="color: ${pl.darkColor};">${pl.displayName || pl.name} ${charDisplay}</div>
                <div class="podium-player-sub">${subTitle}</div>
              </div>
            </div>
            <div class="podium-item-right">
              <div class="podium-score-val" style="color: ${pl.color};">${pl.score || 0} คะแนน (${pl.heldPads || 0} ช่อง)</div>
              ${jadeBadge}
            </div>
          </div>
        `;
      }).join('');
    }

    modal.classList.remove('hidden');
  }

  formatTime(sec) {
    const s = Math.max(0, Math.floor(sec));
    const mins = Math.floor(s / 60);
    const rem = s % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  }
}
