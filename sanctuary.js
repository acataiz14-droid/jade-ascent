/**
 * sanctuary.js
 * Taoist Sanctuary: Living Chinese Inn, Furnishing Upgrades, Mythical Pets, Hanzi Library, and Zen Garden
 * Inspired by Cozy Nest / Happy Street Dollhouse Living Simulation
 */

import { profileManager } from './auth.js';
import { ARENA_TOPICS } from './arena.js';
import { TaoistInn3D } from './sanctuary-3d.js';

// --- INN PROGRESSION LEVELS (5 TIERS) ---
export const INN_LEVELS = [
  {
    level: 1,
    name: 'เพิงน้ำชาไผ่เขียว (Bamboo Tea Shed)',
    icon: '🍵',
    rate: 1, // 1 jade per 30s base
    cost: 35,
    capacity: 2,
    unlockedFloors: 1,
    desc: 'ผลิต 1 หยก ทุก 30 วินาที • แขกพักได้ 2 คน'
  },
  {
    level: 2,
    name: 'โรงเตี๊ยมไม้โบราณ (Wooden Tea House)',
    icon: '🏡',
    rate: 2,
    cost: 75,
    capacity: 3,
    unlockedFloors: 2,
    desc: 'ผลิต 2 หยก ทุก 30 วินาที • แขกพักได้ 3 คน (เปิดชั้น 2 หอตำรา)'
  },
  {
    level: 3,
    name: 'ศาลาน้ำชาแปดทิศ (Bagua Pavilion)',
    icon: '🏯',
    rate: 4,
    cost: 160,
    capacity: 4,
    unlockedFloors: 2,
    desc: 'ผลิต 4 หยก ทุก 30 วินาที • แขกพักได้ 4 คน (ขยายหอตำรา)'
  },
  {
    level: 4,
    name: 'โรงเตี๊ยมสองชั้นริมสระบัว (Lotus Lakeside Inn)',
    icon: '🏮',
    rate: 7,
    cost: 320,
    capacity: 5,
    unlockedFloors: 3,
    desc: 'ผลิต 7 หยก ทุก 30 วินาที • แขกพักได้ 5 คน (เปิดชั้น 3 ห้องสมาธิ)'
  },
  {
    level: 5,
    name: 'พระราชวังสุราเซียน (Celestial Palace)',
    icon: '✨',
    rate: 12,
    cost: 'MAX',
    capacity: 6,
    unlockedFloors: 3,
    desc: 'ผลิต 12 หยก ทุก 30 วินาที • แขกพักได้สูงสุด 6 คน (ขั้นสูงสุด)'
  }
];

// --- ANTIQUE CHINESE FURNITURE CATALOG (3 UPGRADE TIERS EACH) ---
export const FURNITURE_CATALOG = [
  {
    id: 'tea_table',
    name: 'โต๊ะน้ำชาเซียน',
    title: 'Bagua Tea Table',
    floor: 1,
    floorName: 'ชั้น 1: โถงน้ำชา',
    desc: 'จุดรวมพลจิบชาสนทนาธรรม ดึงดูดน้องแพนด้าและแขกผู้มาเยือน',
    grades: [
      { tier: 1, name: 'โต๊ะน้ำชาไม้ไผ่เขียว (Bamboo Tea Table)', cost: 0, bonusRate: 0.5, icon: '🍵' },
      { tier: 2, name: 'โต๊ะไม้ประดู่โบราณ (Redwood Tea Table)', cost: 40, bonusRate: 1.5, icon: '🪑' },
      { tier: 3, name: 'โต๊ะหยกขาวแปดทิศ (White Jade Bagua Table)', cost: 110, bonusRate: 3.5, icon: '✨' }
    ]
  },
  {
    id: 'bookshelf',
    name: 'ชั้นวางตำราฮั่นจื้อ',
    title: 'Hanzi Bookshelf',
    floor: 2,
    floorName: 'ชั้น 2: หอตำรา',
    desc: 'คลังคัมภีร์เต๋าและตัวอักษรจีน ดึงดูดเซียนน้อยพู่กันมาศึกษา',
    grades: [
      { tier: 1, name: 'ชั้นวางคัมภีร์ไม้ไผ่ (Bamboo Scroll Rack)', cost: 30, bonusRate: 0.6, icon: '📚' },
      { tier: 2, name: 'ตู้คัมภีร์ลงรักปิดทอง (Gilded Scripture Shelf)', cost: 65, bonusRate: 1.8, icon: '📜' },
      { tier: 3, name: 'หอไตรปิฎกทองคำเซียน (Golden Grand Archive)', cost: 140, bonusRate: 4.2, icon: '🏛️' }
    ]
  },
  {
    id: 'cloud_bed',
    name: 'เตียงเมฆาเซียน',
    title: 'Celestial Cloud Bed',
    floor: 3,
    floorName: 'ชั้น 3: ห้องสมาธิ',
    desc: 'เตียงนอนนุ่มสบายดั่งปุยเมฆ ให้แขกนอนหลับฝันดีฟื้นฟูพลังปราณ',
    grades: [
      { tier: 1, name: 'เบาะฟางสมุนไพร (Herbal Straw Mat)', cost: 45, bonusRate: 0.8, icon: '🛏️' },
      { tier: 2, name: 'เตียงไม้โบราณมุ้งผ้าไหม (Silk-Draped Bed)', cost: 95, bonusRate: 2.2, icon: '🛋️' },
      { tier: 3, name: 'เตียงเมฆาสวรรค์เจ็ดสี (Rainbow Celestial Bed)', cost: 175, bonusRate: 4.8, icon: '☁️' }
    ]
  },
  {
    id: 'incense',
    name: 'กระถางกำยานหอม',
    title: 'Incense Censer',
    floor: 1,
    floorName: 'ชั้น 1: โถงน้ำชา',
    desc: 'ควันกำยานไม้กฤษณากลิ่นหอมฟุ้ง ชำระจิตใจและช่วยให้แขกผ่อนคลาย',
    grades: [
      { tier: 1, name: 'กระถางดินเผาธรรมดา (Clay Censer)', cost: 25, bonusRate: 0.4, icon: '💨' },
      { tier: 2, name: 'กระถางทองเหลืองลายมังกร (Dragon Brass Censer)', cost: 60, bonusRate: 1.4, icon: '🪔' },
      { tier: 3, name: 'กระถางหยกสลักเก้าทิศ (Nine-Realm Jade Censer)', cost: 125, bonusRate: 3.2, icon: '🔮' }
    ]
  },
  {
    id: 'lantern',
    name: 'โคมเต็งลั้งนำโชค',
    title: 'Auspicious Lanterns',
    floor: 2,
    floorName: 'ชั้น 2: หอตำรา',
    desc: 'โคมไฟมงคลส่องสว่าง ขับไล่ความมืดและนำพาโชคลาภตลอดคืน',
    grades: [
      { tier: 1, name: 'โคมกระดาษแดงมงคล (Red Paper Lantern)', cost: 20, bonusRate: 0.3, icon: '🏮' },
      { tier: 2, name: 'โคมผ้าไหมแปดทิศ (Bagua Silk Lantern)', cost: 50, bonusRate: 1.0, icon: '🏮' },
      { tier: 3, name: 'โคมผลึกแก้วสวรรค์ (Celestial Crystal Lantern)', cost: 110, bonusRate: 2.6, icon: '✨' }
    ]
  },
  {
    id: 'zither',
    name: 'กู่เจิงโบราณ',
    title: 'Ancient Zither',
    floor: 3,
    floorName: 'ชั้น 3: ห้องสมาธิ',
    desc: 'พิณโบราณบรรเลงเพลงกล่อมโรงเตี๊ยม ดึงดูดจิ้งจอกเก้าหางและเซียนดนตรี',
    grades: [
      { tier: 1, name: 'ผีผาไม้ธรรมดา (Wooden Pipa)', cost: 55, bonusRate: 1.0, icon: '🪕' },
      { tier: 2, name: 'กู่เจิงสายไหมเจ็ดสาย (Seven-String Zither)', cost: 115, bonusRate: 2.8, icon: '🎵' },
      { tier: 3, name: 'พิณหยกหงส์เพลิง (Phoenix Jade Zither)', cost: 210, bonusRate: 5.5, icon: '🎶' }
    ]
  }
];

