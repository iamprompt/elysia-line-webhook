import Elysia from 'elysia'
import { type WebhookRequestBody } from '@line/bot-sdk'
import { verifySignatureFn } from './utils'

export type LINEWebhookChannelSecrets = {
  /**
   * Bot User ID
   * @example 'U4af4980629...'
   */
  botUserId: string

  /**
   * Channel Secret
   * @example 'f7c7c3d8...'
   */
  channelSecret: string
}

export type LINEWebhookPluginOptions = {
  /**
   * Automatically verify the signature of the incoming request
   * Defaults to true if `secrets` or `secret` is provided, otherwise false
   * @default true
   */
  verifySignature?: boolean
  /**
   * List of LINE Messaging API Channel Secrets
   * This can be derived from LINE Developers Console
   */
  channels?: LINEWebhookChannelSecrets[]
  /**
   * LINE Messaging API Channel Secret
   */
  channelSecret?: string
}

export const lineWebhook = ({
  verifySignature,
  channels = [],
  channelSecret,
}: LINEWebhookPluginOptions = {}) => {
  if (verifySignature === undefined) {
    verifySignature = channels.length > 0 || !!channelSecret
  }

  return new Elysia({
    name: 'elysia-line-webhook',
  }).resolve({ as: 'scoped' }, async ({ headers, body, error }) => {
    const signature = headers['x-line-signature'] || ''
    const webhookBody = body as WebhookRequestBody

    const verify = verifySignatureFn(webhookBody, signature, error)

    if (verifySignature) {
      const secret =
        channelSecret ??
        channels.find((channel) => {
          return webhookBody.destination === channel.botUserId
        })?.channelSecret

      if (!secret) {
        throw error(
          'Unauthorized',
          `Channel Secret not provided for bot user ID: ${webhookBody.destination}`,
        )
      }

      verify(secret)
    }

    return {
      signature,
      body: webhookBody,
      verifySignature: verify,
    }
  })
}
