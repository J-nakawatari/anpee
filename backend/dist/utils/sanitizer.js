import xss from 'xss';
/**
 * XSS攻撃を防ぐためのサニタイズ関数
 */
export function sanitizeInput(input) {
    // xssライブラリを使用してHTMLタグをエスケープ
    return xss(input, {
        whiteList: {}, // すべてのHTMLタグを削除
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script'],
    });
}
/**
 * オブジェクト内のすべての文字列をサニタイズ
 */
export function sanitizeObject(obj) {
    const sanitized = {};
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            sanitized[key] = sanitizeInput(obj[key]);
        }
        else if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            sanitized[key] = sanitizeObject(obj[key]);
        }
        else if (Array.isArray(obj[key])) {
            sanitized[key] = obj[key].map((item) => typeof item === 'string' ? sanitizeInput(item) :
                typeof item === 'object' && item !== null ? sanitizeObject(item) : item);
        }
        else {
            sanitized[key] = obj[key];
        }
    }
    return sanitized;
}
/**
 * リクエストボディをサニタイズするミドルウェア
 */
export function sanitizeMiddleware(req, res, next) {
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    next();
}