// --- HOTEL & INN VOCABULARY QUESTS ---
export const HOTEL_INN_QUESTS = [
  {
    id: 'hotel_jiudian',
    word: { char: '酒店', pinyin: 'jiǔdiàn', english: 'Hotel', thai: 'โรงแรม' },
    question: 'คำว่า "โรงแรม (Hotel)" ในภาษาจีนคือคำใด?',
    options: [
      { text: '酒店 (jiǔdiàn)', correct: true },
      { text: '商店 (shāngdiàn)', correct: false },
      { text: '书店 (shūdiàn)', correct: false }
    ]
  },
  {
    id: 'hotel_fangjian',
    word: { char: '房间', pinyin: 'fángjiān', english: 'Room', thai: 'ห้องพัก / ห้อง' },
    question: 'สถานที่พักผ่อนของผู้เข้าพัก คำว่า "ห้องพัก / ห้อง (Room)" ในภาษาจีนคือคำใด?',
    options: [
      { text: '房间 (fángjiān)', correct: true },
      { text: '洗手间 (xǐshǒujiān)', correct: false },
      { text: '厨房 (chúfáng)', correct: false }
    ]
  },
  {
    id: 'hotel_yuding',
    word: { char: '预订', pinyin: 'yùdìng', english: 'Reservation / Book', thai: 'การจอง / จองล่วงหน้า' },
    question: 'การติดต่อล่วงหน้าเพื่อ "จองห้องพัก / การจอง (Reservation / Book)" ในภาษาจีนคือคำใด?',
    options: [
      { text: '预订 (yùdìng)', correct: true },
      { text: '准备 (zhǔnbèi)', correct: false },
      { text: '约定 (yuēdìng)', correct: false }
    ]
  },
  {
    id: 'hotel_ruzhu',
    word: { char: '入住', pinyin: 'rùzhù', english: 'Check in', thai: 'เช็คอิน / เข้าพัก' },
    question: 'เมื่อนักเดินทางมาถึงและต้องการ "เช็คอิน / เข้าพัก (Check in)" ในภาษาจีนคือคำใด?',
    options: [
      { text: '入住 (rùzhù)', correct: true },
      { text: '退房 (tuìfáng)', correct: false },
      { text: '出发 (chūfā)', correct: false }
    ]
  },
  {
    id: 'hotel_tuifang',
    word: { char: '退房', pinyin: 'tuìfáng', english: 'Check out', thai: 'เช็คเอาท์ / คืนห้องพัก' },
    question: 'เมื่อพักผ่อนครบกำหนดและต้องการ "เช็คเอาท์ / คืนห้องพัก (Check out)" ในภาษาจีนคือคำใด?',
    options: [
      { text: '退房 (tuìfáng)', correct: true },
      { text: '入住 (rùzhù)', correct: false },
      { text: '回家 (huí jiā)', correct: false }
    ]
  },
  {
    id: 'hotel_huzhao',
    word: { char: '护照', pinyin: 'hùzhào', english: 'Passport', thai: 'หนังสือเดินทาง / พาสปอร์ต' },
    question: 'เอกสารสำคัญใช้ยืนยันตัวตนตอนเข้าพัก "หนังสือเดินทาง / พาสปอร์ต (Passport)" ภาษาจีนคือคำใด?',
    options: [
      { text: '护照 (hùzhào)', correct: true },
      { text: '照片 (zhàopiàn)', correct: false },
      { text: '学生证 (xuéshēngzhèng)', correct: false }
    ]
  }
];

const MODIFIERS_INN_QUESTS = [
  {
    id: 'mod_zhong',
    word: { char: '重', pinyin: 'zhòng', english: 'Heavy', thai: 'หนัก' },
    question: 'กระเป๋าเดินทางใบนี้หนักมาก! คำว่า "Heavy (หนัก)" ในภาษาจีนคือคำใด?',
    options: [
      { text: '重 (zhòng)', correct: true },
      { text: '轻 (qīng)', correct: false },
      { text: '满 (mǎn)', correct: false }
    ]
  },
  {
    id: 'mod_qing',
    word: { char: '轻', pinyin: 'qīng', english: 'Light', thai: 'เบา' },
    question: 'ขนนกเซียนชิ้นนี้เบามาก! คำว่า "Light (เบา)" ในภาษาจีนคือคำใด?',
    options: [
      { text: '轻 (qīng)', correct: true },
      { text: '重 (zhòng)', correct: false },
      { text: '空 (kōng)', correct: false }
    ]
  },
  {
    id: 'mod_man',
    word: { char: '满', pinyin: 'mǎn', english: 'Full', thai: 'เต็ม' },
    question: 'รินน้ำชาจนเต็มถ้วยแล้ว! คำว่า "Full (เต็ม)" ในภาษาจีนคือคำใด?',
    options: [
      { text: '满 (mǎn)', correct: true },
      { text: '空 (kōng)', correct: false },
      { text: '大 (dà)', correct: false }
    ]
  },
  {
    id: 'mod_kong',
    word: { char: '空', pinyin: 'kōng', english: 'Empty', thai: 'ว่างเปล่า' },
    question: 'ห้องพักชั้นบนยังว่างอยู่! คำว่า "Empty (ว่างเปล่า)" ในภาษาจีนคือคำใด?',
    options: [
      { text: '空 (kōng)', correct: true },
      { text: '满 (mǎn)', correct: false },
      { text: '旧 (jiù)', correct: false }
    ]
  },
  {
    id: 'mod_xin',
    word: { char: '新', pinyin: 'xīn', english: 'New', thai: 'ใหม่' },
    question: 'ตำราเซียนเล่มใหม่เพิ่งมาถึง! คำว่า "New (ใหม่)" ในภาษาจีนคือคำใด?',
    options: [
      { text: '新 (xīn)', correct: true },
      { text: '旧 (jiù)', correct: false },
      { text: '小 (xiǎo)', correct: false }
    ]
  },
  {
    id: 'mod_jiu',
    word: { char: '旧', pinyin: 'jiù', english: 'Old', thai: 'เก่า' },
    question: 'คัมภีร์โบราณเล่มเก่าแก่! คำว่า "Old (เก่า)" ในภาษาจีนคือคำใด?',
    options: [
      { text: '旧 (jiù)', correct: true },
      { text: '新 (xīn)', correct: false },
      { text: '长 (cháng)', correct: false }
    ]
  },
  {
    id: 'mod_da',
    word: { char: '大', pinyin: 'dà', english: 'Big', thai: 'ใหญ่' },
    question: 'โถงโรงเตี๊ยมกว้างใหญ่ไพศาล! คำว่า "Big (ใหญ่)" ในภาษาจีนคือคำใด?',
    options: [
      { text: '大 (dà)', correct: true },
      { text: '小 (xiǎo)', correct: false },
      { text: '高 (gāo)', correct: false }
    ]
  },
  {
    id: 'mod_xiao',
    word: { char: '小', pinyin: 'xiǎo', english: 'Small', thai: 'เล็ก' },
    question: 'ถ้วยน้ำชาใบเล็กน่ารัก! คำว่า "Small (เล็ก)" ในภาษาจีนคือคำใด?',
    options: [
      { text: '小 (xiǎo)', correct: true },
      { text: '大 (dà)', correct: false },
      { text: '短 (duǎn)', correct: false }
    ]
  },
  {
    id: 'mod_chang',
    word: { char: '长', pinyin: 'cháng', english: 'Long', thai: 'ยาว' },
    question: 'สะพานไม้ไผ่ทอดยาวข้ามลำธาร! คำว่า "Long (ยาว)" ในภาษาจีนคือคำใด?',
    options: [
      { text: '长 (cháng)', correct: true },
      { text: '短 (duǎn)', correct: false },
      { text: '高 (gāo)', correct: false }
    ]
  },
  {
    id: 'mod_duan',
    word: { char: '短', pinyin: 'duǎn', english: 'Short', thai: 'สั้น' },
    question: 'พู่กันด้ามสั้นพกพาสะดวก! คำว่า "Short (สั้น)" ในภาษาจีนคือคำใด?',
    options: [
      { text: '短 (duǎn)', correct: true },
      { text: '长 (cháng)', correct: false },
      { text: '矮 (ǎi)', correct: false }
    ]
  },
  {
    id: 'mod_gao',
    word: { char: '高', pinyin: 'gāo', english: 'Tall / High', thai: 'สูง' },
    question: 'ยอดเขาเซียนสูงเสียดฟ้า! คำว่า "Tall / High (สูง)" ในภาษาจีนคือคำใด?',
    options: [
      { text: '高 (gāo)', correct: true },
      { text: '矮 (ǎi)', correct: false },
      { text: '大 (dà)', correct: false }
    ]
  },
  {
    id: 'mod_ai',
    word: { char: '矮', pinyin: 'ǎi', english: 'Short (height)', thai: 'เตี้ย' },
    question: 'โต๊ะน้ำชาตัวเตี้ยสำหรับนั่งพื้น! คำว่า "Short (height) (เตี้ย)" ในภาษาจีนคือคำใด?',
    options: [
      { text: '矮 (ǎi)', correct: true },
      { text: '高 (gāo)', correct: false },
      { text: '短 (duǎn)', correct: false }
    ]
  }
];

