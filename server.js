import { createServer } from 'http'
import pg from 'pg'

const PORT = 3000

const client = new pg.Client({
  host: '127.0.0.1',
  port: 5433,
  database: 'garbage',
  user: 'postgres',
  password: 'postgres',
})

async function run() {
  await client.connect();
  await client.query('create table if not exists test (id int)');

  createServer((req, res) => {
    res.end('hello')
  }).listen(PORT, () => { console.log(`up on ${PORT}`) })

}

run()
