import { afterAll, beforeAll, test, describe, expect } from "vitest";
import { execSync } from "node:child_process";
import request from "supertest";
import { app } from "../src/app";
import { beforeEach } from "node:test";



describe('Transactions Routes', () => {
  
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  })


  test("User can create a new transaction", async () => {
    
    await request(app.server)
      .post("/transactions")
      .send({
          title: 'New transaction',
          amount: 1000,
          type: 'credit',
      })
      .expect(200)
  })

  test("User can list all transactions", async () => {

    try {
      const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 1000,
        type: 'credit',
      })
      
    const cookies = createTransactionResponse.get('Set-Cookie') || []
    
    const listTransactionResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)
      
    expect(listTransactionResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New transaction',
        amount: 1000,
      })
    ])
    } 
    catch (error) {
      console.error(error)
    }
  })

  test("User can list specific transactions", async () => {
    try {
      const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 1000,
        type: 'credit',
      })
      
    const cookies = createTransactionResponse.get('Set-Cookie') || []
    
    const listTransactionResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    const transactionId = listTransactionResponse.body.transaction[0].id;
     
    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200)
    

    expect(getTransactionResponse.body.transactions).toEqual(
      expect.objectContaining({
        title: 'New transaction',
        amount: 1000,
      })
    )


    } 
    catch (error) {
      console.error(error)
    }
  })

  test("User can get the summary", async () => {

    try {
      const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Credit transaction',
        amount: 1000,
        type: 'credit',
      })
      
    const cookies = createTransactionResponse.get('Set-Cookie') || []

    await request(app.server)
      .post('/transactions')
      .send({
        title: 'Debit transaction',
        amount: 2000,
        type: 'debit',
      })

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200)
      
    expect(summaryResponse.body.summary).toEqual({
      amount: 3000,
    })

    } 
    catch (error) {
      console.error(error)
    }
  })
  
})