// --- LIVING TAOIST GUESTS & RESIDENTS ---
export const TAOIST_GUESTS = [
  {
    id: 'panda_disciple',
    name: 'น้องแพนด้าจอมขยัน',
    title: 'Panda Disciple',
    avatar: '🐼',
    color: '#10b981',
    favoriteFurniture: 'tea_table',
    floor: 1,
    quotes: [
      { zh: '欢迎光临我们的酒店！', py: 'huānyíng guānglín wǒmen de jiǔdiàn', th: 'ยินดีต้อนรับสู่โรงแรม/โรงเตี๊ยมของเรา!' },
      { zh: '这家酒店真漂亮。', py: 'zhè jiā jiǔdiàn zhēn piàoliang', th: 'โรงแรมนี้สวยงามจริง ๆ' },
      { zh: '茶很香，请慢用！', py: 'chá hěn xiāng, qǐng màn yòng', th: 'ชาหอมมาก เชิญดื่มตามสบายครับ!' },
      { zh: '谢谢掌柜！', py: 'xièxie zhǎngguì', th: 'ขอบคุณท่านเจ้าสำนัก!' }
    ],
    quest: {
      question: 'น้องแพนด้าอยากต้อนรับนักเดินทางสู่ "โรงแรม" ... คำว่า "โรงแรม / โรงเตี๊ยม (Hotel)" ภาษาจีนคือคำใด?',
      word: { char: '酒店', pinyin: 'jiǔdiàn', thai: 'โรงแรม / โรงเตี๊ยม (Hotel)' },
      options: [
        { text: '酒店 (jiǔdiàn)', correct: true },
        { text: '商店 (shāngdiàn)', correct: false },
        { text: '书店 (shūdiàn)', correct: false }
      ]
    }
  },
  {
    id: 'ink_scholar',
    name: 'เซียนน้อยพู่กัน',
    title: 'Ink Scholar',
    avatar: '🖌️',
    color: '#ec4899',
    favoriteFurniture: 'bookshelf',
    floor: 2,
    quotes: [
      { zh: '请问您有预订吗？', py: 'qǐngwèn nín yǒu yùdìng ma', th: 'ขอเรียนถามว่าท่านได้ทำการจองไว้ไหมครับ?' },
      { zh: '我想预订一间房。', py: 'wǒ xiǎng yùdìng yì jiān fáng', th: 'ฉันอยากจองห้องพักสักหนึ่งห้อง' },
      { zh: '预订成功了！', py: 'yùdìng chénggōng le', th: 'ทำการจองสำเร็จแล้ว!' },
      { zh: '学中文很有趣！', py: 'xué zhōngwén hěn yǒuqù', th: 'เรียนภาษาจีนสนุกจัง!' }
    ],
    quest: {
      question: 'เซียนน้อยพู่กันตรวจสอบรายชื่อผู้เข้าพัก ... คำว่า "การจอง / จองล่วงหน้า (Reservation / Book)" ภาษาจีนคือคำใด?',
      word: { char: '预订', pinyin: 'yùdìng', thai: 'การจอง / จองล่วงหน้า (Reservation / Book)' },
      options: [
        { text: '预订 (yùdìng)', correct: true },
        { text: '准备 (zhǔnbèi)', correct: false },
        { text: '约定 (yuēdìng)', correct: false }
      ]
    }
  },
  {
    id: 'cloud_monkey',
    name: 'วานรเมฆา',
    title: 'Cloud Monkey',
    avatar: '🐒',
    color: '#f59e0b',
    favoriteFurniture: 'incense',
    floor: 1,
    quotes: [
      { zh: '我想办理入住。', py: 'wǒ xiǎng bànlǐ rùzhù', th: 'ฉันต้องการทำเรื่องเช็คอินเข้าพัก' },
      { zh: '欢迎入住！', py: 'huānyíng rùzhù', th: 'ยินดีต้อนรับเข้าพัก!' },
      { zh: '今天天气真好！', py: 'jīntiān tiānqì zhēn hǎo', th: 'วันนี้อากาศดีมาก!' },
      { zh: '太好玩了！', py: 'tài hǎowán le', th: 'สนุกสุด ๆ ไปเลย!' }
    ],
    quest: {
      question: 'วานรเมฆาเพิ่งเดินทางมาถึงและอยาก "เช็คอินเข้าพัก" ... คำว่า "เช็คอิน / เข้าพัก (Check in)" ภาษาจีนคือคำใด?',
      word: { char: '入住', pinyin: 'rùzhù', thai: 'เช็คอิน / เข้าพัก (Check in)' },
      options: [
        { text: '入住 (rùzhù)', correct: true },
        { text: '退房 (tuìfáng)', correct: false },
        { text: '出发 (chūfā)', correct: false }
      ]
    }
  },
  {
    id: 'spirit_turtle',
    name: 'ปู่เต่าปรมาจารย์',
    title: 'Spirit Turtle',
    avatar: '🐢',
    color: '#3b82f6',
    favoriteFurniture: 'cloud_bed',
    floor: 2,
    quotes: [
      { zh: '请出示您的护照。', py: 'qǐng chūshì nín de hùzhào', th: 'โปรดแสดงหนังสือเดินทาง/พาสปอร์ตของท่าน' },
      { zh: '这是我的护照。', py: 'zhè shì wǒ de hùzhào', th: 'นี่คือหนังสือเดินทางของฉัน' },
      { zh: '随身带好护照。', py: 'suíshēn dài hǎo hùzhào', th: 'พกพาหนังสือเดินทางติดตัวไว้ให้ดี' },
      { zh: '心静自然凉。', py: 'xīn jìng zìrán liáng', th: 'ใจสงบ ย่อมเย็นสบาย' }
    ],
    quest: {
      question: 'ปู่เต่าขอตรวจสอบเอกสารระบุตัวตนก่อนเข้าพัก ... คำว่า "หนังสือเดินทาง / พาสปอร์ต (Passport)" ภาษาจีนคือคำใด?',
      word: { char: '护照', pinyin: 'hùzhào', thai: 'หนังสือเดินทาง / พาสปอร์ต (Passport)' },
      options: [
        { text: '护照 (hùzhào)', correct: true },
        { text: '照片 (zhàopiàn)', correct: false },
        { text: '学生证 (xuéshēngzhèng)', correct: false }
      ]
    }
  },
  {
    id: 'moon_bunny',
    name: 'แม่นางกระต่ายจันทร์',
    title: 'Moon Bunny',
    avatar: '🐰',
    color: '#ec4899',
    favoriteFurniture: 'zither',
    floor: 3,
    quotes: [
      { zh: '房间很干净整洁。', py: 'fángjiān hěn gānjìng zhěngjié', th: 'ห้องพักสะอาดและเป็นระเบียบเรียบร้อยมาก' },
      { zh: '您的房间在二楼。', py: 'nín de fángjiān zài èr lóu', th: 'ห้องพักของท่านอยู่ที่ชั้นสอง' },
      { zh: '月亮真漂亮。', py: 'yuèliang zhēn piàoliang', th: 'ดวงจันทร์สวยงามจริง ๆ' },
      { zh: '琴声悠扬。', py: 'qín shēng yōuyáng', th: 'เสียงพิณไพเราะก้องกังวาน' }
    ],
    quest: {
      question: 'แม่นางกระต่ายชวนนักเดินทางขึ้นไปพักผ่อนใน "ห้องพัก" ... คำว่า "ห้องพัก / ห้อง (Room)" ภาษาจีนคือคำใด?',
      word: { char: '房间', pinyin: 'fángjiān', thai: 'ห้องพัก / ห้อง (Room)' },
      options: [
        { text: '房间 (fángjiān)', correct: true },
        { text: '洗手间 (xǐshǒujiān)', correct: false },
        { text: '厨房 (chúfáng)', correct: false }
      ]
    }
  },
  {
    id: 'mystic_fox',
    name: 'จิ้งจอกเก้าหาง',
    title: 'Mystic Fox',
    avatar: '🦊',
    color: '#f97316',
    favoriteFurniture: 'lantern',
    floor: 3,
    quotes: [
      { zh: '我想办理退房。', py: 'wǒ xiǎng bànlǐ tuìfáng', th: 'ฉันต้องการทำเรื่องเช็คเอาท์คืนห้องพัก' },
      { zh: '请问几点退房？', py: 'qǐngwèn jǐ diǎn tuìfáng', th: 'ขอสอบถามว่าต้องเช็คเอาท์กี่โมงคะ?' },
      { zh: '退房手续办好了。', py: 'tuìfáng shǒuxù bàn hǎo le', th: 'ทำเรื่องเช็คเอาท์เรียบร้อยแล้วค่ะ' },
      { zh: '今天真开心！', py: 'jīntiān zhēn kāixīn', th: 'วันนี้มีความสุขจัง!' }
    ],
    quest: {
      question: 'จิ้งจอกน้อยพักผ่อนครบกำหนดแล้วและต้องการแจ้ง "เช็คเอาท์ / คืนห้องพัก (Check out)" ... คำนี้ภาษาจีนคือคำใด?',
      word: { char: '退房', pinyin: 'tuìfáng', thai: 'เช็คเอาท์ / คืนห้องพัก (Check out)' },
      options: [
        { text: '退房 (tuìfáng)', correct: true },
        { text: '入住 (rùzhù)', correct: false },
        { text: '回家 (huí jiā)', correct: false }
      ]
    }
  }
];

