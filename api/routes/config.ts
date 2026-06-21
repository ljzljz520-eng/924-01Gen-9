import { Router } from 'express';
import { upload } from '../services/fileService';
import {
  getConfigHandler,
  updateConfigHandler,
  uploadLogoHandler,
  uploadSignatureHandler,
} from '../controllers/configController';

const router = Router();

router.get('/', getConfigHandler);
router.put('/', updateConfigHandler);
router.post('/logo', upload.single('logo'), uploadLogoHandler);
router.post('/signature', upload.single('signature'), uploadSignatureHandler);

export default router;
