import sgMail from '@sendgrid/mail';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SendGrid APIキーを設定
const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) {
  logger.error('SENDGRID_API_KEY が設定されていません');
} else {
  sgMail.setApiKey(apiKey);
  logger.info('SendGrid API key loaded successfully');
}

interface EmailVariables {
  userName?: string;
  userEmail?: string;
  loginUrl?: string;
  resetUrl?: string;
  baseUrl?: string;
  termsUrl?: string;
  privacyUrl?: string;
  requestIp?: string;
  requestDate?: string;
  [key: string]: string | undefined;
}

interface EmailOptions {
  to: string;
  subject: string;
  template: 'welcome' | 'reset-password';
  variables: EmailVariables;
}

class EmailService {
  private baseUrl: string;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.baseUrl = process.env.BASE_URL || 'https://anpee.jp';
    this.fromEmail = process.env.EMAIL_FROM || process.env.SENDGRID_FROM_EMAIL || 'no-reply@anpee.jp';
    this.fromName = process.env.SENDGRID_FROM_NAME || 'あんぴーちゃん';
  }

  /**
   * テンプレートファイルを読み込む
   */
  private async loadTemplate(templateName: string, isHtml: boolean): Promise<string> {
    const extension = isHtml ? 'html' : 'txt';
    const templatePath = path.join(__dirname, '../../templates/emails', `${templateName}.${extension}`);
    
    try {
      const template = await fs.readFile(templatePath, 'utf-8');
      return template;
    } catch (error) {
      logger.error(`テンプレート読み込みエラー: ${templatePath}`, error);
      throw new Error(`メールテンプレートが見つかりません: ${templateName}.${extension}`);
    }
  }

  /**
   * テンプレート内の変数を置換する
   */
  private replaceVariables(template: string, variables: EmailVariables): string {
    let result = template;
    
    // デフォルト値を設定
    const defaultVariables: EmailVariables = {
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
  async sendEmail(options: EmailOptions): Promise<boolean> {
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
    } catch (error) {
      logger.error('メール送信エラー:', error);
      throw error;
    }
  }

  /**
   * ウェルカムメールを送信
   */
  async sendWelcomeEmail(to: string, userName: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'あんぴーちゃんへようこそ！',
      template: 'welcome',
      variables: {
        userName,
        userEmail: to
      }
    });
  }

  /**
   * パスワードリセットメールを送信
   */
  async sendPasswordResetEmail(
    to: string, 
    userName: string, 
    resetToken: string,
    requestIp?: string
  ): Promise<boolean> {
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
  async sendTestEmail(to: string): Promise<boolean> {
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
    } catch (error) {
      logger.error('テストメール送信エラー:', error);
      throw error;
    }
  }
}

// シングルトンインスタンスをエクスポート
export default new EmailService();