const { Client } = require('pg');
const fs = require('fs');

const connectionString = 'postgresql://postgres.hexluskvmrspfmekaypr:assistentepro2.0dlsa@aws-0-us-west-2.pooler.supabase.com:6543/postgres';
const sqlFile = 'supabase/migrations/001_create_transactions.sql';

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }, // Required for Supabase
});

async function applyMigration() {
  try {
    await client.connect();
    console.log('✓ Conectado ao banco de dados');

    const sql = fs.readFileSync(sqlFile, 'utf-8');
    await client.query(sql);
    console.log('✓ Migration aplicada com sucesso!');
  } catch (err) {
    console.error('✗ Erro ao aplicar migration:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();
