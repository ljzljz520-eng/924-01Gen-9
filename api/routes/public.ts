import { Router } from 'express';
import { verifyCertificateHandler } from '../controllers/verifyController';

const router = Router();

router.get('/verify/:certNumber', verifyCertificateHandler);

export default router;
