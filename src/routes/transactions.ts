import { FastifyInstance } from "fastify";
import { z } from "zod";
import crypto from "node:crypto";
import { knex } from "../database";

// Cookie <-> formas da gente manter contexto entre requesições


export async function transactionsRoutes(app: FastifyInstance){ 

  // List Transactions
  app.get('/', async () => {
    const transactions = await knex('transactions'). select('*')

    return {
      transactions
    }
  })

  //Busca detalhes de uma transação única.
  app.get('/:id', async (request) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getTransactionParamsSchema.parse(request.params);

    const transaction = await knex('transactions').where('id', id).first()

    return { 
      transaction
    }
  })

  //Resum de uma transação
  app.get('/summary', async () => {
    const summary = await knex ('transactions').sum('amount', { as: 'amount'}).first()
    
    return {
      summary
    }
  })

  //Create Transaction
  app.post('/', async (request, reply) => {
    try {
      //{Title, amount, type: credit ou debit}
      
      const createTranjsactionBodySchema = z.object({
        title: z.string(),
        amount: z.number(),
        type: z.enum(['credit', 'debit'])
      })

      const { title, amount, type } = createTranjsactionBodySchema.parse(request.body);
      
      let sessionId = request.cookies.sessionId;
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        
        reply.cookie('sessionId', sessionId, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        })

      }

      await knex('transactions')
       .insert({
         id: crypto.randomUUID(),
         title,
         amount: type === 'credit' ? amount : amount * -1,
         session_id: sessionId,
       })

      // HTTP Codes
      return reply.status(201).send()

    } catch (error) {
      console.log(" deu ruim rapaziada")
    }
  })
}