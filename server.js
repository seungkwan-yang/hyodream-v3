import express from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from '@neondatabase/serverless';
import multer from 'multer';
import bcrypt from 'bcryptjs';

// Initialize configuration
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;
const publicDir = path.join(__dirname, 'dist');
const uploadsDir = process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, 'public', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('[HyoDream] Created uploads directory:', uploadsDir);
  } catch (err) {
    console.error('[HyoDream] Failed to create uploads directory:', err.message);
  }
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `dish-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|avif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드할 수 있습니다. (jpg, png, gif, webp, avif)'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded images as static files
app.use('/uploads', express.static(uploadsDir));

// Neon PostgreSQL Connection Pool Setup
const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Po6ikELGX3fA@ep-hidden-meadow-aoe4575u-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const pool = new Pool({
  connectionString: databaseUrl,
});

// Prevent application crash on unhandled database errors
pool.on('error', (err) => {
  console.error('[HyoDream DB Pool] Unexpected database connection error:', err);
});

// Database Auto-Seeding (Self-Healing Migration)
async function seedDatabase() {
  let client;
  try {
    console.log('[HyoDream DB Engine] Checking database seeding status...');
    client = await pool.connect();
    
    // 0. Ensure all custom hd_ tables exist (Self-Healing DDL Migration)
    await client.query(`
      CREATE TABLE IF NOT EXISTS hd_users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(100) NOT NULL,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL,
          hp VARCHAR(50) NOT NULL,
          tel VARCHAR(50),
          zip VARCHAR(10),
          address1 TEXT,
          address2 TEXT,
          mailing BOOLEAN DEFAULT TRUE,
          sms BOOLEAN DEFAULT TRUE,
          points INTEGER DEFAULT 0 NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Self-healing: make email optional
    await client.query('ALTER TABLE hd_users ALTER COLUMN email DROP NOT NULL;');

    await client.query(`
      CREATE TABLE IF NOT EXISTS hd_categories (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          visible BOOLEAN DEFAULT TRUE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS hd_base_menus (
          id VARCHAR(50) PRIMARY KEY,
          category_id VARCHAR(50) NOT NULL REFERENCES hd_categories(id) ON DELETE CASCADE,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          price INTEGER NOT NULL,
          tags TEXT[] NOT NULL DEFAULT '{}',
          item_ids TEXT[] NOT NULL DEFAULT '{}',
          visible BOOLEAN DEFAULT TRUE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS hd_catalog_items (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          category VARCHAR(50) NOT NULL,
          ingredients TEXT,
          points TEXT[] NOT NULL DEFAULT '{}',
          visible BOOLEAN DEFAULT TRUE NOT NULL,
          image_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS hd_custom_options (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(200) NOT NULL,
          price INTEGER NOT NULL,
          type VARCHAR(50) NOT NULL,
          description TEXT,
          image_url TEXT
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS hd_inquiries (
          id VARCHAR(50) PRIMARY KEY,
          customer_name VARCHAR(100) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          ritual_type VARCHAR(100),
          date VARCHAR(50) NOT NULL,
          time_slot VARCHAR(100),
          address TEXT NOT NULL,
          address_detail TEXT,
          special_requests TEXT,
          customizations TEXT[] NOT NULL DEFAULT '{}',
          subtractions TEXT[] NOT NULL DEFAULT '{}',
          total_price INTEGER NOT NULL,
          created_at VARCHAR(50) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending' NOT NULL,
          admin_notes TEXT,
          payment_method VARCHAR(100),
          payment_status VARCHAR(50) DEFAULT 'pending' NOT NULL,
          toss_transaction_id VARCHAR(150),
          user_id VARCHAR(50),
          points_earned INTEGER DEFAULT 0,
          db_created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query('ALTER TABLE hd_inquiries ADD COLUMN IF NOT EXISTS user_id VARCHAR(50);');
    await client.query('ALTER TABLE hd_inquiries ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0;');
    
    console.log('[HyoDream DB Engine] Self-healing tables verified/created.');
    
    // 1. Seed categories
    const catCheck = await client.query('SELECT COUNT(*) FROM hd_categories');
    if (parseInt(catCheck.rows[0].count) === 0) {
      console.log('[HyoDream DB Engine] Seeding default categories...');
      await client.query(`
        INSERT INTO hd_categories (id, name, visible) VALUES
        ('cat-ritual', '차례 / 기제사상', true),
        ('cat-gosa', '고사 / 시제상', true)
      `);
    }

    // 2. Seed catalog items (Individual Dishes)
    const itemCheck = await client.query('SELECT COUNT(*) FROM hd_catalog_items');
    if (parseInt(itemCheck.rows[0].count) === 0) {
      console.log('[HyoDream DB Engine] Seeding default catalog items...');
      await client.query(`
        INSERT INTO hd_catalog_items (id, name, description, category, ingredients, points, visible, image_url) VALUES
        ('item-jeon-01', '수제 명품 동태전', '비린맛이 전혀 없는 신선한 동태포를 엄선하여 가시를 완벽히 발라낸 뒤, 노란 계란물을 곱게 입혀 새벽녘 구워냅니다.', 'jeon', '동태(러시아산/선상급), 신선란(국내산), 밀가루(국내산)', ARRAY['가시 완벽 발라냄', '당일 즉석 제조', '부드러운 식감'], true, 'https://images.unsplash.com/photo-1626200419199-391ae4be7a40?auto=format&fit=crop&w=600&q=80'),
        ('item-jeon-02', '정성 가득 고기완자전 (동그랑땡)', '신선한 국산 돈육과 두부, 각종 야채를 잘게 다져 치댄 뒤 도톰하게 빚어 육즙이 새어나가지 않게 지져냅니다.', 'jeon', '돼지고기(국내산 1등급), 두부(국내산), 부추, 양파', ARRAY['풍부한 육즙', '수제 수작업 빚음', '두툼한 두께'], true, 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=600&q=80'),
        ('item-jeon-03', '오색 꼬지전', '맛살, 햄, 부추, 단무지, 새송이버섯을 정밀하게 재단하여 알록달록 고운 색감으로 정성스레 꽂아 낸 누구나 좋아하는 전.', 'jeon', '새송이버섯(국내산), 쪽파(국내산), 햄, 맛살', ARRAY['정밀 재단 오색 빛깔', '정갈함의 끝판왕'], true, 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=600&q=80'),
        ('item-jeok-01', '명품 육적 (산적 소고기)', '최상급 소고기 부위를 효드림 비법 과일 양념에 12시간 숙성시켜 그릴에 직화로 구워 겉은 바삭하고 속은 촉촉합니다.', 'jeok', '소고기(우둔/설도 등 등급별), 배/양파즙(국내산)', ARRAY['직화 그릴 구이', '천연 과일 양념 숙성', '연한 육질'], true, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'),
        ('item-jeok-02', '동해안 참조기 구이 (어적)', '비늘 및 아가미를 깔끔하게 다듬고 천일염으로 슴슴하게 간하여 한 마리 한 마리 노릇노릇하고 꼿꼿하게 구워 올립니다.', 'jeok', '참조기(국내산 천일염 염장)', ARRAY['비늘/내장 수작업 제거', '특대 사이즈 조기', '꼿꼿한 자태 유지'], true, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80'),
        ('item-jeok-03', '궁중식 한우 갈비찜', '횡성 한우 갈비 부위를 특제 양념장에 푹 고아내어 뼈가 부드럽게 발라지며, 밤과 대추를 아낌없이 올린 프리미엄 요리.', 'jeok', '한우 갈비(국내산), 알밤(국내산), 대추(국내산)', ARRAY['부드럽고 쫄깃함', '가마솥 방식 고아냄', '완벽 보냉 포장'], true, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80'),
        ('item-namul-01', '정갈한 삼색 나물 (고사리/도라지/시금치)', '뿌리를 다듬고 아린맛을 완전히 뺀 뒤, 들기름과 재래간장으로 볶아내고 살쳐내어 깊은 고소함이 일품인 삼색 고유의 나물.', 'namul', '고사리(제주산), 백도라지(국내산), 시금치(국내산)', ARRAY['아린맛 완벽 제거', '전통 들기름 사용', '고유 색감 보존'], true, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80'),
        ('item-tang-01', '깊고 맑은 가마솥 탕국', '무와 양지머리 소고기, 두부를 큼직하게 썰어 가마솥에 오랜 시간 고아내어 국물맛이 깊고 맑아 제사 상차림의 깊이를 더해줍니다.', 'tang', '소고기 양지(국내산), 무(국내산), 국산 두부', ARRAY['가마솥 맑은 육수', '도톰하게 썰어낸 제수 두부', '기름기 완벽 제거'], true, 'https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&w=600&q=80'),
        ('item-fruit-01', '특상품 제수용 과일 (사과/배/감 등)', '가락시장에서 당일 새벽 공수하는 과일 중 크기가 크고 상처가 없으며 색깔이 선명한 특등급 제수용 과일만을 꼼꼼히 엄선합니다.', 'fruit', '배(신고/국내산), 사과(부사/국내산), 곶감(상주/국내산)', ARRAY['특등급 새벽 낙찰', '상처 무결점 엄선', '개별 완충 포장'], true, 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=600&q=80'),
        ('item-fruit-02', '전통 제과 & 부가 품목 (약과/산자/제문)', '전통 한과 명가에서 빚은 쫀득한 수제 찹쌀 약과와 산자, 그리고 제를 모시는 데 필수적인 제문 및 향, 초 일체를 포함합니다.', 'fruit', '찹쌀(국내산), 조청(국내산)', ARRAY['전통 한과 명가 제작', '향/초/제문 일체 포함'], true, 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80')
      `);
    }

    // 3. Seed base menus
    const menuCheck = await client.query('SELECT COUNT(*) FROM hd_base_menus');
    if (parseInt(menuCheck.rows[0].count) === 0) {
      console.log('[HyoDream DB Engine] Seeding default base menus...');
      await client.query(`
        INSERT INTO hd_base_menus (id, category_id, name, description, price, tags, item_ids, visible) VALUES
        ('kisso', 'cat-ritual', '소가족 실속상 (기제사 소)', '1~2인 가구 및 핵가족을 위한 실속형 상차림. 필수 제수로 알차게 구성하여 예에 정성을 다했습니다.', 220000, ARRAY['실속형', '1~2인', '기제사'], ARRAY['item-jeon-01', 'item-jeon-02', 'item-namul-01', 'item-tang-01'], true),
        ('kijung', 'cat-ritual', '표준 맞춤상 (기제사 중)', '가장 많이 찾으시는 대중적인 3~4인용 표준 상차림. 넉넉하고 정갈한 음식으로 제를 모실 수 있습니다.', 350000, ARRAY['인기', '3~4인', '기제사'], ARRAY['item-jeon-01', 'item-jeon-02', 'item-jeon-03', 'item-jeok-01', 'item-jeok-02', 'item-namul-01', 'item-tang-01', 'item-fruit-01'], true),
        ('kidae', 'cat-ritual', '명가 전통상 (기제사 대)', '대가족 및 5인 이상 가족을 위한 품격 높은 풍성한 상차림. 엄선된 식재료와 장인의 손길로 준비됩니다.', 480000, ARRAY['프리미엄', '5인이상', '기제사'], ARRAY['item-jeon-01', 'item-jeon-02', 'item-jeon-03', 'item-jeok-01', 'item-jeok-02', 'item-jeok-03', 'item-namul-01', 'item-tang-01', 'item-fruit-01', 'item-fruit-02'], true),
        ('gosa', 'cat-gosa', '개업 고사상 / 시제상', '사업 번창과 가문의 평안을 기원하는 맞춤형 제사상. 돼지머리(실물 또는 모형선택) 및 떡, 과일 구성.', 290000, ARRAY['고사/시제', '맞춤형'], ARRAY['item-fruit-01', 'item-fruit-02'], true)
      `);
    }

    // 4. Seed custom options
    const optCheck = await client.query('SELECT COUNT(*) FROM hd_custom_options');
    if (parseInt(optCheck.rows[0].count) === 0) {
      console.log('[HyoDream DB Engine] Seeding default custom options...');
      await client.query(`
        INSERT INTO hd_custom_options (id, name, price, type, description, image_url) VALUES
        ('abalone', '완도산 명품 활전복 숙회 (5미)', 35000, 'addition', '주문 당일 활어 상태의 전복을 스팀하여 부드럽고 쫄깃한 식감의 고급 적(炙) 품목', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80'),
        ('beef', '한우 갈비찜 업그레이드', 40000, 'addition', '수입산 육적을 최고급 횡성 한우 양념 갈비찜으로 업그레이드하여 차림의 품격을 높임', 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80'),
        ('ricecake', '수제 삼색경단 및 약식 추가', 15000, 'addition', '천연재료로 빚은 고소한 삼색경단과 밤, 대추가 듬뿍 들어간 수제 궁중 약식 추가 구성', 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80'),
        ('sikhye', '수제 전통 식혜 (1.8L)', 10000, 'addition', '전통 방식 그대로 가마솥에 엿기름을 삭혀 깊은 단맛을 낸 홈메이드 전통 음료', 'https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&w=600&q=80'),
        ('utensils', '고급 제구 & 제문 세트 대여', 0, 'addition', '품격 있는 목제 제기 및 제문, 향로, 초 등을 무료로 대여해 드립니다.', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80'),
        ('noincense', '향/초/제문 세트 제외', -5000, 'subtraction', '가정에 이미 제구 및 향/초가 구비되어 있어 필요 없는 경우 적용하는 차감 옵션', NULL),
        ('simplefruit', '과일류 간소화', -20000, 'subtraction', '제사상에 필수적인 3색 과일(대추, 밤, 감/배)만 유지하고 기타 제철 과일을 제외하는 간소화 옵션', NULL)
      `);
    }

    // 5. Seed inquiries (Orders)
    const inqCheck = await client.query('SELECT COUNT(*) FROM hd_inquiries');
    if (parseInt(inqCheck.rows[0].count) === 0) {
      console.log('[HyoDream DB Engine] Seeding default inquiries...');
      await client.query(`
        INSERT INTO hd_inquiries (id, customer_name, phone, ritual_type, date, time_slot, address, address_detail, special_requests, customizations, subtractions, total_price, created_at, status, admin_notes, payment_method, payment_status, toss_transaction_id) VALUES
        ('HD-2026-0001', '김민준', '010-3456-7890', '표준 맞춤상 (기제사 중)', '2026-05-28', '오후 4:00 ~ 오후 6:00 (제사 전 도착)', '인천광역시 연수구 송도동 123-45', '송도자이더스타 104동 1502호', '간이 싱거웠으면 좋겠고 생선은 조기로 꼭 튼실한 놈으로 보내주세요.', ARRAY['한우 갈비찜 업그레이드', '수제 전통 식혜 (1.8L)'], ARRAY[]::text[], 400000, '2026-05-24 07:15', 'pending', '배송 당일 전화 요청함. 조기 사이즈 30cm 이상 선별 필수.', '토스페이', 'paid', 'toss_tx_20260524mj89'),
        ('HD-2026-0002', '이지혜', '010-8765-4321', '소가족 실속상 (기제사 소)', '2026-05-26', '오전 10:00 ~ 오후 12:00', '인천광역시 부평구 평천로 150', '부평래미안아파트 201동 304호', '현관 공동현관 비밀번호는 #0226* 입니다. 벨 누르지 마시고 문 앞에 놔주세요.', ARRAY['고급 제구 & 제문 세트 대여'], ARRAY['향/초/제문 세트 제외'], 215000, '2026-05-23 18:30', 'approved', '문 앞 배송 확인 문자 전송 요망. 대여 제기는 다음 날 회수 예정.', '신용카드 (신한카드)', 'paid', 'toss_tx_20260523jh54')
      `);
    }

    // 6. Ensure hd_reviews table exists and seed it
    await client.query(`
      CREATE TABLE IF NOT EXISTS hd_reviews (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          rating INTEGER NOT NULL,
          date VARCHAR(50) NOT NULL,
          title VARCHAR(200) DEFAULT '',
          content TEXT NOT NULL,
          package_type VARCHAR(150) NOT NULL,
          image_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Self-healing schema migration: ensure column 'title' exists in database
    await client.query('ALTER TABLE hd_reviews ADD COLUMN IF NOT EXISTS title VARCHAR(200) DEFAULT \'\';');
    
    const reviewCheck = await client.query('SELECT COUNT(*) FROM hd_reviews');
    if (parseInt(reviewCheck.rows[0].count) === 0) {
      console.log('[HyoDream DB Engine] Seeding default reviews...');
      await client.query(`
        INSERT INTO hd_reviews (name, rating, date, title, content, package_type, image_url) VALUES
        ('이*호 (인천 연수구)', 5, '2026-05-18', '정말 대만족스러운 기제사상이었습니다!', '어머님 기제사로 급히 주문했습니다. 3일 전에 주문했는데 당일에 전용 차량으로 정갈하게 박싱되어 와서 안심했어요. 전 종류가 특히 도톰하고 기름 쩐내 없이 새벽에 부친 게 티가 나더군요. 친척 어르신들도 칭찬 많이 하셔서 뿌듯했습니다.', '표준 맞춤상 (기제사 중)', 'https://images.unsplash.com/photo-1626200419199-391ae4be7a40?auto=format&fit=crop&w=600&q=80'),
        ('박*정 (인천 부평구)', 5, '2026-05-12', '소가족이 먹기에 알차고 깔끔합니다.', '핵가족이라 소가족 실속상으로 주문했어요. 과일도 흠집 하나 없이 특등과들만 왔고 밤 깎은 정성도 보였네요. 전복 추가했는데 꼬들하니 아주 인기 좋았습니다. 앞으로 제사때마다 효드림만 애용할 생각입니다.', '소가족 실속상 + 활전복 추가', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80'),
        ('최*환 (경기도 부천시)', 4, '2026-05-04', '회사 개업고사 아주 성황리에 마쳤습니다!', '사무실 새로 이전하면서 개업 고사상 대행으로 예약했는데 완전 마음에 듭니다. 돼지머리 상태도 아주 훌륭했고 시루떡이 진짜 김이 모락모락 나는 채로 와서 놀랐습니다. 번창하겠습니다 대박나세요!', '개업 고사상', NULL),
        ('정*우 (인천 서구)', 5, '2026-05-25', '음식 맛이 정말 깊고 정갈하네요.', '기제사 중상을 시켰는데 음식 하나하나가 너무 정성스럽습니다. 나물도 간이 딱 맞고 특히 갈비찜 고기가 입안에서 부드럽게 녹아내리더군요. 제사 모시고 가족들과 정말 맛있게 음복했습니다.', '표준 맞춤상 (기제사 중)', NULL),
        ('김*아 (인천 연수구)', 5, '2026-05-22', '포장도 깔끔하고 위생 상태가 최고입니다.', '처음 대행 서비스를 이용해서 걱정이 많았는데 기대 이상입니다. 포장이 개별 용기로 꼼꼼하게 와서 국물이 새거나 흐른 것이 하나도 없었어요. 과일도 백화점 고급 과일 수준이라 어르신들께서 대만족하셨습니다.', '명가 전통상 (기제사 대)', NULL),
        ('윤*원 (경기도 시흥시)', 5, '2026-05-20', '생선(참조기) 굽기 자태가 남다릅니다.', '조기 상태가 어쩜 이렇게 꼿꼿하고 튼튼하게 잘 구워졌는지 감탄했습니다. 비늘이나 지느러미 손질도 아주 깔끔했고 겉바속촉 그 자체네요. 앞으로 번거롭게 장보고 전 부치지 않고 무조건 효드림 예약하겠습니다.', '표준 맞춤상 + 조기 특대 추가', NULL),
        ('최*지 (인천 남동구)', 4, '2026-05-15', '제사를 경건하고 정갈하게 모셨습니다.', '할머니 제사라 소가족 실속상으로 차렸는데 나물 색감도 예쁘고 탕국도 양지 육수라 국물이 깊고 맑았습니다. 포장도 정성이 보여서 제사를 아주 경건하게 마쳤네요. 감사합니다.', '소가족 실속상 (기제사 소)', NULL),
        ('강*수 (인천 계양구)', 4, '2026-05-10', '식혜 맛이 집에서 직접 담근 수준입니다!', '식혜가 가마솥에 직접 삭힌 맛이라 시판 식혜랑은 차원이 다르네요. 많이 달지 않으면서도 깊은 풍미가 있어 아이들도 너무 좋아했습니다. 1.8L 순삭했네요. 다음에는 두 병 주문하려 합니다.', '소가족 실속상 + 수제 식혜 추가', NULL),
        ('임*영 (경기도 부천시)', 5, '2026-05-08', '직원들 모두 만족한 훌륭한 개업고사상', '개업 고사 대행으로 시켰는데 준비해 주신 돼지머리가 엄청 깔끔하고 인물이 좋아서 직원들 모두 웃으며 고사를 지냈습니다. 시루떡도 엄청 쫀득하고 따끈하게 도착했네요. 덕분에 사업 번창할 것 같습니다!', '개업 고사상', NULL),
        ('한*희 (인천 중구)', 5, '2026-05-01', '급히 예약했는데 정시 배송 감사합니다.', '갑작스럽게 기일을 챙기게 되어 급히 예약했는데 3일 만에 정확히 정량 배송되었네요. 전통 한과도 명가 제품이라 너무 맛있었고 제구(향/초)도 챙겨주셔서 별도 준비 없이 완벽하게 상을 차렸습니다.', '명가 전통상 + 제구 세트 대여', NULL),
        ('송*혜 (경기도 시흥시)', 5, '2026-04-28', '수제 전 종류가 가시도 없고 정말 맛나네요.', '수제 동태전 가시가 진짜 단 하나도 없어서 아이와 노모께서 안심하고 맛있게 드셨습니다. 육즙 가득한 동그랑땡도 도톰해서 씹는 맛이 최고였네요. 명절 차례상 예약 미리 신청해 두려 합니다.', '표준 맞춤상 (기제사 중)', NULL),
        ('고*원 (인천 동구)', 4, '2026-04-22', '나물의 고소하고 풍성한 향이 일품입니다.', '나물의 아린 맛이나 쓴 맛이 완전히 제거되어 고소하고 향긋한 나물 본연의 맛이 너무 훌륭했습니다. 고사리, 도라지, 시금치 전부 흠잡을 데가 없네요. 음식 장만 스트레스에서 벗어나게 해 주셔서 감사해요.', '소가족 실속상 (기제사 소)', NULL),
        ('신*윤 (인천 서구)', 5, '2026-04-18', '배송 탑차 기사님도 친절하고 프리미엄하네요.', '배송 기사님께서 무척 친절하셨고 안전 탑차로 직접 집 앞까지 정성스레 들어다 주셨습니다. 음식의 신선도와 포장 상태가 그 어떤 온라인 반찬 샵보다 프리미엄했습니다. 효드림 적극 강추합니다.', '명가 전통상 (기제사 대)', NULL),
        ('송*민 (경기도 부천시)', 5, '2026-04-14', '온 가족이 음복하며 맛있게 먹었습니다.', '음식 간이 삼삼하니 아주 좋았고 양도 생각보다 푸짐해서 넉넉히 나눠 먹었습니다. 동네 반찬 가게보다 퀄리티가 훨씬 높은 제사 음식 전용 샵이라 만족도가 큽니다.', '표준 맞춤상 (기제사 중)', NULL),
        ('조*정 (인천 남동구)', 4, '2026-04-10', '과일 신선도가 예술입니다. 크기도 크네요.', '과일이 싱싱하고 사과와 배 크기가 특등품이었습니다. 전 종류도 정갈하고 가열해서 데우니까 기름기 쏙 빠지고 바삭하네요. 강추 드립니다.', '소가족 실속상 (기제사 소)', NULL)
      `);
    }

    console.log('[HyoDream DB Engine] Database integrity verified.');
  } catch (err) {
    console.error('[HyoDream DB Engine] Seeding error (Express server remains alive and active):', err);
  } finally {
    if (client) client.release();
  }
}

// REST API 라우트 설계

// 0. Auth & Users
app.post('/api/auth/register', async (req, res) => {
  const { username, password, name, email, hp, tel, zip, address1, address2, mailing, sms } = req.body;
  try {
    const userCheck = await pool.query('SELECT username FROM hd_users WHERE username = $1', [username]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: '이미 사용중인 아이디입니다.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO hd_users (username, password, name, email, hp, tel, zip, address1, address2, mailing, sms) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id, username, name, email, hp, tel, zip, address1, address2, mailing, sms, points`,
      [username, hashedPassword, name, email, hp, tel, zip, address1, address2, mailing, sms]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM hd_users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: '존재하지 않는 아이디입니다.' });
    }
    
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
    }

    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      hp: user.hp,
      tel: user.tel,
      zip: user.zip,
      address1: user.address1,
      address2: user.address2,
      mailing: user.mailing,
      sms: user.sms,
      points: user.points
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT username, name, email, hp, tel, zip, address1, address2, mailing, sms, points, created_at as "createdAt" FROM hd_users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:username', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, name, email, hp, tel, zip, address1, address2, mailing, sms, points, created_at FROM hd_users WHERE username = $1', [req.params.username]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:username', async (req, res) => {
  const { name, email, hp, tel, zip, address1, address2, mailing, sms, password } = req.body;
  try {
    let updateQuery = `
      UPDATE hd_users 
      SET name = $1, email = $2, hp = $3, tel = $4, zip = $5, address1 = $6, address2 = $7, mailing = $8, sms = $9
    `;
    let values = [name, email, hp, tel, zip, address1, address2, mailing, sms, req.params.username];
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateQuery += `, password = $11 WHERE username = $10 RETURNING id, username, name, email, hp, tel, zip, address1, address2, mailing, sms, points`;
      values = [name, email, hp, tel, zip, address1, address2, mailing, sms, req.params.username, hashedPassword];
    } else {
      updateQuery += ` WHERE username = $10 RETURNING id, username, name, email, hp, tel, zip, address1, address2, mailing, sms, points`;
    }

    const result = await pool.query(updateQuery, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:username/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hd_inquiries WHERE user_id = $1 ORDER BY db_created_at DESC', [req.params.username]);
    const mapped = result.rows.map(row => ({
      id: row.id,
      customerName: row.customer_name,
      phone: row.phone,
      ritualType: row.ritual_type,
      date: row.date,
      timeSlot: row.time_slot,
      address: row.address,
      addressDetail: row.address_detail,
      specialRequests: row.special_requests,
      customizations: row.customizations,
      subtractions: row.subtractions,
      totalPrice: row.total_price,
      createdAt: row.created_at,
      status: row.status,
      adminNotes: row.admin_notes,
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      tossTransactionId: row.toss_transaction_id,
      userId: row.user_id,
      pointsEarned: row.points_earned
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. Categories CRUD
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hd_categories ORDER BY created_at ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', async (req, res) => {
  const { id, name, visible } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO hd_categories (id, name, visible) VALUES ($1, $2, $3) RETURNING *',
      [id, name, visible !== undefined ? visible : true]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name, visible } = req.body;
  try {
    const result = await pool.query(
      'UPDATE hd_categories SET name = $1, visible = $2 WHERE id = $3 RETURNING *',
      [name, visible, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM hd_categories WHERE id = $1', [id]);
    res.json({ success: true, message: 'Category deleted (Cascade triggered)' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Base Menus CRUD
app.get('/api/base-menus', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, category_id as "categoryId", name, description, price, tags, item_ids as "itemIds", visible FROM hd_base_menus ORDER BY created_at ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/base-menus', async (req, res) => {
  const { id, categoryId, name, description, price, tags, itemIds, visible } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO hd_base_menus (id, category_id, name, description, price, tags, item_ids, visible) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, category_id as "categoryId", name, description, price, tags, item_ids as "itemIds", visible',
      [id, categoryId, name, description, price, tags || [], itemIds || [], visible !== undefined ? visible : true]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/base-menus/:id', async (req, res) => {
  const { id } = req.params;
  const { categoryId, name, description, price, tags, itemIds, visible } = req.body;
  try {
    const result = await pool.query(
      'UPDATE hd_base_menus SET category_id = $1, name = $2, description = $3, price = $4, tags = $5, item_ids = $6, visible = $7 WHERE id = $8 RETURNING id, category_id as "categoryId", name, description, price, tags, item_ids as "itemIds", visible',
      [categoryId, name, description, price, tags, itemIds, visible, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/base-menus/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM hd_base_menus WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2.5 File Upload API
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '업로드된 파일이 없습니다.' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    console.log(`[HyoDream Upload] File saved: ${req.file.filename}`);
    res.json({ url: fileUrl, filename: req.file.filename });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// File upload error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message.includes('이미지')) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

// 3. Catalog Items CRUD
app.get('/api/catalog-items', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, description, category, ingredients, points, visible, image_url as "imageUrl" FROM hd_catalog_items ORDER BY created_at ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/catalog-items', async (req, res) => {
  const { id, name, description, category, ingredients, points, visible, imageUrl } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO hd_catalog_items (id, name, description, category, ingredients, points, visible, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, description, category, ingredients, points, visible, image_url as "imageUrl"',
      [id, name, description, category, ingredients, points || [], visible !== undefined ? visible : true, imageUrl]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/catalog-items/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, category, ingredients, points, visible, imageUrl } = req.body;
  try {
    const result = await pool.query(
      'UPDATE hd_catalog_items SET name = $1, description = $2, category = $3, ingredients = $4, points = $5, visible = $6, image_url = $7 WHERE id = $8 RETURNING id, name, description, category, ingredients, points, visible, image_url as "imageUrl"',
      [name, description, category, ingredients, points, visible, imageUrl, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/catalog-items/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM hd_catalog_items WHERE id = $1', [id]);
    // Cascade update reference in base menus array
    await pool.query('UPDATE hd_base_menus SET item_ids = array_remove(item_ids, $1)', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Custom Options CRUD
app.get('/api/custom-options', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, price, type, description, image_url as "imageUrl" FROM hd_custom_options ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/custom-options', async (req, res) => {
  const { id, name, price, type, description, imageUrl } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO hd_custom_options (id, name, price, type, description, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, price, type, description, image_url as "imageUrl"',
      [id, name, price, type, description, imageUrl]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/custom-options/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, type, description, imageUrl } = req.body;
  try {
    const result = await pool.query(
      'UPDATE hd_custom_options SET name = $1, price = $2, type = $3, description = $4, image_url = $5 WHERE id = $6 RETURNING id, name, price, type, description, image_url as "imageUrl"',
      [name, price, type, description, imageUrl, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/custom-options/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM hd_custom_options WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Inquiries CRUD (Orders)
app.get('/api/inquiries', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, customer_name as "customerName", phone, ritual_type as "ritualType", date, time_slot as "timeSlot", address, address_detail as "addressDetail", special_requests as "specialRequests", customizations, subtractions, total_price as "totalPrice", created_at as "createdAt", status, admin_notes as "adminNotes", payment_method as "paymentMethod", payment_status as "paymentStatus", toss_transaction_id as "tossTransactionId", user_id as "userId", points_earned as "pointsEarned" FROM hd_inquiries ORDER BY db_created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inquiries', async (req, res) => {
  const { id, customerName, phone, ritualType, date, timeSlot, address, addressDetail, specialRequests, customizations, subtractions, totalPrice, createdAt, status, adminNotes, paymentMethod, paymentStatus, tossTransactionId, userId } = req.body;
  try {
    const pointsEarned = Math.floor(totalPrice * 0.01);

    await pool.query('BEGIN');

    const result = await pool.query(
      `INSERT INTO hd_inquiries (id, customer_name, phone, ritual_type, date, time_slot, address, address_detail, special_requests, customizations, subtractions, total_price, created_at, status, admin_notes, payment_method, payment_status, toss_transaction_id, user_id, points_earned) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) 
       RETURNING id, customer_name as "customerName", phone, ritual_type as "ritualType", date, time_slot as "timeSlot", address, address_detail as "addressDetail", special_requests as "specialRequests", customizations, subtractions, total_price as "totalPrice", created_at as "createdAt", status, admin_notes as "adminNotes", payment_method as "paymentMethod", payment_status as "paymentStatus", toss_transaction_id as "tossTransactionId", user_id as "userId", points_earned as "pointsEarned"`,
      [id, customerName, phone, ritualType, date, timeSlot, address, addressDetail, specialRequests, customizations || [], subtractions || [], totalPrice, createdAt, status || 'pending', adminNotes, paymentMethod, paymentStatus || 'pending', tossTransactionId, userId || null, pointsEarned]
    );

    if (userId && (paymentStatus === 'paid')) {
      await pool.query('UPDATE hd_users SET points = points + $1 WHERE username = $2', [pointsEarned, userId]);
    }

    await pool.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/inquiries/:id', async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;
  try {
    await pool.query('BEGIN');

    // Get existing inquiry
    const existing = await pool.query('SELECT status, user_id, total_price, payment_status, points_earned FROM hd_inquiries WHERE id = $1', [id]);
    
    if (existing.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Not found' });
    }

    const inquiry = existing.rows[0];
    let newPaymentStatus = inquiry.payment_status;

    // If changing from pending to approved/completed, confirm payment and award points
    if (inquiry.payment_status === 'pending' && (status === 'approved' || status === 'completed')) {
      newPaymentStatus = 'paid';
      if (inquiry.user_id) {
        const pointsToAward = inquiry.points_earned || Math.floor(inquiry.total_price * 0.01);
        await pool.query('UPDATE hd_users SET points = points + $1 WHERE username = $2', [pointsToAward, inquiry.user_id]);
      }
    }

    const result = await pool.query(
      'UPDATE hd_inquiries SET status = $1, admin_notes = $2, payment_status = $3 WHERE id = $4 RETURNING id, customer_name as "customerName", phone, ritual_type as "ritualType", date, time_slot as "timeSlot", address, address_detail as "addressDetail", special_requests as "specialRequests", customizations, subtractions, total_price as "totalPrice", created_at as "createdAt", status, admin_notes as "adminNotes", payment_method as "paymentMethod", payment_status as "paymentStatus", toss_transaction_id as "tossTransactionId"',
      [status, adminNotes, newPaymentStatus, id]
    );

    await pool.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/inquiries/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM hd_inquiries WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Customer Reviews API
app.get('/api/reviews', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, rating, date, title, content, package_type as "packageType", image_url as "imageUrl" FROM hd_reviews ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  const { name, rating, date, title, content, packageType, imageUrl } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO hd_reviews (name, rating, date, title, content, package_type, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, rating, date, title, content, package_type as "packageType", image_url as "imageUrl"',
      [name, rating, date, title || '', content, packageType, imageUrl || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// React SPA Static files and single-page routing logic
app.use(express.static(publicDir));

// Cache Control custom static handler
app.use((req, res, next) => {
  const ext = path.extname(req.url).toLowerCase();
  if (ext && ext !== '.html') {
    res.setHeader('Cache-Control', 'public, max-age=2592000, no-transform');
  } else {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  }
  next();
});

// For any client route fallback, serve index.html (React routing support)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Export the app instance for Vercel serverless environment
export default app;

// Start listening and seed database, explicitly binding to 0.0.0.0 if not running inside Vercel
if (!process.env.VERCEL) {
  const srv = app.listen(port, '0.0.0.0', async () => {
    console.log(`[HyoDream Express Server] Live on port ${port} (0.0.0.0)`);
    console.log(`Serving static folder: ${publicDir}`);
    await seedDatabase();
  });
  srv.on('error', (err) => console.error('[HyoDream Express Server] ERROR:', err));
  
  // 방어 코드: 서버가 비정상적으로 이벤트 루프를 비우고 종료되는 현상 방지
  setInterval(() => {}, 1000 * 60 * 60);
} else {
  // In Vercel environment, ensure database seeding runs on cold starts
  seedDatabase().catch(err => {
    console.error('[HyoDream DB Engine] Vercel Cold Start Seeding error:', err);
  });
}
