import { afterAll, beforeAll, test, describe, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app";



describe('Transactions Routes', () => {
  
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
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
  
})
