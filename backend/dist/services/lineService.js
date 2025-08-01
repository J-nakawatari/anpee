import { Client } from '@line/bot-sdk';
import crypto from 'crypto';
import DailyNotification from '../models/DailyNotification.js';
import Elderly from '../models/Elderly.js';
import { LineUser } from '../models/LineUser.js';
// LINE Bot SDK クライアントの初期化（遅延初期化）
let client = null;
// LINE設定の確認（関数として定義）
const checkLineConfig = () => {
    return !!(process.env.LINE_CHANNEL_ACCESS_TOKEN &&
        process.env.LINE_CHANNEL_SECRET &&
        process.env.LINE_CHANNEL_ACCESS_TOKEN !== 'dummy-access-token-for-testing');
};
// クライアントの初期化（必要時に実行）
const initializeClient = () => {
    if (!client && checkLineConfig()) {
        console.log('LINEクライアント初期化:', {
            hasAccessToken: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
            hasSecret: !!process.env.LINE_CHANNEL_SECRET,
            tokenLength: process.env.LINE_CHANNEL_ACCESS_TOKEN?.length
        });
        client = new Client({
            channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
            channelSecret: process.env.LINE_CHANNEL_SECRET,
        });
    }
    return client;
};
// 署名検証
export const validateSignature = (body, signature) => {
    const channelSecret = process.env.LINE_CHANNEL_SECRET || '';
    const hash = crypto
        .createHmac('SHA256', channelSecret)
        .update(body)
        .digest('base64');
    return hash === signature;
};
// Webhookイベント処理
export const handleWebhook = async (events) => {
    console.log('Webhook受信:', JSON.stringify(events, null, 2));
    await Promise.all(events.map(handleEvent));
};
// 汎用的なLINEメッセージ送信関数
export const sendLineMessage = async (userId, messages) => {
    const lineClient = initializeClient();
    if (!lineClient || !checkLineConfig()) {
        console.error('LINE設定エラー:', {
            hasClient: !!lineClient,
            hasLineConfig: checkLineConfig(),
            accessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN ? '設定済み' : '未設定',
            secret: process.env.LINE_CHANNEL_SECRET ? '設定済み' : '未設定'
        });
        throw new Error('LINE設定が不完全です。環境変数を確認してください。');
    }
    try {
        console.log('LINEメッセージ送信試行:', {
            userId,
            messageCount: messages.length,
            messageTypes: messages.map(m => m.type)
        });
        const result = await lineClient.pushMessage(userId, messages);
        console.log('LINEメッセージ送信成功:', result);
        return result;
    }
    catch (error) {
        console.error('LINEメッセージ送信エラー:', {
            userId,
            error: error.message,
            statusCode: error.statusCode || error.response?.status,
            details: error.response?.data || error.originalError
        });
        throw error;
    }
};
// 個別イベント処理
const handleEvent = async (event) => {
    console.log('イベント処理開始:', { type: event.type, source: event.source });
    // フォローイベント（友だち追加）
    if (event.type === 'follow' && event.source.type === 'user') {
        const userId = event.source.userId;
        console.log('フォローイベント処理:', userId);
        await handleFollow(userId);
        return;
    }
    // アンフォローイベント（ブロック・削除）
    if (event.type === 'unfollow' && event.source.type === 'user') {
        const userId = event.source.userId;
        await handleUnfollow(userId);
        return;
    }
    // メッセージイベント
    if (event.type === 'message' && event.message.type === 'text' && event.source.type === 'user') {
        const userId = event.source.userId;
        const text = event.message.text.trim();
        console.log('メッセージ受信:', { userId, text, originalText: event.message.text });
        try {
            // 登録コードの処理
            // 「登録:」プレフィックス付きの場合
            if (text.startsWith('登録:')) {
                const registrationCode = text.replace('登録:', '').trim();
                console.log('登録コード処理開始（プレフィックス付き）:', { userId, registrationCode });
                await handleRegistration(userId, registrationCode);
                return;
            }
            // 6文字の英数字のパターンにマッチする場合（登録コードとみなす）
            if (/^[A-Z0-9]{6}$/i.test(text)) {
                console.log('登録コード処理開始（6文字パターン）:', {
                    userId,
                    originalText: text,
                    registrationCode: text.toUpperCase(),
                    length: text.length
                });
                await handleRegistration(userId, text.toUpperCase());
                return;
            }
            console.log('メッセージがパターンに一致しません:', {
                text,
                pattern: '/^[A-Z0-9]{6}$/i',
                length: text.length,
                hasSpace: text.includes(' '),
                hasNewline: text.includes('\n')
            });
            // デフォルトの応答
            const lineClient = initializeClient();
            if (lineClient) {
                await lineClient.replyMessage(event.replyToken, {
                    type: 'text',
                    text: '登録コード（6文字の英数字）を送信してください。\n例：ABC123'
                });
            }
        }
        catch (error) {
            console.error('メッセージ処理エラー:', error);
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
// フォロー（友だち追加）処理
const handleFollow = async (userId) => {
    try {
        console.log('友だち追加:', userId);
        // 既存のLineUserがある場合は再アクティブ化
        const existingUser = await LineUser.findOne({ userId });
        if (existingUser) {
            existingUser.isActive = true;
            existingUser.lastActiveAt = new Date();
            await existingUser.save();
            // 家族情報も更新
            const elderly = await Elderly.findById(existingUser.elderlyId);
            if (elderly) {
                elderly.hasGenKiButton = true;
                await elderly.save();
            }
            // 再登録メッセージ
            const lineClient = initializeClient();
            if (lineClient) {
                await lineClient.pushMessage(userId, {
                    type: 'text',
                    text: `おかえりなさい！あんぴーちゃんです🌸\n\n${elderly?.name || ''}さんの見守りを再開します。`,
                });
            }
            return;
        }
        // 新規ユーザーの場合はウェルカムメッセージ
        await sendWelcomeMessage(userId);
    }
    catch (error) {
        console.error('フォロー処理エラー:', error);
    }
};
// アンフォロー（ブロック・削除）処理
const handleUnfollow = async (userId) => {
    try {
        console.log('友だち削除/ブロック:', userId);
        // LineUserを非アクティブ化
        const lineUser = await LineUser.findOne({ userId });
        if (lineUser) {
            lineUser.isActive = false;
            lineUser.lastActiveAt = new Date();
            await lineUser.save();
            // 家族情報も更新
            const elderly = await Elderly.findById(lineUser.elderlyId).populate('userId');
            if (elderly) {
                elderly.hasGenKiButton = false;
                elderly.lineUserId = undefined; // LINE連携を解除
                await elderly.save();
                // 管理者に通知（将来的にメール通知実装）
                console.log(`通知: ${elderly.name}さんがLINE連携を解除しました（管理者: ${elderly.userId}）`);
            }
        }
    }
    catch (error) {
        console.error('アンフォロー処理エラー:', error);
    }
};
// ウェルカムメッセージ送信
const sendWelcomeMessage = async (userId) => {
    const welcomeMessage = {
        type: 'text',
        text: `はじめまして！あんぴーちゃんです🌸

毎日の安否確認をお手伝いします。

ご家族から受け取った6文字の登録コードを送信してください。

例：ABC123

ご不明な点がございましたら、ご家族の方にお問い合わせください。`,
    };
    const lineClient = initializeClient();
    if (lineClient) {
        await lineClient.pushMessage(userId, welcomeMessage);
    }
};
// 登録処理
const handleRegistration = async (userId, registrationCode) => {
    try {
        console.log('handleRegistration開始:', { userId, registrationCode });
        // 登録コードから家族情報を検索
        console.log('登録コード検索開始:', {
            registrationCode,
            codeLength: registrationCode.length,
            codeType: typeof registrationCode
        });
        // デバッグ: すべてのアクティブな家族の登録コードを確認
        const allActiveElderly = await Elderly.find({ status: 'active' }).select('name registrationCode');
        console.log('アクティブな家族一覧:', allActiveElderly.map(e => ({
            name: e.name,
            code: e.registrationCode,
            codeLength: e.registrationCode?.length
        })));
        const elderly = await Elderly.findOne({
            registrationCode: registrationCode.toUpperCase().trim(),
            status: 'active'
        });
        console.log('家族情報検索結果:', {
            found: !!elderly,
            registrationCode,
            elderlyName: elderly?.name
        });
        if (!elderly) {
            const lineClient = initializeClient();
            if (lineClient) {
                await lineClient.pushMessage(userId, {
                    type: 'text',
                    text: '登録コードが見つかりません。正しいコードか確認してください。',
                });
            }
            return;
        }
        // 同じLINEユーザーが既に他の家族にアクティブに登録されているかチェック
        const existingLineUserElsewhere = await LineUser.findOne({ userId, isActive: true });
        if (existingLineUserElsewhere && existingLineUserElsewhere.elderlyId.toString() !== elderly._id.toString()) {
            // 古い登録を非アクティブ化
            console.log(`既存のLINE登録を非アクティブ化: userId=${userId}, elderlyId=${existingLineUserElsewhere.elderlyId}`);
            existingLineUserElsewhere.isActive = false;
            existingLineUserElsewhere.lastActiveAt = new Date();
            await existingLineUserElsewhere.save();
            // 古い家族のLINE連携も解除
            const oldElderly = await Elderly.findById(existingLineUserElsewhere.elderlyId);
            if (oldElderly) {
                oldElderly.lineUserId = undefined;
                oldElderly.hasGenKiButton = false;
                await oldElderly.save();
            }
        }
        // Elderlyテーブルでも重複チェック
        const existingElderlyWithSameLineId = await Elderly.findOne({
            lineUserId: userId,
            _id: { $ne: elderly._id }
        });
        if (existingElderlyWithSameLineId) {
            console.log(`LINE ID重複エラー: ${userId}は既に${existingElderlyWithSameLineId.name}に登録されています`);
            // 古い登録を解除
            existingElderlyWithSameLineId.lineUserId = undefined;
            existingElderlyWithSameLineId.hasGenKiButton = false;
            await existingElderlyWithSameLineId.save();
        }
        // 既に登録済みかチェック
        const existingUser = await LineUser.findOne({ elderlyId: elderly._id });
        if (existingUser) {
            // 同じユーザーが再登録しようとしている場合
            if (existingUser.userId === userId) {
                // 再アクティブ化
                existingUser.isActive = true;
                existingUser.lastActiveAt = new Date();
                await existingUser.save();
                // 家族情報も更新
                elderly.hasGenKiButton = true;
                elderly.lineUserId = userId;
                await elderly.save();
                const lineClient = initializeClient();
                if (lineClient) {
                    await lineClient.pushMessage(userId, {
                        type: 'text',
                        text: `${elderly.name}さん、再登録が完了しました！✨\n\n見守りを再開します。`,
                    });
                }
                return;
            }
            else if (existingUser.isActive) {
                // 別のユーザーがアクティブに使用中
                const lineClient = initializeClient();
                if (lineClient) {
                    await lineClient.pushMessage(userId, {
                        type: 'text',
                        text: 'このコードは既に別の方が使用中です。',
                    });
                }
                return;
            }
            else {
                // 非アクティブなら削除して新規登録を続行
                await LineUser.deleteOne({ _id: existingUser._id });
            }
        }
        // LINEユーザー情報を取得
        let profile = { displayName: '未設定' };
        const lineClient = initializeClient();
        if (lineClient) {
            try {
                const lineProfile = await lineClient.getProfile(userId);
                profile = lineProfile;
            }
            catch (profileError) {
                console.error('プロファイル取得エラー:', profileError.response?.status);
                console.error('アクセストークンの確認が必要です');
            }
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
        if (lineClient) {
            await lineClient.pushMessage(userId, {
                type: 'text',
                text: `${elderly.name}さん、登録が完了しました！✨

明日の朝から、毎日「元気です」ボタンをお送りします。

ボタンを押すだけで、ご家族に元気なことが伝わります。

どうぞよろしくお願いします🌸`,
            });
        }
    }
    catch (error) {
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
export const sendDailyGenkiMessage = async (elderlyId) => {
    let lineUser = null;
    try {
        const elderly = await Elderly.findById(elderlyId);
        if (!elderly || !elderly.lineUserId)
            return;
        lineUser = await LineUser.findOne({ elderlyId: elderly._id });
        if (!lineUser || !lineUser.isActive)
            return;
        // ワンタイムトークンを生成
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24時間有効
        // トークンを保存（DailyNotificationモデルに保存）
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        await DailyNotification.findOneAndUpdate({
            elderlyId: elderly._id,
            date: today
        }, {
            $setOnInsert: {
                userId: elderly.userId,
                elderlyId: elderly._id,
                date: today
            },
            $push: {
                notifications: {
                    sentAt: new Date(),
                    type: 'test',
                    token,
                    tokenExpiresAt: expiresAt
                }
            }
        }, { upsert: true });
        // 元気ですボタンのURL
        const genkiUrl = `${process.env.FRONTEND_URL}/genki/${token}`;
        // メッセージ送信
        const message = {
            type: 'text',
            text: `おはようございます、${elderly.name}さん！☀️

今日も元気にお過ごしですか？

下のリンクから「元気です」ボタンを押してください。

${genkiUrl}

ご家族が${elderly.name}さんの元気を待っています💝`,
        };
        const lineClient = initializeClient();
        if (lineClient) {
            await lineClient.pushMessage(lineUser.userId, message);
        }
    }
    catch (error) {
        console.error('Error sending daily genki message:', error);
        // 403エラーの場合はブロックされている可能性
        if (error.statusCode === 403 || error.response?.status === 403) {
            if (lineUser) {
                console.log('ユーザーがブロックしている可能性があります:', lineUser.userId);
                // LineUserを非アクティブ化
                lineUser.isActive = false;
                lineUser.lastActiveAt = new Date();
                await lineUser.save();
                // 家族情報も更新
                const elderly = await Elderly.findById(elderlyId).populate('userId');
                if (elderly) {
                    elderly.hasGenKiButton = false;
                    await elderly.save();
                    console.log(`通知: ${elderly.name}さんがLINEをブロックしている可能性があります（管理者: ${elderly.userId}）`);
                }
            }
        }
    }
};
// LINE通知送信（管理者向け）
export const sendAdminNotification = async (elderlyId, message) => {
    try {
        const elderly = await Elderly.findById(elderlyId).populate('userId');
        if (!elderly || !elderly.userId)
            return;
        // 管理者のLINEユーザーIDを取得（将来的に実装）
        // 現在はコンソールログのみ
        console.log('Admin notification:', { elderlyId, message });
        // 将来的には管理者のLINEに通知を送信
    }
    catch (error) {
        console.error('Error sending admin notification:', error);
    }
};