// --- MYTHICAL PETS ---
export const MYTHICAL_PETS = [
  {
    id: 'baby_panda',
    name: 'ลูกแพนด้าน้อย',
    title: 'Baby Panda',
    emoji: '🐼',
    cost: 0,
    buffDesc: 'เพิ่มแต้มหยกที่ได้รับจากการเล่น +25%',
    flavor: 'แพนด้าน้อยผู้น่ารัก รักไผ่เขียวและมอบโชคลาภทางการเงิน'
  },
  {
    id: 'crane',
    name: 'นกกระเรียนสวรรค์',
    title: 'Celestial Crane',
    emoji: '🪿',
    cost: 80,
    buffDesc: 'เพิ่มพลังกระโดดสูงขึ้น 12% ในโหมดไต่เขาและวิ่ง',
    flavor: 'นกกระเรียนผู้สง่างามแห่งยอดเขาสวรรค์ โผบินเหนือเมฆา'
  },
  {
    id: 'qilin',
    name: 'กิเลนทองคำ',
    title: 'Golden Qilin',
    emoji: '🦄',
    cost: 180,
    buffDesc: 'โรงเตี๊ยมผลิตหยกเร็วขึ้นเป็น 2 เท่า (x2 Idle Jade)!',
    flavor: 'สัตว์มงคลโบราณ นำพาความเจริญรุ่งเรืองสู่โรงเตี๊ยม'
  },
  {
    id: 'turtle',
    name: 'ปู่เต่าทองคำพันปี',
    title: 'Spirit Turtle',
    emoji: '🐢',
    cost: 280,
    buffDesc: 'เพิ่มพลังชีวิตเริ่มต้น +1 หัวใจในทุกโหมดการเล่น',
    flavor: 'ผู้รอบรู้แห่งเต๋า กายาแข็งแกร่งดั่งหินผาพันปี'
  }
];

// --- ZEN GARDEN DECORATIONS ---
export const GARDEN_DECORATIONS = [
  { id: 'lantern', name: 'โคมไฟมงคลแปดทิศ', icon: '🏮', cost: 25, desc: 'ส่องสว่างนำทางโชคลาภยามค่ำคืน' },
  { id: 'peach_tree', name: 'ต้นท้อสวรรค์พันปี', icon: '🌸', cost: 60, desc: 'ผลท้อแห่งความเป็นอมตะ บานสะพรั่งงดงาม' },
  { id: 'lotus_pond', name: 'สระบัวมังกรหยก', icon: '🪷', cost: 110, desc: 'น้ำใสกระจ่าง ดอกบัวผลิบานส่งกลิ่นหอม' },
  { id: 'dragon_gate', name: 'ซุ้มประตูมังกรทอง', icon: '⛩️', cost: 180, desc: 'ซุ้มประตูศักดิ์สิทธิ์สู่แดนสวรรค์' },
  { id: 'stone_table', name: 'โต๊ะหินหมากรุกเต๋า', icon: '🪨', cost: 70, desc: 'ที่พักผ่อนดื่มด่ำสนทนาธรรมกับเซียน' }
];

// ============================================================
// SANCTUARY MANAGER CLASS
// ============================================================
export class SanctuaryManager {
  constructor() {
    this.activeTab = 'inn'; // 'inn' | 'furnishing' | 'pets' | 'garden' | 'archive'
    this.currentInnStage = 'modifiers'; // 'modifiers' | 'hotel'
    this.currentArchiveTopic = 'all';
    this.harvestTimer = null;
    this.questTimer = null;
    this.onExitCallback = null;

    // Active guest state for the living dollhouse
    this.guestState = [];
    this.currentActiveQuest = null;
    this.inn3D = null;
  }

  init(onExit) {
    this.onExitCallback = onExit;
    this.setupUI();
    this.refreshGuestRoster();
    this.render();

    // Start tick for idle jade harvesting animation (every 2s)
    if (this.harvestTimer) clearInterval(this.harvestTimer);
    this.harvestTimer = setInterval(() => {
      this.updateHarvestButton();
    }, 2000);

    // Random quest ticker (every 25s, randomly gives one guest a quest)
    if (this.questTimer) clearInterval(this.questTimer);
    this.questTimer = setInterval(() => {
      this.maybeSpawnQuest();
    }, 25000);
  }

  destroy() {
    if (this.harvestTimer) {
      clearInterval(this.harvestTimer);
      this.harvestTimer = null;
    }
    if (this.questTimer) {
      clearInterval(this.questTimer);
      this.questTimer = null;
    }
    if (this.inn3D) {
      this.inn3D.dispose();
      this.inn3D = null;
    }
  }

  getProfile() {
    return profileManager.getActiveProfile();
  }

  getSanctuaryData() {
    const p = this.getProfile();
    if (!p) return null;
    if (!p.sanctuary) {
      p.sanctuary = {
        innLevel: 1,
        lastHarvestTime: Date.now(),
        unlockedPets: ['baby_panda'],
        activePet: 'baby_panda',
        decorations: ['lantern'],
        furniture: {
          tea_table: 1,
          bookshelf: 1,
          cloud_bed: 0,
          incense: 1,
          lantern: 1,
          zither: 0
        },
        learnedVocab: []
      };
      profileManager.saveUserData(p);
    }
    // Backward compatibility for furniture
    if (!p.sanctuary.furniture) {
      p.sanctuary.furniture = {
        tea_table: 1,
        bookshelf: 1,
        cloud_bed: 0,
        incense: 1,
        lantern: 1,
        zither: 0
      };
      profileManager.saveUserData(p);
    }
    return p.sanctuary;
  }

  // Calculate total jade production rate per 30 seconds
  calculateProductionRate() {
    const s = this.getSanctuaryData();
    if (!s) return { ratePer30s: 1, ratePerMin: 2 };

    const innCfg = INN_LEVELS.find(l => l.level === s.innLevel) || INN_LEVELS[0];
    let total30s = innCfg.rate;

    // Add bonuses from placed/upgraded furniture
    FURNITURE_CATALOG.forEach(f => {
      const currentTier = (s.furniture && s.furniture[f.id]) || 0;
      if (currentTier > 0) {
        const gradeCfg = f.grades.find(g => g.tier === currentTier);
        if (gradeCfg) {
          total30s += gradeCfg.bonusRate;
        }
      }
    });

    // Qilin Pet bonus: 2x rate
    if (s.activePet === 'qilin') {
      total30s *= 2.0;
    }

    return {
      ratePer30s: total30s,
      ratePerMin: total30s * 2
    };
  }

