import { createServer } from 'http'
import pg from 'pg'

const PORT = 3000

const pool = new pg.Pool({
  host: 'host.docker.internal',
  port: 5433,
  database: 'garbage',
  user: 'postgres',
  password: 'postgres',
})


async function run() {
  await createTable()

  createServer(async (req, res) => {
    const date = new Date()

    const client = await pool.connect();

    try {
      await client.query(`begin;`)
      await client.query(`update test set count = count + 1;`)
      await client.query(`commit;`)

      const end = new Date().getTime() - date.getTime()
      res.end(`${end}`)

    } catch (e) {
      await client.query(`rollback;`)
      console.log(e);
      res.end('something went wrong')
    } finally {
      client.release()
    }
  }).listen(PORT, () => { console.log(`up on ${PORT}`) })
}

async function createTable() {
  await pool.query(`drop table test`)
  await pool.query(
    `
      create table test (
        id serial primary key
        , count int
      )
    `
  );
  await pool.query(`insert into test (count) values(0)`);
}

run()
