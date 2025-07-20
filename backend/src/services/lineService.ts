import { Client, WebhookEvent, TextMessage, MessageAPIResponseBase } from '@line/bot-sdk';
import crypto from 'crypto';
import { Response } from '../models/Response.js';
import Elderly from '../models/Elderly.js';
import { LineUser } from '../models/LineUser.js';

// LINE Bot SDK クライアントの初期化
const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
});

console.log('LINE環境変数チェック:', {
  hasAccessToken: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
  hasSecret: !!process.env.LINE_CHANNEL_SECRET,
});

// 署名検証
export const validateSignature = (body: string, signature: string): boolean => {
  const channelSecret = process.env.LINE_CHANNEL_SECRET || '';
  const hash = crypto
    .createHmac('SHA256', channelSecret)
    .update(body)
    .digest('base64');
  return hash === signature;
};

// Webhookイベント処理
export const handleWebhook = async (events: WebhookEvent[]): Promise<void> => {
  console.log('Webhook受信:', JSON.stringify(events, null, 2));
  await Promise.all(events.map(handleEvent));
};

// 汎用的なLINEメッセージ送信関数
export const sendLineMessage = async (userId: string, messages: any[]): Promise<MessageAPIResponseBase> => {
  return await client.pushMessage(userId, messages);
};

// 個別イベント処理
const handleEvent = async (event: WebhookEvent): Promise<MessageAPIResponseBase | void> => {
  // フォローイベント（友だち追加）
  if (event.type === 'follow' && event.source.type === 'user') {
    const userId = event.source.userId;
    await sendWelcomeMessage(userId);
    return;
  }

  // メッセージイベント
  if (event.type === 'message' && event.message.type === 'text' && event.source.type === 'user') {
    const userId = event.source.userId;
    const text = event.message.text;
    console.log('メッセージ受信:', { userId, text });

    // 登録コマンドの処理
    if (text.startsWith('登録:')) {
      const registrationCode = text.replace('登録:', '').trim();
      console.log('登録コード処理開始:', { userId, registrationCode });
      await handleRegistration(userId, registrationCode);
      return;
    }
  }

  // ポストバックイベント（将来の拡張用）
  if (event.type === 'postback' && event.source.type === 'user') {
    const userId = event.source.userId;
    const data = event.postback.data;
    
    // 元気ですボタンの応答処理などを将来実装
    console.log('Postback received:', { userId, data });
  }
};

// ウェルカムメッセージ送信
const sendWelcomeMessage = async (userId: string): Promise<void> => {
  const welcomeMessage: TextMessage = {
    type: 'text',
    text: `はじめまして！あんぴーちゃんです🌸

毎日の安否確認をお手伝いします。

まずは、ご家族の方から受け取った「登録コード」を入力してください。

例：登録:ABC123

ご不明な点がございましたら、ご家族の方にお問い合わせください。`,
  };

  await client.pushMessage(userId, welcomeMessage);
};

// 登録処理
const handleRegistration = async (userId: string, registrationCode: string): Promise<void> => {
  try {
    // 登録コードから家族情報を検索
    const elderly = await Elderly.findOne({ registrationCode, status: 'active' });

    if (!elderly) {
      await client.pushMessage(userId, {
        type: 'text',
        text: '登録コードが見つかりません。正しいコードか確認してください。',
      });
      return;
    }

    // 既に登録済みかチェック
    const existingUser = await LineUser.findOne({ elderlyId: elderly._id });
    if (existingUser) {
      await client.pushMessage(userId, {
        type: 'text',
        text: 'このコードは既に使用されています。',
      });
      return;
    }

    // LINEユーザー情報を取得
    let profile: { displayName: string; pictureUrl?: string } = { displayName: '未設定' };
    try {
      const lineProfile = await client.getProfile(userId);
      profile = lineProfile;
    } catch (profileError: any) {
      console.error('プロファイル取得エラー:', profileError.response?.status);
      console.error('アクセストークンの確認が必要です');
    }

    // LineUserモデルに保存
    await LineUser.create({
      userId,
      elderlyId: elderly._id,
      displayName: profile.displayName || elderly.name,
      pictureUrl: profile.pictureUrl,
      registeredAt: new Date(),
    });

    // 家族情報を更新
    elderly.hasGenKiButton = true;
    elderly.lineUserId = userId;
    await elderly.save();

    await client.pushMessage(userId, {
      type: 'text',
      text: `${elderly.name}さん、登録が完了しました！✨

明日の朝から、毎日「元気です」ボタンをお送りします。

ボタンを押すだけで、ご家族に元気なことが伝わります。

どうぞよろしくお願いします🌸`,
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    console.error('Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    // エラー時のpushMessageは避ける（無限ループ防止）
    console.error('登録エラーが発生しました。ユーザーID:', userId);
  }
};

// 元気確認メッセージ送信（定期実行用）
export const sendDailyGenkiMessage = async (elderlyId: string): Promise<void> => {
  try {
    const elderly = await Elderly.findById(elderlyId);
    if (!elderly || !elderly.lineUserId) return;

    const lineUser = await LineUser.findOne({ elderlyId: elderly._id });
    if (!lineUser) return;

    // ワンタイムトークンを生成
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24時間有効

    // トークンを保存（Responseモデルに仮保存）
    await Response.create({
      elderlyId: elderly._id,
      type: 'genki_button',
      status: 'pending',
      token,
      tokenExpiresAt: expiresAt,
      createdAt: new Date(),
    });

    // 元気ですボタンのURL
    const genkiUrl = `${process.env.FRONTEND_URL}/genki/${token}`;

    // メッセージ送信
    const message: TextMessage = {
      type: 'text',
      text: `おはようございます、${elderly.name}さん！☀️

今日も元気にお過ごしですか？

下のリンクから「元気です」ボタンを押してください。

${genkiUrl}

ご家族が${elderly.name}さんの元気を待っています💝`,
    };

    await client.pushMessage(lineUser.userId, message);

  } catch (error) {
    console.error('Error sending daily genki message:', error);
  }
};

// LINE通知送信（管理者向け）
export const sendAdminNotification = async (elderlyId: string, message: string): Promise<void> => {
  try {
    const elderly = await Elderly.findById(elderlyId).populate('userId');
    if (!elderly || !elderly.userId) return;

    // 管理者のLINEユーザーIDを取得（将来的に実装）
    // 現在はコンソールログのみ
    console.log('Admin notification:', { elderlyId, message });

    // 将来的には管理者のLINEに通知を送信
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
};