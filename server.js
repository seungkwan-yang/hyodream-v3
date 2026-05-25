import express from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import multer from 'multer';

// Initialize configuration
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;
const publicDir = path.join(__dirname, 'dist');
const uploadsDir = process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, 'uploads');

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
const { Pool } = pg;
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false // Required for Neon secure connection
  }
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

    console.log('[HyoDream DB Engine] Database integrity verified.');
  } catch (err) {
    console.error('[HyoDream DB Engine] Seeding error (Express server remains alive and active):', err);
  } finally {
    if (client) client.release();
  }
}

// Debug Endpoint to check Database URL and connectivity on Vercel
app.get('/api/debug-env', async (req, res) => {
  const url = process.env.DATABASE_URL || 'default-fallback';
  const maskedUrl = url.replace(/:([^:@]+)@/, ':***@');
  
  let connectStatus = 'unknown';
  let connectError = null;
  let client;
  
  try {
    client = await pool.connect();
    connectStatus = 'success';
  } catch (err) {
    connectStatus = 'failed';
    connectError = err.message;
  } finally {
    if (client) client.release();
  }
  
  res.json({
    databaseUrlUsed: maskedUrl,
    hasEnvVar: !!process.env.DATABASE_URL,
    connectStatus,
    connectError,
    isVercel: !!process.env.VERCEL
  });
});

// REST API 라우트 설계
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
    const result = await pool.query('SELECT id, customer_name as "customerName", phone, ritual_type as "ritualType", date, time_slot as "timeSlot", address, address_detail as "addressDetail", special_requests as "specialRequests", customizations, subtractions, total_price as "totalPrice", created_at as "createdAt", status, admin_notes as "adminNotes", payment_method as "paymentMethod", payment_status as "paymentStatus", toss_transaction_id as "tossTransactionId" FROM hd_inquiries ORDER BY db_created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inquiries', async (req, res) => {
  const { id, customerName, phone, ritualType, date, timeSlot, address, addressDetail, specialRequests, customizations, subtractions, totalPrice, createdAt, status, adminNotes, paymentMethod, paymentStatus, tossTransactionId } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO hd_inquiries (id, customer_name, phone, ritual_type, date, time_slot, address, address_detail, special_requests, customizations, subtractions, total_price, created_at, status, admin_notes, payment_method, payment_status, toss_transaction_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) 
       RETURNING id, customer_name as "customerName", phone, ritual_type as "ritualType", date, time_slot as "timeSlot", address, address_detail as "addressDetail", special_requests as "specialRequests", customizations, subtractions, total_price as "totalPrice", created_at as "createdAt", status, admin_notes as "adminNotes", payment_method as "paymentMethod", payment_status as "paymentStatus", toss_transaction_id as "tossTransactionId"`,
      [id, customerName, phone, ritualType, date, timeSlot, address, addressDetail, specialRequests, customizations || [], subtractions || [], totalPrice, createdAt, status || 'pending', adminNotes, paymentMethod, paymentStatus || 'pending', tossTransactionId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/inquiries/:id', async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;
  try {
    const result = await pool.query(
      'UPDATE hd_inquiries SET status = $1, admin_notes = $2 WHERE id = $3 RETURNING id, customer_name as "customerName", phone, ritual_type as "ritualType", date, time_slot as "timeSlot", address, address_detail as "addressDetail", special_requests as "specialRequests", customizations, subtractions, total_price as "totalPrice", created_at as "createdAt", status, admin_notes as "adminNotes", payment_method as "paymentMethod", payment_status as "paymentStatus", toss_transaction_id as "tossTransactionId"',
      [status, adminNotes, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
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
  app.listen(port, '0.0.0.0', async () => {
    console.log(`[HyoDream Express Server] Live on port ${port} (0.0.0.0)`);
    console.log(`Serving static folder: ${publicDir}`);
    await seedDatabase();
  });
} else {
  // In Vercel environment, ensure database seeding runs on cold starts
  seedDatabase().catch(err => {
    console.error('[HyoDream DB Engine] Vercel Cold Start Seeding error:', err);
  });
}
