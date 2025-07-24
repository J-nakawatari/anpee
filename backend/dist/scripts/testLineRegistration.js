import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Elderly from '../models/Elderly.js';
import { handleWebhook } from '../services/lineService.js';
// 環境変数を読み込む
dotenv.config();
async function testLineRegistration() {
    try {
        // MongoDBに接続
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDBに接続しました');
        // テスト用の家族データを確認
        const testElderly = await Elderly.findOne({ status: 'active' }).select('name registrationCode');
        if (!testElderly) {
            console.error('アクティブな家族データが見つかりません');
            return;
        }
        console.log('\n=== テスト用家族データ ===');
        console.log(`名前: ${testElderly.name}`);
        console.log(`登録コード: ${testElderly.registrationCode}`);
        console.log(`コード長: ${testElderly.registrationCode?.length}`);
        // LINE Webhookイベントを模擬
        const testUserId = 'test-user-' + Date.now();
        // テストケース1: 登録:プレフィックス付き
        console.log('\n=== テストケース1: プレフィックス付き ===');
        const event1 = {
            type: 'message',
            timestamp: Date.now(),
            mode: 'active',
            webhookEventId: 'test-event-1',
            deliveryContext: { isRedelivery: false },
            source: { type: 'user', userId: testUserId },
            replyToken: 'test-reply-token',
            message: {
                type: 'text',
                id: 'test-message-1',
                quoteToken: 'test-quote-token',
                text: `登録:${testElderly.registrationCode}`
            }
        };
        console.log(`送信メッセージ: "${event1.message.text}"`);
        await handleWebhook([event1]);
        // テストケース2: 6文字コードのみ
        console.log('\n=== テストケース2: コードのみ ===');
        const event2 = {
            type: 'message',
            timestamp: Date.now(),
            mode: 'active',
            webhookEventId: 'test-event-2',
            deliveryContext: { isRedelivery: false },
            source: { type: 'user', userId: testUserId + '-2' },
            replyToken: 'test-reply-token-2',
            message: {
                type: 'text',
                id: 'test-message-2',
                quoteToken: 'test-quote-token-2',
                text: testElderly.registrationCode || ''
            }
        };
        console.log(`送信メッセージ: "${event2.message.text}"`);
        await handleWebhook([event2]);
        // テストケース3: 小文字のコード
        console.log('\n=== テストケース3: 小文字コード ===');
        const event3 = {
            type: 'message',
            timestamp: Date.now(),
            mode: 'active',
            webhookEventId: 'test-event-3',
            deliveryContext: { isRedelivery: false },
            source: { type: 'user', userId: testUserId + '-3' },
            replyToken: 'test-reply-token-3',
            message: {
                type: 'text',
                id: 'test-message-3',
                quoteToken: 'test-quote-token-3',
                text: testElderly.registrationCode?.toLowerCase() || ''
            }
        };
        console.log(`送信メッセージ: "${event3.message.text}"`);
        await handleWebhook([event3]);
        // テストケース4: 前後に空白があるコード
        console.log('\n=== テストケース4: 空白付きコード ===');
        const event4 = {
            type: 'message',
            timestamp: Date.now(),
            mode: 'active',
            webhookEventId: 'test-event-4',
            deliveryContext: { isRedelivery: false },
            source: { type: 'user', userId: testUserId + '-4' },
            replyToken: 'test-reply-token-4',
            message: {
                type: 'text',
                id: 'test-message-4',
                quoteToken: 'test-quote-token-4',
                text: ` ${testElderly.registrationCode} `
            }
        };
        console.log(`送信メッセージ: "${event4.message.text}"`);
        await handleWebhook([event4]);
        console.log('\n完了しました');
    }
    catch (error) {
        console.error('エラー:', error);
    }
    finally {
        await mongoose.connection.close();
    }
}
// スクリプトを実行
testLineRegistration();
