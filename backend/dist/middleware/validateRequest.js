import { validationResult } from 'express-validator';
export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: '入力内容にエラーがあります',
            errors: errors.array().map(error => ({
                field: error.type === 'field' ? error.path : undefined,
                message: error.msg,
            })),
        });
    }
    next();
};
