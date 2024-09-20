import { knex as setupKnex, Knex } from "knex";

export const config = {
client: 'sqlite',
  connection: {
    filename: './db/app.db'
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations'
  }
}


export const knex = setupKnex(config)
