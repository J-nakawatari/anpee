import express from 'express';
import { getElderlyList, getElderlyById, createElderly, updateElderly, deleteElderly, unlinkLine, } from '../controllers/elderlyController.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();
// すべてのルートに認証を適用
router.use(authenticate);
// 家族一覧の取得
router.get('/', getElderlyList);
// 家族の詳細取得
router.get('/:id', getElderlyById);
// 家族の新規登録
router.post('/', createElderly);
// 家族情報の更新
router.put('/:id', updateElderly);
// 家族の削除
router.delete('/:id', deleteElderly);
// LINE連携解除
router.post('/:id/unlink-line', unlinkLine);
export default router;
