import twilio from 'twilio'
import logger from '../utils/logger.js'

// Twilioクライアントの初期化
let twilioClient: twilio.Twilio | null = null

function getTwilioClient(): twilio.Twilio {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials are not configured')
    }

    twilioClient = twilio(accountSid, authToken)
    logger.info('Twilio client initialized')
  }

  return twilioClient
}

interface CallOptions {
  to: string
  message: string
  voice?: 'alice' | 'man' | 'woman'
  language?: string
}

/**
 * 電話をかける
 */
export async function makePhoneCall(to: string, message: string): Promise<string> {
  try {
    const client = getTwilioClient()
    const fromNumber = process.env.TWILIO_PHONE_NUMBER

    if (!fromNumber) {
      throw new Error('TWILIO_PHONE_NUMBER is not configured')
    }

    // 日本の電話番号形式に変換（0から始まる場合は+81に変換）
    let formattedTo = to
    if (to.startsWith('0')) {
      formattedTo = '+81' + to.substring(1)
    } else if (!to.startsWith('+')) {
      formattedTo = '+81' + to
    }

    // TwiMLを生成（音声メッセージ）
    const twimlUrl = `${process.env.BASE_URL || 'https://anpee.jp'}/api/v1/twilio/twiml?message=${encodeURIComponent(message)}`

    const call = await client.calls.create({
      to: formattedTo,
      from: fromNumber,
      url: twimlUrl,
      method: 'GET',
      statusCallback: `${process.env.BASE_URL || 'https://anpee.jp'}/api/v1/twilio/status`,
      statusCallbackMethod: 'POST',
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
    })

    logger.info('Phone call initiated', { 
      callSid: call.sid, 
      to: formattedTo,
      status: call.status 
    })

    return call.sid
  } catch (error) {
    logger.error('Failed to make phone call', { error, to })
    throw error
  }
}

/**
 * 安否確認電話をかける
 */
export async function makeSafetyCheckCall(
  to: string, 
  elderlyName: string,
  responseToken: string
): Promise<string> {
  const message = `こちらは、あんぴーちゃんです。${elderlyName}さんの安否確認のお電話です。お元気でしたら、1番を押してください。`
  
  // 応答を受け付けるTwiMLエンドポイント
  const twimlUrl = `${process.env.BASE_URL || 'https://anpee.jp'}/api/v1/twilio/safety-check?token=${responseToken}&name=${encodeURIComponent(elderlyName)}`

  try {
    const client = getTwilioClient()
    const fromNumber = process.env.TWILIO_PHONE_NUMBER

    if (!fromNumber) {
      throw new Error('TWILIO_PHONE_NUMBER is not configured')
    }

    // 日本の電話番号形式に変換
    let formattedTo = to
    if (to.startsWith('0')) {
      formattedTo = '+81' + to.substring(1)
    } else if (!to.startsWith('+')) {
      formattedTo = '+81' + to
    }

    const call = await client.calls.create({
      to: formattedTo,
      from: fromNumber,
      url: twimlUrl,
      method: 'GET',
      statusCallback: `${process.env.BASE_URL || 'https://anpee.jp'}/api/v1/twilio/status`,
      statusCallbackMethod: 'POST',
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      machineDetection: 'DetectMessageEnd',
      asyncAmd: 'true'
    })

    logger.info('Safety check call initiated', { 
      callSid: call.sid, 
      to: formattedTo,
      elderlyName 
    })

    return call.sid
  } catch (error) {
    logger.error('Failed to make safety check call', { error, to, elderlyName })
    throw error
  }
}

/**
 * SMS送信
 */
export async function sendSMS(to: string, message: string): Promise<string> {
  try {
    const client = getTwilioClient()
    const fromNumber = process.env.TWILIO_PHONE_NUMBER

    if (!fromNumber) {
      throw new Error('TWILIO_PHONE_NUMBER is not configured')
    }

    // 日本の電話番号形式に変換
    let formattedTo = to
    if (to.startsWith('0')) {
      formattedTo = '+81' + to.substring(1)
    } else if (!to.startsWith('+')) {
      formattedTo = '+81' + to
    }

    const sms = await client.messages.create({
      body: message,
      to: formattedTo,
      from: fromNumber
    })

    logger.info('SMS sent', { 
      messageSid: sms.sid, 
      to: formattedTo 
    })

    return sms.sid
  } catch (error) {
    logger.error('Failed to send SMS', { error, to })
    throw error
  }
}

/**
 * 通話ステータスを取得
 */
export async function getCallStatus(callSid: string): Promise<string> {
  try {
    const client = getTwilioClient()
    const call = await client.calls(callSid).fetch()
    return call.status
  } catch (error) {
    logger.error('Failed to get call status', { error, callSid })
    throw error
  }
}