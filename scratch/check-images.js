import pg from 'pg';

const { Pool } = pg;
const databaseUrl = 'postgresql://neondb_owner:npg_Po6ikELGX3fA@ep-hidden-meadow-aoe4575u-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const pool = new Pool({
  connectionString: databaseUrl,
});

async function checkImages() {
  const client = await pool.connect();
  try {
    console.log('--- CATALOG ITEMS ---');
    const items = await client.query('SELECT id, name, image_url FROM hd_catalog_items');
    for (const row of items.rows) {
      console.log(`ID: ${row.id} | Name: ${row.name} | Image URL length: ${row.image_url ? row.image_url.length : 0} | Prefix: ${row.image_url ? row.image_url.substring(0, 50) : 'null'}`);
    }

    console.log('\n--- CUSTOM OPTIONS ---');
    const opts = await client.query('SELECT id, name, image_url FROM hd_custom_options');
    for (const row of opts.rows) {
      console.log(`ID: ${row.id} | Name: ${row.name} | Image URL length: ${row.image_url ? row.image_url.length : 0} | Prefix: ${row.image_url ? row.image_url.substring(0, 50) : 'null'}`);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

checkImages();
