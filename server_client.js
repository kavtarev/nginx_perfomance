import { createServer } from 'http'
import pg from 'pg'

const PORT = 3000

async function run() {
  const client = new pg.Client({
    host: '127.0.0.1',
    port: 5433,
    database: 'garbage',
    user: 'postgres',
    password: 'postgres',
  })

  await client.connect();
  await client.query(`drop table test`)

  await client.query(
    `
      create table test (
        id serial primary key
        , count int
      )
    `
  );
  await client.query(`insert into test (count) values(0)`);
  await client.end()

  createServer(async (req, res) => {
    try {
      const client = new pg.Client({
        host: '127.0.0.1',
        port: 5433,
        database: 'garbage',
        user: 'postgres',
        password: 'postgres',
      })
      await client.connect()
      await client.query(
        `
          begin;
          update test set count = count + 1;
          commit;
        `
      )
      await client.end()
      res.end('res')

    } catch (e) {
      await client.query(`rollback;`)
      console.log(e);
      res.end('something went wrong')
    }
  }).listen(PORT, () => { console.log(`up on ${PORT}`) })

}

run()
