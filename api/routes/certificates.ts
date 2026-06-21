import { Router } from 'express';
import {
  listCertificatesHandler,
  getCertificateHandler,
  batchCreateHandler,
  reissueHandler,
} from '../controllers/certificateController';

const router = Router();

router.get('/', listCertificatesHandler);
router.get('/:id', getCertificateHandler);
router.post('/batch', batchCreateHandler);
router.post('/:id/reissue', reissueHandler);

export default router;
