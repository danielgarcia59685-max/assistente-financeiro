const { Client } = require('pg');

const connectionString = 'postgresql://postgres.hexluskvmrspfmekaypr:assistentepro2.0dlsa@aws-0-us-west-2.pooler.supabase.com:6543/postgres';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function deleteAllUsers() {
  try {
    await client.connect();
    console.log('Conectado ao banco');

    // Delete all users (cascata apagará tabelas relacionadas que usam ON DELETE CASCADE)
    const res = await client.query('DELETE FROM public.users');
    console.log('Todos os usuários foram removidos.');

    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Erro ao apagar usuários:', err.message);
    await client.end();
    process.exit(1);
  }
}

deleteAllUsers();
