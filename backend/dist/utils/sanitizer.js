import xss from 'xss';
/**
 * MongoDB injection攻撃を防ぐためのサニタイズ関数
 */
export function sanitizeMongoInput(value) {
    if (value && typeof value === 'object') {
        // オブジェクトの場合、$で始まるキーを削除
        if (Array.isArray(value)) {
            return value.map(sanitizeMongoInput);
        }
        else {
            const sanitized = {};
            for (const key in value) {
                // $で始まるキーは削除（MongoDB演算子を防ぐ）
                if (!key.startsWith('$')) {
                    sanitized[key] = sanitizeMongoInput(value[key]);
                }
            }
            return sanitized;
        }
    }
    return value;
}
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
 * オブジェクト内のすべての文字列をサニタイズ（XSS + MongoDB injection対策）
 */
export function sanitizeObject(obj) {
    // まずMongoDB injection対策
    const mongoSanitized = sanitizeMongoInput(obj);
    // 次にXSS対策
    const sanitized = {};
    for (const key in mongoSanitized) {
        if (typeof mongoSanitized[key] === 'string') {
            sanitized[key] = sanitizeInput(mongoSanitized[key]);
        }
        else if (typeof mongoSanitized[key] === 'object' && mongoSanitized[key] !== null && !Array.isArray(mongoSanitized[key])) {
            sanitized[key] = sanitizeObject(mongoSanitized[key]);
        }
        else if (Array.isArray(mongoSanitized[key])) {
            sanitized[key] = mongoSanitized[key].map((item) => typeof item === 'string' ? sanitizeInput(item) :
                typeof item === 'object' && item !== null ? sanitizeObject(item) : item);
        }
        else {
            sanitized[key] = mongoSanitized[key];
        }
    }
    return sanitized;
}
/**
 * リクエストボディをサニタイズするミドルウェア（XSS + MongoDB injection対策）
 */
export function sanitizeMiddleware(req, res, next) {
    // Express v5では req.query, req.params は読み取り専用なので、
    // bodyのみサニタイズする
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    // TODO: Express v5対応 - queryとparamsのサニタイズは
    // 各エンドポイントで個別に行う必要がある
    next();
}