  calculatePendingJade() {
    const s = this.getSanctuaryData();
    if (!s) return 0;

    const { ratePer30s } = this.calculateProductionRate();
    const now = Date.now();
    const elapsedSec = Math.max(0, (now - (s.lastHarvestTime || now)) / 1000);

    // Max 4 hours of offline storage (14,400 seconds)
    const cappedSec = Math.min(elapsedSec, 14400);
    const ratePerSec = ratePer30s / 30;
    return Math.floor(cappedSec * ratePerSec);
  }

  harvestJade() {
    const pending = this.calculatePendingJade();
    if (pending <= 0) return 0;

    const s = this.getSanctuaryData();
    s.lastHarvestTime = Date.now();
    profileManager.saveUserData(this.getProfile());

    const gained = profileManager.addJade(pending);
    this.render();
    return gained;
  }

  upgradeInn() {
    const s = this.getSanctuaryData();
    if (!s) return false;

    const currentLvl = s.innLevel || 1;
    const nextCfg = INN_LEVELS.find(l => l.level === currentLvl + 1);
    if (!nextCfg || nextCfg.cost === 'MAX') return false;

    if (profileManager.spendJade(nextCfg.cost)) {
      s.innLevel = currentLvl + 1;
      profileManager.saveUserData(this.getProfile());
      this.refreshGuestRoster();
      this.render();
      return true;
    }
    return false;
  }

  upgradeFurniture(furnitureId) {
    const s = this.getSanctuaryData();
    if (!s) return false;

    const item = FURNITURE_CATALOG.find(f => f.id === furnitureId);
    if (!item) return false;

    const currentTier = (s.furniture && s.furniture[furnitureId]) || 0;
    const nextGrade = item.grades.find(g => g.tier === currentTier + 1);
    if (!nextGrade) return false;

    if (profileManager.spendJade(nextGrade.cost)) {
      if (!s.furniture) s.furniture = {};
      s.furniture[furnitureId] = currentTier + 1;
      profileManager.saveUserData(this.getProfile());
      this.render();
      return true;
    }
    return false;
  }

  refreshGuestRoster() {
    const s = this.getSanctuaryData();
    if (!s) return;

    const innCfg = INN_LEVELS.find(l => l.level === s.innLevel) || INN_LEVELS[0];
    const capacity = innCfg.capacity || 2;
    const unlockedFloors = innCfg.unlockedFloors || 1;

    // Filter guests suitable for unlocked floors
    const candidates = TAOIST_GUESTS.filter(g => g.floor <= unlockedFloors);
    const chosen = candidates.slice(0, capacity);
    const questPool = this.currentInnStage === 'modifiers' ? MODIFIERS_INN_QUESTS : HOTEL_INN_QUESTS;

    this.guestState = chosen.map((g, idx) => {
      const stageQuest = questPool[idx % questPool.length];
      return {
        ...g,
        quoteIndex: idx % g.quotes.length,
        quest: {
          question: `${g.name}: "${stageQuest.question}"`,
          word: stageQuest.word,
          options: stageQuest.options
        },
        hasQuest: idx === 0 // Start first guest with a friendly quest!
      };
    });
  }

  maybeSpawnQuest() {
    if (!this.guestState || this.guestState.length === 0) return;
    const available = this.guestState.filter(g => !g.hasQuest);
    const questPool = this.currentInnStage === 'modifiers' ? MODIFIERS_INN_QUESTS : HOTEL_INN_QUESTS;
    if (available.length > 0) {
      const pick = available[Math.floor(Math.random() * available.length)];
      const qConfig = questPool[Math.floor(Math.random() * questPool.length)];
      pick.quest = {
        question: `${pick.name}: "${qConfig.question}"`,
        word: qConfig.word,
        options: qConfig.options
      };
      pick.hasQuest = true;
      if (this.activeTab === 'inn') {
        this.render();
      }
    }
  }

  unlockPet(petId) {
    const pet = MYTHICAL_PETS.find(p => p.id === petId);
    if (!pet) return false;

    const s = this.getSanctuaryData();
    if (s.unlockedPets.includes(petId)) return false;

    if (pet.cost === 0 || profileManager.spendJade(pet.cost)) {
      s.unlockedPets.push(petId);
      s.activePet = petId;
      profileManager.saveUserData(this.getProfile());
      this.render();
      return true;
    }
    return false;
  }

  setActivePet(petId) {
    const s = this.getSanctuaryData();
    if (!s || !s.unlockedPets.includes(petId)) return false;
    s.activePet = petId;
    profileManager.saveUserData(this.getProfile());
    this.render();
    return true;
  }

  buyDecoration(decId) {
    const dec = GARDEN_DECORATIONS.find(d => d.id === decId);
    if (!dec) return false;

    const s = this.getSanctuaryData();
    if (s.decorations.includes(decId)) return false;

    if (profileManager.spendJade(dec.cost)) {
      s.decorations.push(decId);
      profileManager.saveUserData(this.getProfile());
      this.render();
      return true;
    }
    return false;
  }

  setupUI() {
    // Tab switching
    const tabBtns = document.querySelectorAll('.sanctuary-nav-btn');
    tabBtns.forEach(btn => {
      btn.onclick = () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.getAttribute('data-tab');
        this.render();
      };
    });

    const btnBack = document.getElementById('btn-sanctuary-back');
    if (btnBack) {
      btnBack.onclick = () => {
        this.destroy();
        if (this.onExitCallback) this.onExitCallback();
      };
    }

