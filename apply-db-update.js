const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Decodificar password que pode conter caracteres especiais
const connectionString = 'postgresql://postgres.hexluskvmrspfmekaypr:assistentepro2.0dlsa@aws-0-us-west-2.pooler.supabase.com:6543/postgres';
const sqlFile = path.join(__dirname, 'supabase/migrations/001_create_transactions.sql');

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false },
});

async function applyMigration() {
  try {
    await client.connect();
    console.log('✓ Conectado ao banco de dados');

    const sql = fs.readFileSync(sqlFile, 'utf-8');
    await client.query(sql);
    console.log('✓ Migration aplicada com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('✗ Erro ao aplicar migration:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();
