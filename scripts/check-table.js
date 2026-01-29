const { Client } = require('pg');

const connectionString = 'postgresql://postgres.hexluskvmrspfmekaypr:assistentepro2.0dlsa@aws-0-us-west-2.pooler.supabase.com:6543/postgres';

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

(async () => {
  try {
    await client.connect();
    const res = await client.query("SELECT to_regclass('public.phone_verifications') AS reg");
    console.log('to_regclass:', res.rows[0]);
    const count = await client.query("SELECT count(*) AS c FROM information_schema.tables WHERE table_schema='public' AND table_name='phone_verifications'");
    console.log('table exists count:', count.rows[0]);
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
})();