    const btnCloseQuest = document.getElementById('btn-close-quest-modal');
    if (btnCloseQuest) {
      btnCloseQuest.onclick = () => {
        document.getElementById('sanctuary-quest-modal').classList.add('hidden');
      };
    }
  }

  updateHarvestButton() {
    const btn = document.getElementById('btn-harvest-jade');
    if (!btn) return;
    const pending = this.calculatePendingJade();
    btn.innerHTML = `<span>🏮 เก็บเกี่ยวหยกเซียน (<strong>+${pending}</strong> 🟢)</span>`;
    if (pending > 0) {
      btn.classList.add('pulse-glow');
    } else {
      btn.classList.remove('pulse-glow');
    }
  }

  speakChinese(text) {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('SpeechSynthesis notice:', e);
      }
    }
  }

  openGuestQuestModal(guest) {
    const modal = document.getElementById('sanctuary-quest-modal');
    if (!modal || !guest || !guest.quest) return;

    const avatarEl = document.getElementById('quest-guest-avatar');
    const nameEl = document.getElementById('quest-guest-name');
    const questionEl = document.getElementById('quest-question-text');
    const optionsEl = document.getElementById('quest-options-container');

    if (avatarEl) avatarEl.textContent = guest.avatar;
    if (nameEl) nameEl.textContent = `${guest.name} (${guest.title})`;
    if (questionEl) questionEl.textContent = guest.quest.question;

    if (optionsEl) {
      optionsEl.innerHTML = guest.quest.options.map((opt, idx) => `
        <button class="quest-option-btn" data-correct="${opt.correct}">
          <span class="quest-opt-num">${idx + 1}</span>
          <span class="quest-opt-text">${opt.text}</span>
        </button>
      `).join('');

      optionsEl.querySelectorAll('.quest-option-btn').forEach(btn => {
        btn.onclick = () => {
          const isCorrect = btn.getAttribute('data-correct') === 'true';
          if (isCorrect) {
            btn.classList.add('correct');
            const rewardJade = 12;
            profileManager.addJade(rewardJade);

            // Record learned vocab
            if (guest.quest.word && guest.quest.word.char) {
              profileManager.recordLearnedVocab(guest.quest.word.char);
            }

            // Speak Chinese word
            this.speakChinese(guest.quest.word.char);

            // Remove quest flag
            guest.hasQuest = false;

            setTimeout(() => {
              modal.classList.add('hidden');
              alert(`🎉 ยอดเยี่ยมมาก! ตอบถูกต้อง ได้รับ +${rewardJade} หยกเขียว 🟢 และบันทึกคำศัพท์ "${guest.quest.word.char}" ลงคลังตำราแล้ว!`);
              this.render();
            }, 400);
          } else {
            btn.classList.add('wrong');
            setTimeout(() => btn.classList.remove('wrong'), 800);
            alert('ยังไม่ถูกต้องครับ ลองอ่านตัวเลือกอีกครั้งนะ 🌱');
          }
        };
      });
    }

    modal.classList.remove('hidden');
  }

  render() {
    const profile = this.getProfile();
    const sanctuary = this.getSanctuaryData();
    if (!profile || !sanctuary) return;

    // Header Jade Badge
    const jadeEl = document.getElementById('sanctuary-jade-display');
    if (jadeEl) jadeEl.textContent = profile.jade || 0;

    // Active Pet Badge
    const activePetCfg = MYTHICAL_PETS.find(p => p.id === sanctuary.activePet) || MYTHICAL_PETS[0];
    const petBadgeEl = document.getElementById('sanctuary-active-pet-display');
    if (petBadgeEl) {
      petBadgeEl.innerHTML = `${activePetCfg.emoji} <strong>${activePetCfg.name}</strong> (${activePetCfg.buffDesc})`;
    }

    const container = document.getElementById('sanctuary-tab-content');
    if (!container) return;

    // Dispose 3D scene if leaving inn tab
    if (this.activeTab !== 'inn' && this.inn3D) {
      this.inn3D.dispose();
      this.inn3D = null;
    }

    if (this.activeTab === 'inn') {
      this.renderInnTab(container, sanctuary, profile);
    } else if (this.activeTab === 'furnishing') {
      this.renderFurnishingTab(container, sanctuary, profile);
    } else if (this.activeTab === 'pets') {
      this.renderPetsTab(container, sanctuary, profile);
    } else if (this.activeTab === 'garden') {
      this.renderGardenTab(container, sanctuary, profile);
    } else if (this.activeTab === 'archive') {
      this.renderArchiveTab(container, sanctuary);
    }
  }

  // --- TAB 1: LIVING TAOIST INN (2.5D ISOMETRIC 3D SIMULATION) ---
  renderInnTab(container, s, p) {
    if (this.inn3D) {
      this.inn3D.dispose();
      this.inn3D = null;
    }

    const currentCfg = INN_LEVELS.find(l => l.level === s.innLevel) || INN_LEVELS[0];
    const nextCfg = INN_LEVELS.find(l => l.level === s.innLevel + 1);
    const pending = this.calculatePendingJade();
    const { ratePerMin } = this.calculateProductionRate();
    const activePetCfg = MYTHICAL_PETS.find(pet => pet.id === s.activePet) || MYTHICAL_PETS[0];

    container.innerHTML = `
      <div class="living-inn-wrapper">
        <!-- Top Prosperity Strip -->
        <div class="inn-stats-bar">
          <div class="inn-stat-pill">
            <span class="stat-icon">${currentCfg.icon}</span>
            <div class="stat-text-wrap">
              <div class="stat-label">ระดับโรงเตี๊ยม</div>
              <div class="stat-value">Lv.${currentCfg.level} - ${currentCfg.name.split('(')[0]}</div>
            </div>
          </div>
          <div class="inn-stat-pill">
            <span class="stat-icon">👥</span>
            <div class="stat-text-wrap">
              <div class="stat-label">แขกเซียนผู้มาเยือน</div>
              <div class="stat-value">${this.guestState.length} / ${currentCfg.capacity} คน</div>
            </div>
          </div>
          <div class="inn-stat-pill highlight">
            <span class="stat-icon">🟢</span>
            <div class="stat-text-wrap">
              <div class="stat-label">อัตราผลิตหยก</div>
              <div class="stat-value">+${ratePerMin.toFixed(1)} หยก / นาที</div>
            </div>
          </div>
          <div class="inn-stat-pill" style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            <span style="font-size:0.8rem; font-weight:700; color:#475569;">📚 ด่านคำถามโรงเตี๊ยม:</span>
            <button type="button" class="inn-stage-switch-btn" data-inn-stage="modifiers" style="padding:4px 10px; border-radius:999px; border:2px solid ${this.currentInnStage === 'modifiers' ? '#0d9488' : '#cbd5e1'}; background:${this.currentInnStage === 'modifiers' ? '#ccfbf1' : '#ffffff'}; color:${this.currentInnStage === 'modifiers' ? '#0f766e' : '#475569'}; font-weight:800; font-size:0.8rem; cursor:pointer;">⚖️ คำขยายความ</button>
            <button type="button" class="inn-stage-switch-btn" data-inn-stage="hotel" style="padding:4px 10px; border-radius:999px; border:2px solid ${this.currentInnStage === 'hotel' ? '#10b981' : '#cbd5e1'}; background:${this.currentInnStage === 'hotel' ? '#d1fae5' : '#ffffff'}; color:${this.currentInnStage === 'hotel' ? '#065f46' : '#475569'}; font-weight:800; font-size:0.8rem; cursor:pointer;">🏨 โรงแรม</button>
          </div>
        </div>

        <!-- 2.5D Isometric Taoist Inn 3D Simulation Viewport -->
        <div class="inn-3d-viewport-container" id="inn-3d-viewport">
          <canvas id="inn-3d-canvas" class="inn-3d-canvas"></canvas>
          <div id="inn-3d-overlays" class="inn-3d-overlays"></div>

          <!-- Top-Left Title Badge -->
          <div class="inn-3d-title-badge">
            <span class="badge-icon">🏯</span>
            <div class="badge-texts">
              <span class="badge-inn-name">โรงเตี๊ยมเซียนเต๋า (${currentCfg.name.split('(')[0]})</span>
              <span class="badge-mode-tag">✨ 2.5D Isometric World</span>
            </div>
          </div>

          <!-- Camera Rail Overlay Controls (Cozy Nest style) -->
          <div class="inn-3d-cam-rail">
            <div class="cam-rail-group">
              <button id="cam-btn-f1" class="cam-rail-btn" title="โฟกัสชั้น 1 (โถงน้ำชา)">1F โถงน้ำชา</button>
              ${s.innLevel >= 2 ? `<button id="cam-btn-f2" class="cam-rail-btn" title="โฟกัสชั้น 2 (หอตำรา)">2F หอตำรา</button>` : ''}
              ${s.innLevel >= 4 ? `<button id="cam-btn-f3" class="cam-rail-btn" title="โฟกัสชั้น 3 (พิณเมฆา)">3F พิณเมฆา</button>` : ''}
              <button id="cam-btn-all" class="cam-rail-btn active" title="มุมมองทั้งโรงเตี๊ยม">👁️ ทั้งหมด</button>
            </div>
            <div class="cam-rail-group">
              <button id="cam-btn-zoomin" class="cam-rail-btn icon-only" title="ซูมเข้า">➕</button>
              <button id="cam-btn-zoomout" class="cam-rail-btn icon-only" title="ซูมออก">➖</button>
              <button id="cam-btn-reset" class="cam-rail-btn icon-only" title="รีเซ็ตมุมมอง">🔄</button>
            </div>
          </div>

          <!-- Bottom Interaction Hint -->
          <div class="inn-3d-hint-pill">
            <span>🖱️ ลากเมาส์/นิ้วเพื่อหมุน • ซูมเข้าออกได้ • แตะที่แขกเซียนเพื่อฟังเสียงหรือรับภารกิจ 📜</span>
          </div>
        </div>

        <!-- Harvest & Upgrade Controls Bar -->
        <div class="inn-controls-card">
          <div class="harvest-section">
            <div class="harvest-meta">
              <span class="harvest-title">หยกเซียนพร้อมเก็บเกี่ยว</span>
              <span class="harvest-count">🟢 ${pending}</span>
            </div>
            <button id="btn-harvest-jade" class="btn btn-primary btn-harvest ${pending > 0 ? 'pulse-glow' : ''}">
              <span>🏮 เก็บเกี่ยวหยกเซียน (+${pending} 🟢)</span>
            </button>
          </div>

          <div class="upgrade-section">
            ${nextCfg ? `
              <div class="upgrade-info">
                <div class="upgrade-next-title">ขั้นถัดไป: Level ${nextCfg.level} - ${nextCfg.name.split('(')[0]}</div>
                <div class="upgrade-desc">${nextCfg.desc} (ค่าอัปเกรด: <strong>🟢 ${nextCfg.cost}</strong> หยก)</div>
              </div>
              <button id="btn-upgrade-inn" class="btn btn-secondary ${p.jade < nextCfg.cost ? 'disabled' : ''}">
                <span>⚡ อัปเกรดโรงเตี๊ยม</span>
              </button>
            ` : `
              <div class="upgrade-max-badge">
                🏆 <strong>โรงเตี๊ยมได้รับการอัปเกรดสู่ขั้นสูงสุด (Celestial Palace) แล้ว!</strong>
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    // Event Bindings for Harvest & Upgrade
    container.querySelectorAll('.inn-stage-switch-btn').forEach(btn => {
      btn.onclick = () => {
        const st = btn.getAttribute('data-inn-stage') || 'modifiers';
        this.currentInnStage = st;
        this.refreshGuestRoster();
        this.render();
      };
    });

    const harvestBtn = document.getElementById('btn-harvest-jade');
    if (harvestBtn) {
      harvestBtn.onclick = () => {
        const gained = this.harvestJade();
        if (gained > 0) {
          alert(`🎉 เก็บเกี่ยวสำเร็จ! ได้รับ ${gained} หยกเขียวเข้ากระเป๋าเรียบร้อย 🟢`);
        } else {
          alert('โรงเตี๊ยมกำลังผลิตหยกอยู่... โปรดกลับมาเก็บใหม่อีกสักครู่ครับ ⏳');
        }
      };
    }

    const upgradeBtn = document.getElementById('btn-upgrade-inn');
    if (upgradeBtn) {
      upgradeBtn.onclick = () => {
        if (this.upgradeInn()) {
          alert('✨ ยินดีด้วย! โรงเตี๊ยมได้รับการอัปเกรดสู่ระดับใหม่เรียบร้อยแล้ว!');
        } else {
          alert('หยกเขียวไม่เพียงพอสำหรับการอัปเกรดครับ');
        }
      };
    }

    // Initialize 2.5D Isometric 3D Living Inn
    requestAnimationFrame(() => {
      const vpContainer = document.getElementById('inn-3d-viewport');
      const vpCanvas = document.getElementById('inn-3d-canvas');
      const vpOverlays = document.getElementById('inn-3d-overlays');

      if (vpContainer && vpCanvas && vpOverlays) {
        this.inn3D = new TaoistInn3D({
          container: vpContainer,
          canvas: vpCanvas,
          overlays: vpOverlays,
          sanctuaryData: s,
          guestState: this.guestState,
          activePet: activePetCfg,
          furnitureCatalog: FURNITURE_CATALOG,
          onSpeakChinese: (zh) => this.speakChinese(zh),
          onOpenQuest: (guest) => this.openGuestQuestModal(guest),
          onGuestClick: (guest) => {
            // Reward +1 jade on normal guest chat
            profileManager.addJade(1);
            const jadeEl = document.getElementById('sanctuary-jade-display');
            if (jadeEl) jadeEl.textContent = this.getProfile().jade;
          },
          onPetClick: () => {
            // Pet interaction tip
            profileManager.addJade(1);
            const jadeEl = document.getElementById('sanctuary-jade-display');
            if (jadeEl) jadeEl.textContent = this.getProfile().jade;
          }
        });

        // Camera Rail Buttons
        const setCamActive = (activeId) => {
          ['cam-btn-f1', 'cam-btn-f2', 'cam-btn-f3', 'cam-btn-all'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.toggle('active', id === activeId);
          });
        };

        const btnF1 = document.getElementById('cam-btn-f1');
        const btnF2 = document.getElementById('cam-btn-f2');
        const btnF3 = document.getElementById('cam-btn-f3');
        const btnAll = document.getElementById('cam-btn-all');
        const btnZoomIn = document.getElementById('cam-btn-zoomin');
        const btnZoomOut = document.getElementById('cam-btn-zoomout');
        const btnReset = document.getElementById('cam-btn-reset');

        if (btnF1) btnF1.onclick = () => { this.inn3D?.focusFloor(1); setCamActive('cam-btn-f1'); };
        if (btnF2) btnF2.onclick = () => { this.inn3D?.focusFloor(2); setCamActive('cam-btn-f2'); };
        if (btnF3) btnF3.onclick = () => { this.inn3D?.focusFloor(3); setCamActive('cam-btn-f3'); };
        if (btnAll) btnAll.onclick = () => { this.inn3D?.resetView(); setCamActive('cam-btn-all'); };
        if (btnZoomIn) btnZoomIn.onclick = () => this.inn3D?.zoomIn();
        if (btnZoomOut) btnZoomOut.onclick = () => this.inn3D?.zoomOut();
        if (btnReset) btnReset.onclick = () => { this.inn3D?.resetView(); setCamActive('cam-btn-all'); };
      }
    });
  }

  // --- TAB 2: CHINESE ANTIQUE FURNISHINGS ---
  renderFurnishingTab(container, s, p) {
    container.innerHTML = `
      <div class="furnishing-tab-view">
        <div class="furnishing-header-banner">
          <div class="furnishing-header-icon">🪑</div>
          <div>
            <h3 class="furnishing-header-title">เครื่องเรือน & จัดตกแต่งโรงเตี๊ยมโบราณ</h3>
            <p class="furnishing-header-sub">ติดตั้งและอัปเกรดเครื่องเรือนเซียนเพื่อเพิ่มความสะดวกสบาย ความน่าอยู่ และเร่งผลผลิตหยก 3 ระดับ</p>
          </div>
        </div>

        <div class="furnishing-grid">
          ${FURNITURE_CATALOG.map(item => {
            const currentTier = (s.furniture && s.furniture[item.id]) || 0;
            const currentGradeCfg = item.grades.find(g => g.tier === currentTier) || null;
            const nextGradeCfg = item.grades.find(g => g.tier === currentTier + 1) || null;
            const isMax = currentTier >= 3;
            const canAfford = nextGradeCfg ? p.jade >= nextGradeCfg.cost : false;

            return `
              <div class="furnishing-card ${currentTier > 0 ? 'installed' : 'uninstalled'}">
                <div class="furn-card-top">
                  <div class="furn-card-icon">${currentGradeCfg ? currentGradeCfg.icon : item.grades[0].icon}</div>
                  <div class="furn-card-info">
                    <span class="furn-floor-tag">${item.floorName}</span>
                    <h4 class="furn-card-name">${item.name}</h4>
                    <div class="furn-tier-badge ${isMax ? 'max' : ''}">
                      ${currentTier === 0 ? 'ยังไม่ได้ติดตั้ง' : `Tier ${currentTier} / 3 (${currentGradeCfg.name.split('(')[0]})`}
                    </div>
                  </div>
                </div>

                <p class="furn-card-desc">${item.desc}</p>

                <div class="furn-benefit-box">
                  <span class="benefit-label">โบนัสผลิตหยก:</span>
                  <span class="benefit-value">+${currentGradeCfg ? currentGradeCfg.bonusRate : 0} 🟢 / 30 วิ</span>
                </div>

                <div class="furn-action-wrap">
                  ${!isMax ? `
                    <button class="btn btn-primary btn-upgrade-furn ${!canAfford ? 'disabled' : ''}" data-furn-id="${item.id}">
                      <span>${currentTier === 0 ? 'ติดตั้ง' : 'อัปเกรด'} (${nextGradeCfg.name.split('(')[0]}) • 🟢 ${nextGradeCfg.cost}</span>
                    </button>
                  ` : `
                    <div class="furn-max-tag">⭐ ขั้นสูงสุดแล้ว</div>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('.btn-upgrade-furn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-furn-id');
        const item = FURNITURE_CATALOG.find(f => f.id === id);
        const currentTier = (s.furniture && s.furniture[id]) || 0;
        const nextGrade = item.grades.find(g => g.tier === currentTier + 1);
        if (!nextGrade) return;

        if (p.jade < nextGrade.cost) {
          alert('หยกเขียวไม่เพียงพอสำหรับการติดตั้ง/อัปเกรดครับ');
          return;
        }

        if (this.upgradeFurniture(id)) {
          alert(`🎉 อัปเกรด ${nextGrade.name} สำเร็จ! อัตราผลิตหยกเพิ่มขึ้นแล้ว`);
        }
      };
    });
  }

  // --- TAB 3: MYTHICAL PETS ---
  renderPetsTab(container, s, p) {
    container.innerHTML = `
      <div class="sanctuary-pets-grid">
        ${MYTHICAL_PETS.map(pet => {
          const isUnlocked = s.unlockedPets.includes(pet.id);
          const isActive = s.activePet === pet.id;
          const canAfford = p.jade >= pet.cost;

          return `
            <div class="pet-card ${isActive ? 'active-pet' : ''} ${isUnlocked ? 'unlocked' : 'locked'}">
              ${isActive ? '<div class="pet-status-pill">⭐ คู่หูปัจจุบัน</div>' : ''}
              <div class="pet-emoji">${pet.emoji}</div>
              <h3 class="pet-name">${pet.name}</h3>
              <div class="pet-title-en">${pet.title}</div>
              <div class="pet-buff-box">
                <span class="buff-icon">✨</span>
                <span class="buff-text">${pet.buffDesc}</span>
              </div>
              <p class="pet-flavor">${pet.flavor}</p>
              
              <div class="pet-action-wrap">
                ${isUnlocked ? `
                  ${isActive ? `
                    <button class="btn btn-secondary disabled" disabled>กำลังร่วมเดินทาง</button>
                  ` : `
                    <button class="btn btn-primary btn-set-pet" data-pet-id="${pet.id}">เลือกเป็นคู่หู ➔</button>
                  `}
                ` : `
                  <button class="btn btn-secondary btn-unlock-pet ${!canAfford ? 'disabled' : ''}" data-pet-id="${pet.id}">
                    ปลดล็อก (🟢 ${pet.cost})
                  </button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.querySelectorAll('.btn-set-pet').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-pet-id');
        this.setActivePet(id);
      };
    });

    container.querySelectorAll('.btn-unlock-pet').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-pet-id');
        const pet = MYTHICAL_PETS.find(p => p.id === id);
        if (p.jade < pet.cost) {
          alert('หยกเขียวไม่เพียงพอสำหรับการปลดล็อกสัตว์เลี้ยงครับ');
          return;
        }
        if (this.unlockPet(id)) {
          alert(`🎉 ปลดล็อก ${pet.name} สำเร็จ! ได้รับพลังบัฟร่วมผจญภัยทันที`);
        }
      };
    });
  }

  // --- TAB 4: ZEN GARDEN ---
  renderGardenTab(container, s, p) {
    container.innerHTML = `
      <div class="sanctuary-garden-view">
        <div class="garden-scenery-box">
          <div class="scenery-sky">
            <span class="scenery-cloud-1">☁️</span>
            <span class="scenery-sun">☀️</span>
            <span class="scenery-mountain">⛰️ ⛰️ ⛰️</span>
          </div>
          <div class="scenery-courtyard">
            <div class="scenery-building">${INN_LEVELS.find(l => l.level === s.innLevel)?.icon || '🍵'}</div>
            <div class="scenery-pet">${MYTHICAL_PETS.find(pet => pet.id === s.activePet)?.emoji || '🐼'}</div>
            <div class="scenery-decorations">
              ${s.decorations.map(decId => {
                const dec = GARDEN_DECORATIONS.find(d => d.id === decId);
                return dec ? `<span class="placed-dec" title="${dec.name}">${dec.icon}</span>` : '';
              }).join('')}
            </div>
          </div>
        </div>

        <h3 class="garden-shop-title">🏮 ร้านของตกแต่งหุบเขาเซียน</h3>
        <div class="garden-shop-grid">
          ${GARDEN_DECORATIONS.map(dec => {
            const isOwned = s.decorations.includes(dec.id);
            const canAfford = p.jade >= dec.cost;

            return `
              <div class="decoration-card ${isOwned ? 'owned' : ''}">
                <div class="dec-icon">${dec.icon}</div>
                <h4 class="dec-name">${dec.name}</h4>
                <p class="dec-desc">${dec.desc}</p>
                <div class="dec-action">
                  ${isOwned ? `
                    <span class="owned-badge">✅ จัดวางในสวนแล้ว</span>
                  ` : `
                    <button class="btn btn-secondary btn-buy-dec ${!canAfford ? 'disabled' : ''}" data-dec-id="${dec.id}">
                      ซื้อ (🟢 ${dec.cost})
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('.btn-buy-dec').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-dec-id');
        const dec = GARDEN_DECORATIONS.find(d => d.id === id);
        if (p.jade < dec.cost) {
          alert('หยกเขียวไม่เพียงพอสำหรับซื้อของตกแต่งนี้ครับ');
          return;
        }
        if (this.buyDecoration(id)) {
          alert(`🎉 ซื้อ ${dec.name} สำเร็จ! จัดวางลงในสวนเซียนเรียบร้อย`);
        }
      };
    });
  }

  // --- TAB 5: HANZI VOCAB ARCHIVE ---
  renderArchiveTab(container, s) {
    const topics = [
      { id: 'all', title: 'ทั้งหมด' },
      { id: 'modifiers', title: '⚖️ คำขยายความ' },
      { id: 'hotel_inn', title: '🏨 โรงแรม & โรงเตี๊ยม' },
      { id: 'hsk1_4', title: 'HSK1 บท 4' },
      { id: 'kitchen', title: 'สิ่งของในครัว' },
      { id: 'fruits', title: 'ผลไม้' },
      { id: 'animals', title: 'สัตว์' },
      { id: 'body', title: 'ร่างกาย' },
      { id: 'colors', title: 'สีสัน' },
      { id: 'appliances', title: 'เครื่องใช้ไฟฟ้า' },
      { id: 'dailylife', title: 'ชีวิตประจำวัน' },
      { id: 'hobbies', title: 'งานอดิเรก' }
    ];

    let allWords = [];
    for (const key in ARENA_TOPICS) {
      if (this.currentArchiveTopic === 'all' || this.currentArchiveTopic === key) {
        allWords = allWords.concat(ARENA_TOPICS[key].words.map(w => ({ ...w, topic: ARENA_TOPICS[key].name })));
      }
    }

    // Deduplicate by char
    const uniqueMap = new Map();
    for (const w of allWords) {
      if (!uniqueMap.has(w.char)) uniqueMap.set(w.char, w);
    }
    const displayWords = Array.from(uniqueMap.values());
    const learnedSet = new Set(s.learnedVocab || []);

    container.innerHTML = `
      <div class="archive-header-row">
        <div class="archive-stats-box">
          📚 <strong>คลังตำราฮั่นจื้อ:</strong> ปลดล็อกแล้ว <strong>${learnedSet.size}</strong> คำ
        </div>
        <div class="archive-topic-filters">
          ${topics.map(t => `
            <button class="archive-filter-btn ${this.currentArchiveTopic === t.id ? 'active' : ''}" data-topic="${t.id}">
              ${t.title}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="archive-words-grid">
        ${displayWords.map(w => {
          const isMastered = learnedSet.has(w.char);
          return `
            <div class="vocab-card ${isMastered ? 'mastered' : ''}">
              ${isMastered ? '<div class="mastered-seal" title="เคยตอบถูกต้องในเกมแล้ว">⭐ ปลดล็อกแล้ว</div>' : ''}
              <div class="vocab-hanzi">${w.char}</div>
              <div class="vocab-pinyin">${w.pinyin}</div>
              <div class="vocab-meaning">${w.thai || w.english}</div>
              <div class="vocab-en">${w.english}</div>
              <button class="btn-listen-pronounce" data-char="${w.char}" title="กดฟังเสียงอ่านภาษาจีน">
                🔊 ฟังเสียง
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.querySelectorAll('.archive-filter-btn').forEach(btn => {
      btn.onclick = () => {
        this.currentArchiveTopic = btn.getAttribute('data-topic');
        this.renderArchiveTab(container, s);
      };
    });

    container.querySelectorAll('.btn-listen-pronounce').forEach(btn => {
      btn.onclick = () => {
        const char = btn.getAttribute('data-char');
        this.speakChinese(char);
      };
    });
  }
}

export const sanctuaryManager = new SanctuaryManager();
window.sanctuaryManager = sanctuaryManager;
