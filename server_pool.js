import { createServer } from 'http'
import pg from 'pg'

const PORT = 3000

const pool = new pg.Pool({
  host: 'host.docker.internal',
  host: '127.0.0.1',
  port: 5433,
  database: 'garbage',
  user: 'postgres',
  password: 'postgres',
})

await pool.connect();

async function run() {
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


  createServer(async (req, res) => {
    const date = new Date()

    try {
      await pool.query(
        `
          begin;
          update test set count = count + 1;
          commit;
        `
      )

      const end = new Date().getTime() - date.getTime()
      res.end(`${end}`)

    } catch (e) {
      await pool.query(`rollback;`)
      console.log(e);
      res.end('something went wrong')
    }
  }).listen(PORT, () => { console.log(`up on ${PORT}`) })

}

run()
