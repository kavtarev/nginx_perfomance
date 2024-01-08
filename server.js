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


  createServer(async (req, res) => {
    try {
      await client.query(
        `
          begin;
          update test set count = count + 1;
          commit;
        `
      )
      res.end('res')

    } catch (e) {
      await client.query(`rollback;`)
      console.log(e);
      res.end('something went wrong')
    } finally {
      await client.end()
    }
  }).listen(PORT, () => { console.log(`up on ${PORT}`) })

}

run()
