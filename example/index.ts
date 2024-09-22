import Elysia from 'elysia'
import { lineWebhook } from '../src'

new Elysia({ precompile: true })
  .guard((app) => {
    return app
      .use(lineWebhook())
      .post('/webhook-1', async ({ body, verifySignature }) => {
        // Manually verify x-line-signature by providing the channel secret later in the code
        verifySignature(process.env.LINE_CHANNEL_SECRET)

        console.log(body)
      })
  })
  .guard((app) => {
    return app
      .use(lineWebhook({ channelSecret: process.env.LINE_CHANNEL_SECRET }))
      .post('/webhook-2', async ({ body }) => {
        // x-line-signature is automatically verified
        console.log(body)
      })
  })
  .guard((app) => {
    return app
      .use(
        lineWebhook({
          channels: [
            {
              botUserId: process.env.LINE_CHANNEL_USER_ID,
              channelSecret: process.env.LINE_CHANNEL_SECRET,
            },
          ],
        }),
      )
      .post('/webhook-3', async ({ body }) => {
        // x-line-signature is automatically verified
        console.log(body)
      })
  })
  .listen(3000)
