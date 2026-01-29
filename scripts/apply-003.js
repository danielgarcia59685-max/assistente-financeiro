const { Client } = require('pg');
const fs = require('fs');

const connectionString = 'postgresql://postgres.hexluskvmrspfmekaypr:assistentepro2.0dlsa@aws-0-us-west-2.pooler.supabase.com:6543/postgres';
const sqlFile = 'supabase/migrations/003_create_phone_verifications.sql';

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

(async () => {
  try {
    await client.connect();
    console.log('✓ Conectado ao banco de dados');
    const sql = fs.readFileSync(sqlFile, 'utf-8');
    await client.query(sql);
    console.log('✓ Migration 003 aplicada com sucesso!');
  } catch (err) {
    console.error('✗ Erro ao aplicar migration 003:', err.message || err);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
