import { FastifyInstance } from "fastify";
import { z } from "zod";
import crypto from "node:crypto";
import { knex } from "../database";


export async function transactionsRoutes(app: FastifyInstance){ 

  app.post('/', async (request, reply) => {
    try {
      //{Title, amount, type: credit ou debit}
      
      const createTranjsactionBodySchema = z.object({
        title: z.string(),
        amount: z.number(),
        type: z.enum(['credit', 'debit'])
      })

      const { title, amount, type } = createTranjsactionBodySchema.parse(request.body);
      
      await knex('transactions')
       .insert({
         id: crypto.randomUUID(),
         title,
         amount: type === 'credit' ? amount : amount * -1,
       })

      // HTTP Codes
      return reply.status(201).send()

    } catch (error) {
      console.log(" deu ruim rapaziada")
    }
  })
}