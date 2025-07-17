import sgMail from '@sendgrid/mail';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// SendGrid APIキーを設定（遅延初期化）
let isApiKeySet = false;
function ensureApiKey() {
    if (!isApiKeySet) {
        const apiKey = process.env.SENDGRID_API_KEY;
        if (!apiKey) {
            logger.error('SENDGRID_API_KEY が設定されていません');
            return false;
        }
        sgMail.setApiKey(apiKey);
        logger.info('SendGrid API key loaded successfully');
        isApiKeySet = true;
    }
    return true;
}
class EmailService {
    baseUrl;
    fromEmail;
    fromName;
    constructor() {
        this.baseUrl = process.env.BASE_URL || 'https://anpee.jp';
        this.fromEmail = process.env.EMAIL_FROM || process.env.SENDGRID_FROM_EMAIL || 'no-reply@anpee.jp';
        this.fromName = process.env.SENDGRID_FROM_NAME || 'あんぴーちゃん';
    }
    /**
     * テンプレートファイルを読み込む
     */
    async loadTemplate(templateName, isHtml) {
        const extension = isHtml ? 'html' : 'txt';
        const templatePath = path.join(__dirname, '../../templates/emails', `${templateName}.${extension}`);
        try {
            const template = await fs.readFile(templatePath, 'utf-8');
            return template;
        }
        catch (error) {
            logger.error(`テンプレート読み込みエラー: ${templatePath}`, error);
            throw new Error(`メールテンプレートが見つかりません: ${templateName}.${extension}`);
        }
    }
    /**
     * テンプレート内の変数を置換する
     */
    replaceVariables(template, variables) {
        let result = template;
        // デフォルト値を設定
        const defaultVariables = {
            baseUrl: this.baseUrl,
            termsUrl: `${this.baseUrl}/terms`,
            privacyUrl: `${this.baseUrl}/privacy`,
            loginUrl: `${this.baseUrl}/login`,
            ...variables
        };
        // 変数を置換
        Object.entries(defaultVariables).forEach(([key, value]) => {
            if (value !== undefined) {
                const regex = new RegExp(`{{${key}}}`, 'g');
                result = result.replace(regex, value);
            }
        });
        return result;
    }
    /**
     * メールを送信する
     */
    async sendEmail(options) {
        // APIキーを確認
        if (!ensureApiKey()) {
            logger.error('メール送信エラー: SendGrid APIキーが設定されていません');
            return false;
        }
        const { to, subject, template, variables } = options;
        try {
            // HTMLとテキストテンプレートを読み込む
            const [htmlTemplate, textTemplate] = await Promise.all([
                this.loadTemplate(template, true),
                this.loadTemplate(template, false)
            ]);
            // 変数を置換
            const html = this.replaceVariables(htmlTemplate, variables);
            const text = this.replaceVariables(textTemplate, variables);
            // SendGridでメール送信
            const msg = {
                to,
                from: {
                    email: this.fromEmail,
                    name: this.fromName
                },
                subject,
                text,
                html
            };
            await sgMail.send(msg);
            logger.info(`メール送信成功: ${to} - ${subject}`);
            return true;
        }
        catch (error) {
            logger.error('メール送信エラー:', error);
            throw error;
        }
    }
    /**
     * ウェルカムメールを送信
     */
    async sendWelcomeEmail(to, userName, verificationToken) {
        logger.info(`ウェルカムメール送信開始: ${to}, userName: ${userName}`);
        const variables = {
            userName,
            userEmail: to
        };
        // 確認リンクがある場合は追加
        if (verificationToken) {
            variables.verifyUrl = `${this.baseUrl}/api/v1/auth/verify-email/${verificationToken}`;
        }
        const result = await this.sendEmail({
            to,
            subject: 'あんぴーちゃんへようこそ！',
            template: 'welcome',
            variables
        });
        logger.info(`ウェルカムメール送信結果: ${result ? '成功' : '失敗'} - ${to}`);
        return result;
    }
    /**
     * パスワードリセットメールを送信
     */
    async sendPasswordResetEmail(to, userName, resetToken, requestIp) {
        const resetUrl = `${this.baseUrl}/reset-password?token=${resetToken}`;
        const requestDate = new Date().toLocaleString('ja-JP', {
            timeZone: 'Asia/Tokyo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        return this.sendEmail({
            to,
            subject: 'パスワード再設定のお知らせ',
            template: 'reset-password',
            variables: {
                userName,
                userEmail: to,
                resetUrl,
                requestIp: requestIp || '不明',
                requestDate
            }
        });
    }
    /**
     * テストメールを送信（開発用）
     */
    async sendTestEmail(to) {
        try {
            const msg = {
                to,
                from: {
                    email: this.fromEmail,
                    name: this.fromName
                },
                subject: 'あんぴーちゃん - テストメール',
                text: 'これはテストメールです。正常に受信できています。',
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ea580c;">テストメール</h1>
            <p>これはテストメールです。正常に受信できています。</p>
            <p style="color: #666; font-size: 14px;">送信日時: ${new Date().toLocaleString('ja-JP')}</p>
          </div>
        `
            };
            await sgMail.send(msg);
            logger.info(`テストメール送信成功: ${to}`);
            return true;
        }
        catch (error) {
            logger.error('テストメール送信エラー:', error);
            throw error;
        }
    }
}
// シングルトンインスタンスをエクスポート
export default new EmailService();
