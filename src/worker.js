import { Pool, neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      ...headers,
    },
  });

const errorJson = (error, status = 500) =>
  json({ error: error instanceof Error ? error.message : String(error) }, status);

const getConnectionString = (env) =>
  env.HYPERDRIVE?.connectionString || env.DATABASE_URL;

const getSafeDbInfo = (env) => {
  const connectionString = getConnectionString(env);
  if (!connectionString) {
    return {
      configured: false,
      source: env.HYPERDRIVE?.connectionString ? 'HYPERDRIVE' : 'DATABASE_URL',
    };
  }

  try {
    const url = new URL(connectionString);
    return {
      configured: true,
      source: env.HYPERDRIVE?.connectionString ? 'HYPERDRIVE' : 'DATABASE_URL',
      host: url.hostname,
      database: url.pathname.replace(/^\//, ''),
      username: decodeURIComponent(url.username || ''),
      sslmode: url.searchParams.get('sslmode'),
      channelBinding: url.searchParams.get('channel_binding'),
    };
  } catch {
    return {
      configured: true,
      source: env.HYPERDRIVE?.connectionString ? 'HYPERDRIVE' : 'DATABASE_URL',
      parseable: false,
    };
  }
};

const createPool = (env) => {
  const connectionString = getConnectionString(env);
  if (!connectionString) {
    throw new Error('DATABASE_URL or HYPERDRIVE binding is required.');
  }

  return new Pool({ connectionString });
};

const createSql = (env) => {
  const connectionString = getConnectionString(env);
  if (!connectionString) {
    throw new Error('DATABASE_URL or HYPERDRIVE binding is required.');
  }

  return neon(connectionString, { fullResults: true });
};

const cleanEnvValue = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/^['"]|['"]$/g, '');
};

const keyFingerprint = (value) => {
  const key = cleanEnvValue(value);
  if (!key) return null;
  return {
    length: key.length,
    prefix: key.slice(0, 8),
    suffix: key.slice(-6),
  };
};

const getTossConfig = (env) => ({
  clientKey: cleanEnvValue(env.TOSS_CLIENT_KEY || ''),
  secretKey: cleanEnvValue(env.TOSS_SECRET_KEY || ''),
  securityToken: cleanEnvValue(env.TOSS_SECURITY_TOKEN || ''),
  webhookSecret: cleanEnvValue(env.TOSS_WEBHOOK_SECRET || ''),
  merchantName: cleanEnvValue(env.TOSS_MERCHANT_NAME || '효드림'),
  environment: cleanEnvValue(env.TOSS_ENVIRONMENT || 'test'),
});

const query = async (env, text, params = []) => {
  if (!env.HYPERDRIVE?.connectionString) {
    return createSql(env).query(text, params);
  }

  const pool = createPool(env);
  try {
    return await pool.query(text, params);
  } finally {
    await pool.end();
  }
};

const withTransaction = async (env, fn) => {
  const pool = createPool(env);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

const readJson = async (request) => {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return {};
  }
  return request.json();
};

const match = (pathname, pattern) => {
  const names = [];
  const source = pattern
    .replace(/\//g, '\\/')
    .replace(/:([A-Za-z0-9_]+)/g, (_, name) => {
      names.push(name);
      return '([^/]+)';
    });
  const matched = pathname.match(new RegExp(`^${source}$`));
  if (!matched) return null;
  return Object.fromEntries(names.map((name, index) => [name, decodeURIComponent(matched[index + 1])]));
};

const ensureSchema = async (env) => {
  await query(env, `
    CREATE TABLE IF NOT EXISTS hd_users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100),
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

  await query(env, `
    CREATE TABLE IF NOT EXISTS hd_categories (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      visible BOOLEAN DEFAULT TRUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(env, `
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

  await query(env, `
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

  await query(env, `
    CREATE TABLE IF NOT EXISTS hd_custom_options (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      price INTEGER NOT NULL,
      type VARCHAR(50) NOT NULL,
      description TEXT,
      image_url TEXT
    );
  `);

  await query(env, `
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
      points_used INTEGER DEFAULT 0,
      db_created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(env, `
    CREATE TABLE IF NOT EXISTS hd_reviews (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      rating INTEGER NOT NULL,
      date VARCHAR(50) NOT NULL,
      title VARCHAR(200) DEFAULT '',
      content TEXT NOT NULL,
      package_type VARCHAR(150) NOT NULL,
      image_url TEXT,
      admin_reply TEXT DEFAULT NULL,
      user_id VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(env, 'ALTER TABLE hd_users ALTER COLUMN email DROP NOT NULL;');
  await query(env, 'ALTER TABLE hd_inquiries ADD COLUMN IF NOT EXISTS points_used INTEGER DEFAULT 0;');
  await query(env, 'ALTER TABLE hd_reviews ADD COLUMN IF NOT EXISTS title VARCHAR(200) DEFAULT \'\';');
  await query(env, 'ALTER TABLE hd_reviews ADD COLUMN IF NOT EXISTS admin_reply TEXT DEFAULT NULL;');
  await query(env, 'ALTER TABLE hd_reviews ADD COLUMN IF NOT EXISTS user_id VARCHAR(50);');
};

const ensureDefaultData = async (env) => {
  await ensureSchema(env);

  if (env.ENABLE_DEFAULT_SEED !== 'true') {
    return;
  }

  const categoryCount = await query(env, 'SELECT COUNT(*)::int AS count FROM hd_categories');
  if (Number(categoryCount.rows[0]?.count || 0) === 0) {
    await query(env, `
      INSERT INTO hd_categories (id, name, visible) VALUES
      ('cat-ritual', '차례 / 기제사상', true),
      ('cat-gosa', '고사 / 시제상', true)
      ON CONFLICT (id) DO NOTHING
    `);
  }

  const itemCount = await query(env, 'SELECT COUNT(*)::int AS count FROM hd_catalog_items');
  if (Number(itemCount.rows[0]?.count || 0) === 0) {
    await query(env, `
      INSERT INTO hd_catalog_items (id, name, description, category, ingredients, points, visible, image_url) VALUES
      ('item-jeon-01', '수제 명품 동태전', '신선한 동태포를 노릇하게 부친 대표 전 품목입니다.', 'jeon', '동태, 계란, 밀가루', ARRAY['당일 제조', '부드러운 식감'], true, 'https://images.unsplash.com/photo-1626200419199-391ae4be7a40?auto=format&fit=crop&w=600&q=80'),
      ('item-jeon-02', '정성 가득 고기완자전', '국산 돈육과 두부, 야채를 넣어 도톰하게 빚은 완자전입니다.', 'jeon', '돼지고기, 두부, 부추, 양파', ARRAY['수제 완자', '풍부한 육즙'], true, 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=600&q=80'),
      ('item-namul-01', '정갈한 삼색 나물', '고사리, 도라지, 시금치를 정갈하게 준비한 기본 나물 구성입니다.', 'namul', '고사리, 도라지, 시금치', ARRAY['삼색 구성', '전통 조리'], true, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80'),
      ('item-tang-01', '깊고 맑은 탕국', '무와 소고기, 두부를 넣어 맑고 깊게 끓인 탕국입니다.', 'tang', '소고기, 무, 두부', ARRAY['맑은 국물', '제수 기본'], true, 'https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&w=600&q=80'),
      ('item-jeok-01', '명품 육적', '양념에 재운 고기를 정성껏 구워 올리는 산적 품목입니다.', 'jeok', '소고기, 양념', ARRAY['직화 풍미', '프리미엄 구성'], true, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'),
      ('item-fruit-01', '특상품 제수용 과일', '상처 없고 신선한 제수용 과일을 엄선해 구성합니다.', 'fruit', '사과, 배, 곶감', ARRAY['특등급 선별', '완충 포장'], true, 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=600&q=80')
      ON CONFLICT (id) DO NOTHING
    `);
  }

  const menuCount = await query(env, 'SELECT COUNT(*)::int AS count FROM hd_base_menus');
  if (Number(menuCount.rows[0]?.count || 0) === 0) {
    await query(env, `
      INSERT INTO hd_base_menus (id, category_id, name, description, price, tags, item_ids, visible) VALUES
      ('kisso', 'cat-ritual', '소가족 실속상 (기제사 소)', '1~2인 가구와 핵가족을 위한 실속형 상차림입니다.', 220000, ARRAY['실속형', '1~2인', '기제사'], ARRAY['item-jeon-01', 'item-jeon-02', 'item-namul-01', 'item-tang-01'], true),
      ('kijung', 'cat-ritual', '표준 맞춤상 (기제사 중)', '가장 많이 찾으시는 3~4인용 표준 상차림입니다.', 350000, ARRAY['인기', '3~4인', '기제사'], ARRAY['item-jeon-01', 'item-jeon-02', 'item-namul-01', 'item-tang-01', 'item-jeok-01', 'item-fruit-01'], true),
      ('kidae', 'cat-ritual', '명가 전통상 (기제사 대)', '대가족을 위한 풍성한 프리미엄 상차림입니다.', 480000, ARRAY['프리미엄', '5인이상', '기제사'], ARRAY['item-jeon-01', 'item-jeon-02', 'item-namul-01', 'item-tang-01', 'item-jeok-01', 'item-fruit-01'], true),
      ('gosa', 'cat-gosa', '개업 고사상 / 시제상', '사업 번창과 평안을 기원하는 맞춤형 고사상입니다.', 290000, ARRAY['고사/시제', '맞춤형'], ARRAY['item-fruit-01'], true)
      ON CONFLICT (id) DO NOTHING
    `);
  }

  const optionCount = await query(env, 'SELECT COUNT(*)::int AS count FROM hd_custom_options');
  if (Number(optionCount.rows[0]?.count || 0) === 0) {
    await query(env, `
      INSERT INTO hd_custom_options (id, name, price, type, description, image_url) VALUES
      ('abalone', '완도산 명품 활전복 숙회 (5미)', 35000, 'addition', '고급 제수 품목으로 전복 숙회를 추가합니다.', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80'),
      ('beef', '한우 갈비찜 업그레이드', 40000, 'addition', '육류 구성을 한우 갈비찜으로 업그레이드합니다.', 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80'),
      ('sikhye', '수제 전통 식혜 (1.8L)', 10000, 'addition', '전통 방식으로 만든 식혜를 추가합니다.', 'https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&w=600&q=80'),
      ('noincense', '향/초/제문 세트 제외', -5000, 'subtraction', '향, 초, 제문 세트가 필요 없는 경우 차감합니다.', NULL),
      ('simplefruit', '과일류 간소화', -20000, 'subtraction', '기본 과일 중심으로 구성을 간소화합니다.', NULL)
      ON CONFLICT (id) DO NOTHING
    `);
  }
};

const mapInquiry = (row) => ({
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
  pointsEarned: row.points_earned,
  pointsUsed: row.points_used,
});

const inquirySelect = `
  SELECT id, customer_name, phone, ritual_type, date, time_slot, address, address_detail,
    special_requests, customizations, subtractions, total_price, created_at, status,
    admin_notes, payment_method, payment_status, toss_transaction_id, user_id,
    points_earned, points_used
  FROM hd_inquiries
`;

const handleUpload = async (request, env) => {
  if (!env.UPLOADS_BUCKET) {
    return errorJson('UPLOADS_BUCKET R2 binding is required for uploads on Cloudflare.', 501);
  }

  const formData = await request.formData();
  const file = formData.get('image');
  if (!file || typeof file === 'string') {
    return errorJson('업로드된 파일이 없습니다.', 400);
  }

  const allowedTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif']);
  if (!allowedTypes.has(file.type)) {
    return errorJson('이미지 파일만 업로드할 수 있습니다. (jpg, png, gif, webp, avif)', 400);
  }

  if (file.size > 10 * 1024 * 1024) {
    return errorJson('이미지는 최대 10MB까지 업로드할 수 있습니다.', 400);
  }

  const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : 'bin';
  const filename = `dish-${Date.now()}-${crypto.randomUUID()}.${extension}`;
  await env.UPLOADS_BUCKET.put(filename, file.stream(), {
    httpMetadata: { contentType: file.type },
  });

  return json({ url: `/uploads/${filename}`, filename });
};

const handleApi = async (request, env) => {
  const url = new URL(request.url);
  const method = request.method;
  const pathname = url.pathname;

  if (method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (pathname === '/api/health') {
    return json({ ok: true, runtime: 'cloudflare-workers' });
  }

  if (pathname === '/api/db-health') {
    const hasDatabaseUrl = Boolean(env.DATABASE_URL);
    const hasHyperdrive = Boolean(env.HYPERDRIVE?.connectionString);
    if (!hasDatabaseUrl && !hasHyperdrive) {
      return json({
        ok: false,
        hasDatabaseUrl,
        hasHyperdrive,
        error: 'DATABASE_URL or HYPERDRIVE binding is required.',
      }, 500);
    }

    const result = await query(env, 'SELECT 1 AS ok, current_database() AS database, current_user AS "user"');
    return json({
      ok: true,
      hasDatabaseUrl,
      hasHyperdrive,
      database: result.rows[0]?.database,
      user: result.rows[0]?.user,
    });
  }

  if (pathname === '/api/db-info') {
    const info = getSafeDbInfo(env);
    if (!info.configured) {
      return json({
        ok: false,
        ...info,
        error: 'DATABASE_URL or HYPERDRIVE binding is required.',
      }, 500);
    }

    return json({ ok: true, ...info });
  }

  if (pathname === '/api/db-counts') {
    await ensureSchema(env);
    const [categories, baseMenus, catalogItems, customOptions, inquiries, users, reviews] = await Promise.all([
      query(env, 'SELECT COUNT(*)::int AS count FROM hd_categories'),
      query(env, 'SELECT COUNT(*)::int AS count FROM hd_base_menus'),
      query(env, 'SELECT COUNT(*)::int AS count FROM hd_catalog_items'),
      query(env, 'SELECT COUNT(*)::int AS count FROM hd_custom_options'),
      query(env, 'SELECT COUNT(*)::int AS count FROM hd_inquiries'),
      query(env, 'SELECT COUNT(*)::int AS count FROM hd_users'),
      query(env, 'SELECT COUNT(*)::int AS count FROM hd_reviews'),
    ]);
    return json({
      categories: categories.rows[0]?.count || 0,
      baseMenus: baseMenus.rows[0]?.count || 0,
      catalogItems: catalogItems.rows[0]?.count || 0,
      customOptions: customOptions.rows[0]?.count || 0,
      inquiries: inquiries.rows[0]?.count || 0,
      users: users.rows[0]?.count || 0,
      reviews: reviews.rows[0]?.count || 0,
    });
  }

  if (pathname === '/api/payments/toss/config' && method === 'GET') {
    const config = getTossConfig(env);
    return json({
      clientKey: config.clientKey,
      merchantName: config.merchantName,
      environment: config.environment,
      enabled: Boolean(config.clientKey),
      serverConfigured: Boolean(config.secretKey),
      webhookConfigured: Boolean(config.webhookSecret || config.securityToken),
    }, 200, { 'Cache-Control': 'no-store' });
  }

  if (pathname === '/api/payments/toss/debug' && method === 'GET') {
    const config = getTossConfig(env);
    return json({
      clientKey: keyFingerprint(config.clientKey),
      secretKey: keyFingerprint(config.secretKey),
      clientLooksTest: config.clientKey.startsWith('test_ck_'),
      secretLooksTest: config.secretKey.startsWith('test_sk_'),
      serverConfigured: Boolean(config.secretKey),
      likelyQuotedSecret: typeof env.TOSS_SECRET_KEY === 'string' && /^['"]|['"]$/.test(env.TOSS_SECRET_KEY.trim()),
      likelyQuotedClient: typeof env.TOSS_CLIENT_KEY === 'string' && /^['"]|['"]$/.test(env.TOSS_CLIENT_KEY.trim()),
    }, 200, { 'Cache-Control': 'no-store' });
  }

  if (pathname === '/api/payments/toss/confirm' && method === 'POST') {
    const config = getTossConfig(env);
    if (!config.secretKey) {
      return errorJson('TOSS_SECRET_KEY is not configured.', 500);
    }

    const { paymentKey, orderId, amount } = await readJson(request);
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${config.secretKey}:`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const result = await response.json();
    if (!response.ok) {
      return json({
        error: result.message || 'Toss Payments confirm failed.',
        code: result.code,
      }, response.status);
    }

    return json(result);
  }

  if (pathname === '/api/admin/migrate' && method === 'POST') {
    const token = request.headers.get('x-migration-token');
    if (!env.MIGRATION_TOKEN || token !== env.MIGRATION_TOKEN) {
      return errorJson('Forbidden', 403);
    }
    await ensureDefaultData(env);
    return json({ success: true });
  }

  if (pathname === '/api/auth/register' && method === 'POST') {
    const body = await readJson(request);
    const { username, password, name, email, hp, tel, zip, address1, address2, mailing, sms } = body;
    const userCheck = await query(env, 'SELECT username FROM hd_users WHERE username = $1', [username]);
    if (userCheck.rows.length > 0) return errorJson('이미 사용중인 아이디입니다.', 400);

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      env,
      `INSERT INTO hd_users (username, password, name, email, hp, tel, zip, address1, address2, mailing, sms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, username, name, email, hp, tel, zip, address1, address2, mailing, sms, points`,
      [username, hashedPassword, name, email || null, hp, tel || null, zip || null, address1 || null, address2 || null, mailing, sms],
    );
    return json(result.rows[0], 201);
  }

  if (pathname === '/api/auth/login' && method === 'POST') {
    const { username, password } = await readJson(request);
    const result = await query(env, 'SELECT * FROM hd_users WHERE username = $1', [username]);
    if (result.rows.length === 0) return errorJson('존재하지 않는 아이디입니다.', 401);
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return errorJson('비밀번호가 일치하지 않습니다.', 401);
    return json({
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
      points: user.points,
    });
  }

  if (pathname === '/api/users/bulk' && method === 'POST') {
    const { users } = await readJson(request);
    if (!Array.isArray(users)) return errorJson('Invalid payload, expected array of users', 400);
    const count = await withTransaction(env, async (client) => {
      const defaultPasswordHash = await bcrypt.hash('1234', 10);
      let processedCount = 0;
      for (const u of users) {
        if (!u.username || !u.name || !u.hp) continue;
        const pwdHash = u.password ? await bcrypt.hash(u.password, 10) : defaultPasswordHash;
        await client.query(
          `INSERT INTO hd_users (username, password, name, email, hp, tel, zip, address1, address2, points)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (username) DO UPDATE
           SET name = EXCLUDED.name, email = EXCLUDED.email, hp = EXCLUDED.hp, tel = EXCLUDED.tel,
               zip = EXCLUDED.zip, address1 = EXCLUDED.address1, address2 = EXCLUDED.address2,
               points = EXCLUDED.points`,
          [u.username, pwdHash, u.name, u.email || null, u.hp, u.tel || null, u.zip || null, u.address1 || null, u.address2 || null, u.points ? parseInt(u.points) : 0],
        );
        processedCount++;
      }
      return processedCount;
    });
    return json({ success: true, count });
  }

  if (pathname === '/api/users' && method === 'GET') {
    const result = await query(env, 'SELECT username, name, email, hp, tel, zip, address1, address2, mailing, sms, points, created_at as "createdAt" FROM hd_users ORDER BY created_at DESC');
    return json(result.rows);
  }

  let params = match(pathname, '/api/users/:username/orders');
  if (params && method === 'GET') {
    const result = await query(env, `${inquirySelect} WHERE user_id = $1 ORDER BY db_created_at DESC`, [params.username]);
    return json(result.rows.map(mapInquiry));
  }

  params = match(pathname, '/api/users/:username/reviews');
  if (params && method === 'GET') {
    const result = await query(env, 'SELECT id, name, rating, date, title, content, package_type as "packageType", image_url as "imageUrl", admin_reply as "adminReply", user_id as "userId" FROM hd_reviews WHERE user_id = $1 ORDER BY id DESC', [params.username]);
    return json(result.rows);
  }

  params = match(pathname, '/api/users/:username');
  if (params && method === 'GET') {
    const result = await query(env, 'SELECT id, username, name, email, hp, tel, zip, address1, address2, mailing, sms, points, created_at FROM hd_users WHERE username = $1', [params.username]);
    if (result.rows.length === 0) return errorJson('User not found', 404);
    return json(result.rows[0]);
  }

  if (params && method === 'PUT') {
    const body = await readJson(request);
    const { name, email, hp, tel, zip, address1, address2, mailing, sms, password } = body;
    const values = [name, email, hp, tel, zip, address1, address2, mailing, sms, params.username];
    let updateQuery = `
      UPDATE hd_users
      SET name = $1, email = $2, hp = $3, tel = $4, zip = $5, address1 = $6, address2 = $7, mailing = $8, sms = $9
    `;
    if (password) {
      values.push(await bcrypt.hash(password, 10));
      updateQuery += ', password = $11 WHERE username = $10 RETURNING id, username, name, email, hp, tel, zip, address1, address2, mailing, sms, points';
    } else {
      updateQuery += ' WHERE username = $10 RETURNING id, username, name, email, hp, tel, zip, address1, address2, mailing, sms, points';
    }
    const result = await query(env, updateQuery, values);
    if (result.rows.length === 0) return errorJson('User not found', 404);
    return json(result.rows[0]);
  }

  if (pathname === '/api/categories' && method === 'GET') {
    await ensureDefaultData(env);
    const result = await query(env, 'SELECT * FROM hd_categories ORDER BY created_at ASC');
    return json(result.rows);
  }

  if (pathname === '/api/categories' && method === 'POST') {
    const { id, name, visible } = await readJson(request);
    const result = await query(env, 'INSERT INTO hd_categories (id, name, visible) VALUES ($1, $2, $3) RETURNING *', [id, name, visible !== undefined ? visible : true]);
    return json(result.rows[0], 201);
  }

  params = match(pathname, '/api/categories/:id');
  if (params && method === 'PUT') {
    const { name, visible } = await readJson(request);
    const result = await query(env, 'UPDATE hd_categories SET name = $1, visible = $2 WHERE id = $3 RETURNING *', [name, visible, params.id]);
    return json(result.rows[0]);
  }

  if (params && method === 'DELETE') {
    await query(env, 'DELETE FROM hd_categories WHERE id = $1', [params.id]);
    return json({ success: true, message: 'Category deleted (Cascade triggered)' });
  }

  if (pathname === '/api/base-menus' && method === 'GET') {
    await ensureDefaultData(env);
    const result = await query(env, 'SELECT id, category_id as "categoryId", name, description, price, tags, item_ids as "itemIds", visible FROM hd_base_menus ORDER BY created_at ASC');
    return json(result.rows);
  }

  if (pathname === '/api/base-menus' && method === 'POST') {
    const { id, categoryId, name, description, price, tags, itemIds, visible } = await readJson(request);
    const result = await query(env, 'INSERT INTO hd_base_menus (id, category_id, name, description, price, tags, item_ids, visible) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, category_id as "categoryId", name, description, price, tags, item_ids as "itemIds", visible', [id, categoryId, name, description, price, tags || [], itemIds || [], visible !== undefined ? visible : true]);
    return json(result.rows[0], 201);
  }

  params = match(pathname, '/api/base-menus/:id');
  if (params && method === 'PUT') {
    const { categoryId, name, description, price, tags, itemIds, visible } = await readJson(request);
    const result = await query(env, 'UPDATE hd_base_menus SET category_id = $1, name = $2, description = $3, price = $4, tags = $5, item_ids = $6, visible = $7 WHERE id = $8 RETURNING id, category_id as "categoryId", name, description, price, tags, item_ids as "itemIds", visible', [categoryId, name, description, price, tags, itemIds, visible, params.id]);
    return json(result.rows[0]);
  }

  if (params && method === 'DELETE') {
    await query(env, 'DELETE FROM hd_base_menus WHERE id = $1', [params.id]);
    return json({ success: true });
  }

  if (pathname === '/api/upload' && method === 'POST') {
    return handleUpload(request, env);
  }

  if (pathname === '/api/catalog-items' && method === 'GET') {
    await ensureDefaultData(env);
    const result = await query(env, 'SELECT id, name, description, category, ingredients, points, visible, image_url as "imageUrl" FROM hd_catalog_items ORDER BY created_at ASC');
    return json(result.rows);
  }

  if (pathname === '/api/catalog-items' && method === 'POST') {
    const { id, name, description, category, ingredients, points, visible, imageUrl } = await readJson(request);
    const result = await query(env, 'INSERT INTO hd_catalog_items (id, name, description, category, ingredients, points, visible, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, description, category, ingredients, points, visible, image_url as "imageUrl"', [id, name, description, category, ingredients, points || [], visible !== undefined ? visible : true, imageUrl]);
    return json(result.rows[0], 201);
  }

  params = match(pathname, '/api/catalog-items/:id');
  if (params && method === 'PUT') {
    const { name, description, category, ingredients, points, visible, imageUrl } = await readJson(request);
    const result = await query(env, 'UPDATE hd_catalog_items SET name = $1, description = $2, category = $3, ingredients = $4, points = $5, visible = $6, image_url = $7 WHERE id = $8 RETURNING id, name, description, category, ingredients, points, visible, image_url as "imageUrl"', [name, description, category, ingredients, points, visible, imageUrl, params.id]);
    return json(result.rows[0]);
  }

  if (params && method === 'DELETE') {
    await query(env, 'DELETE FROM hd_catalog_items WHERE id = $1', [params.id]);
    await query(env, 'UPDATE hd_base_menus SET item_ids = array_remove(item_ids, $1)', [params.id]);
    return json({ success: true });
  }

  if (pathname === '/api/custom-options' && method === 'GET') {
    await ensureDefaultData(env);
    const result = await query(env, 'SELECT id, name, price, type, description, image_url as "imageUrl" FROM hd_custom_options ORDER BY id ASC');
    return json(result.rows);
  }

  if (pathname === '/api/custom-options' && method === 'POST') {
    const { id, name, price, type, description, imageUrl } = await readJson(request);
    const result = await query(env, 'INSERT INTO hd_custom_options (id, name, price, type, description, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, price, type, description, image_url as "imageUrl"', [id, name, price, type, description, imageUrl]);
    return json(result.rows[0], 201);
  }

  params = match(pathname, '/api/custom-options/:id');
  if (params && method === 'PUT') {
    const { name, price, type, description, imageUrl } = await readJson(request);
    const result = await query(env, 'UPDATE hd_custom_options SET name = $1, price = $2, type = $3, description = $4, image_url = $5 WHERE id = $6 RETURNING id, name, price, type, description, image_url as "imageUrl"', [name, price, type, description, imageUrl, params.id]);
    return json(result.rows[0]);
  }

  if (params && method === 'DELETE') {
    await query(env, 'DELETE FROM hd_custom_options WHERE id = $1', [params.id]);
    return json({ success: true });
  }

  if (pathname === '/api/inquiries' && method === 'GET') {
    const result = await query(env, `${inquirySelect} ORDER BY db_created_at DESC`);
    return json(result.rows.map(mapInquiry));
  }

  if (pathname === '/api/inquiries' && method === 'POST') {
    const body = await readJson(request);
    const pointsEarned = Math.floor(Number(body.totalPrice || 0) * 0.01);
    const used = body.pointsUsed || 0;
    const result = await withTransaction(env, async (client) => {
      const inserted = await client.query(
        `INSERT INTO hd_inquiries (id, customer_name, phone, ritual_type, date, time_slot, address, address_detail, special_requests, customizations, subtractions, total_price, created_at, status, admin_notes, payment_method, payment_status, toss_transaction_id, user_id, points_earned, points_used)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
         RETURNING *`,
        [body.id, body.customerName, body.phone, body.ritualType, body.date, body.timeSlot, body.address, body.addressDetail, body.specialRequests, body.customizations || [], body.subtractions || [], body.totalPrice, body.createdAt, body.status || 'pending', body.adminNotes, body.paymentMethod, body.paymentStatus || 'pending', body.tossTransactionId, body.userId || null, pointsEarned, used],
      );
      if (body.userId && body.paymentStatus === 'paid') {
        await client.query('UPDATE hd_users SET points = points + $1 WHERE username = $2', [pointsEarned, body.userId]);
      }
      if (body.userId && used > 0) {
        await client.query('UPDATE hd_users SET points = GREATEST(points - $1, 0) WHERE username = $2', [used, body.userId]);
      }
      return inserted;
    });
    return json(mapInquiry(result.rows[0]), 201);
  }

  params = match(pathname, '/api/inquiries/:id');
  if (params && method === 'PUT') {
    const body = await readJson(request);
    const result = await withTransaction(env, async (client) => {
      const existing = await client.query('SELECT * FROM hd_inquiries WHERE id = $1', [params.id]);
      if (existing.rows.length === 0) return null;
      const inquiry = existing.rows[0];
      const requestedPaymentStatus = body.paymentStatus || inquiry.payment_status;
      let newPaymentStatus = requestedPaymentStatus;
      let nextStatus = body.status || inquiry.status;
      const nextTotalPrice = Number(body.totalPrice ?? inquiry.total_price);
      const nextPointsEarned = Math.floor(nextTotalPrice * 0.01);
      const nextUserId = body.userId ?? inquiry.user_id;
      const previousPointsEarned = inquiry.points_earned || Math.floor(Number(inquiry.total_price || 0) * 0.01);
      let nextPointsUsed = body.pointsUsed ?? inquiry.points_used ?? 0;

      if (requestedPaymentStatus === 'paid' && (nextStatus === 'pending' || nextStatus === 'cancelled')) nextStatus = 'approved';
      if (requestedPaymentStatus === 'pending') nextStatus = 'pending';
      if (requestedPaymentStatus === 'cancelled') nextStatus = 'cancelled';
      if (newPaymentStatus !== 'cancelled' && inquiry.payment_status !== 'paid' && (nextStatus === 'approved' || nextStatus === 'completed')) newPaymentStatus = 'paid';

      if (inquiry.payment_status !== 'paid' && newPaymentStatus === 'paid' && nextUserId) {
        await client.query('UPDATE hd_users SET points = points + $1 WHERE username = $2', [nextPointsEarned, nextUserId]);
      }
      if (inquiry.payment_status === 'paid' && newPaymentStatus === 'paid' && nextUserId && nextPointsEarned !== previousPointsEarned) {
        const delta = nextPointsEarned - previousPointsEarned;
        await client.query(delta > 0 ? 'UPDATE hd_users SET points = points + $1 WHERE username = $2' : 'UPDATE hd_users SET points = GREATEST(points - $1, 0) WHERE username = $2', [Math.abs(delta), nextUserId]);
      }
      if (nextStatus === 'cancelled') newPaymentStatus = 'cancelled';
      if (inquiry.payment_status === 'paid' && newPaymentStatus !== 'paid' && nextUserId && previousPointsEarned > 0) {
        await client.query('UPDATE hd_users SET points = GREATEST(points - $1, 0) WHERE username = $2', [previousPointsEarned, nextUserId]);
      }
      if (inquiry.status !== 'cancelled' && nextStatus === 'cancelled' && nextUserId && inquiry.points_used > 0) {
        await client.query('UPDATE hd_users SET points = points + $1 WHERE username = $2', [inquiry.points_used, nextUserId]);
        nextPointsUsed = inquiry.points_used || 0;
      }
      if (inquiry.status === 'cancelled' && nextStatus !== 'cancelled' && newPaymentStatus === 'paid' && nextUserId && inquiry.points_used > 0) {
        await client.query('UPDATE hd_users SET points = GREATEST(points - $1, 0) WHERE username = $2', [inquiry.points_used, nextUserId]);
        nextPointsUsed = inquiry.points_used || 0;
      }

      return client.query(
        `UPDATE hd_inquiries SET customer_name = $1, phone = $2, ritual_type = $3, date = $4,
         time_slot = $5, address = $6, address_detail = $7, special_requests = $8,
         customizations = $9, subtractions = $10, total_price = $11, status = $12,
         admin_notes = $13, payment_method = $14, payment_status = $15, toss_transaction_id = $16,
         user_id = $17, points_earned = $18, points_used = $19
         WHERE id = $20 RETURNING *`,
        [body.customerName ?? inquiry.customer_name, body.phone ?? inquiry.phone, body.ritualType ?? inquiry.ritual_type, body.date ?? inquiry.date, body.timeSlot ?? inquiry.time_slot, body.address ?? inquiry.address, body.addressDetail ?? inquiry.address_detail, body.specialRequests ?? inquiry.special_requests, body.customizations ?? inquiry.customizations ?? [], body.subtractions ?? inquiry.subtractions ?? [], nextTotalPrice, nextStatus, body.adminNotes ?? inquiry.admin_notes, body.paymentMethod ?? inquiry.payment_method, newPaymentStatus, body.tossTransactionId ?? inquiry.toss_transaction_id, nextUserId, nextPointsEarned, nextPointsUsed, params.id],
      );
    });
    if (!result) return errorJson('Not found', 404);
    return json(mapInquiry(result.rows[0]));
  }

  if (params && method === 'DELETE') {
    const deleted = await withTransaction(env, async (client) => {
      const existing = await client.query('SELECT * FROM hd_inquiries WHERE id = $1', [params.id]);
      if (existing.rows.length === 0) return false;
      const inquiry = existing.rows[0];
      if (inquiry.user_id) {
        if (inquiry.payment_status === 'paid') {
          const pointsToDeduct = inquiry.points_earned || Math.floor(Number(inquiry.total_price || 0) * 0.01);
          if (pointsToDeduct > 0) await client.query('UPDATE hd_users SET points = GREATEST(points - $1, 0) WHERE username = $2', [pointsToDeduct, inquiry.user_id]);
        }
        if (inquiry.status !== 'cancelled' && inquiry.points_used > 0) {
          await client.query('UPDATE hd_users SET points = points + $1 WHERE username = $2', [inquiry.points_used, inquiry.user_id]);
        }
      }
      await client.query('DELETE FROM hd_inquiries WHERE id = $1', [params.id]);
      return true;
    });
    if (!deleted) return errorJson('Not found', 404);
    return json({ success: true });
  }

  if (pathname === '/api/reviews' && method === 'GET') {
    const result = await query(env, 'SELECT id, name, rating, date, title, content, package_type as "packageType", image_url as "imageUrl", admin_reply as "adminReply", user_id as "userId" FROM hd_reviews ORDER BY id DESC');
    return json(result.rows);
  }

  if (pathname === '/api/reviews' && method === 'POST') {
    const { name, rating, date, title, content, packageType, imageUrl, userId } = await readJson(request);
    const result = await query(env, 'INSERT INTO hd_reviews (name, rating, date, title, content, package_type, image_url, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, rating, date, title, content, package_type as "packageType", image_url as "imageUrl", admin_reply as "adminReply", user_id as "userId"', [name, rating, date, title || '', content, packageType, imageUrl || null, userId || null]);
    return json(result.rows[0], 201);
  }

  params = match(pathname, '/api/reviews/:id/reply');
  if (params && method === 'PUT') {
    const { adminReply } = await readJson(request);
    const result = await query(env, 'UPDATE hd_reviews SET admin_reply = $1 WHERE id = $2 RETURNING id, name, rating, date, title, content, package_type as "packageType", image_url as "imageUrl", admin_reply as "adminReply", user_id as "userId"', [adminReply || null, params.id]);
    if (result.rows.length === 0) return errorJson('Review not found', 404);
    return json(result.rows[0]);
  }

  params = match(pathname, '/api/reviews/:id');
  if (params && method === 'PUT') {
    const { userId, rating, title, content, packageType, imageUrl } = await readJson(request);
    if (!userId) return errorJson('로그인 사용자 정보가 필요합니다.', 400);
    if (!title || !content || String(content).trim().length < 10) return errorJson('후기 제목과 10자 이상의 내용을 입력해 주세요.', 400);
    const result = await query(env, 'UPDATE hd_reviews SET rating = $1, title = $2, content = $3, package_type = $4, image_url = $5 WHERE id = $6 AND user_id = $7 RETURNING id, name, rating, date, title, content, package_type as "packageType", image_url as "imageUrl", admin_reply as "adminReply", user_id as "userId"', [rating, title, content, packageType, imageUrl || null, params.id, userId]);
    if (result.rows.length === 0) return errorJson('본인이 작성한 후기만 수정할 수 있습니다.', 403);
    return json(result.rows[0]);
  }

  if (params && method === 'DELETE') {
    await query(env, 'DELETE FROM hd_reviews WHERE id = $1', [params.id]);
    return json({ success: true });
  }

  return errorJson('Not found', 404);
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (url.pathname.startsWith('/api/')) {
        return await handleApi(request, env);
      }

      if (url.pathname.startsWith('/uploads/') && env.UPLOADS_BUCKET) {
        const key = decodeURIComponent(url.pathname.replace('/uploads/', ''));
        const object = await env.UPLOADS_BUCKET.get(key);
        if (!object) return new Response('Not found', { status: 404 });
        return new Response(object.body, { headers: object.httpMetadata || {} });
      }

      if (env.ASSETS) {
        const response = await env.ASSETS.fetch(request);
        if (response.status !== 404) return response;
        return env.ASSETS.fetch(new Request(new URL('/index.html', url), request));
      }

      return new Response('Cloudflare assets binding is not configured.', { status: 500 });
    } catch (err) {
      console.error('[HyoDream Worker]', err);
      return errorJson(err);
    }
  },
};
