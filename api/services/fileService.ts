import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.resolve(__dirname, '../../uploads');
const logosDir = path.join(uploadsDir, 'logos');
const signaturesDir = path.join(uploadsDir, 'signatures');
const certificatesDir = path.join(uploadsDir, 'certificates');
const qrcodesDir = path.join(uploadsDir, 'qrcodes');

[uploadsDir, logosDir, signaturesDir, certificatesDir, qrcodesDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === 'logo') cb(null, logosDir);
    else if (file.fieldname === 'signature') cb(null, signaturesDir);
    else cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('只允许上传图片文件'));
  },
});

export function getPublicUrl(relativePath: string): string {
  return `/uploads/${relativePath}`;
}

export function getAbsoluteFilePath(relativePath: string): string {
  return path.join(uploadsDir, relativePath);
}

export function saveFile(filename: string, buffer: Buffer, subdir: string): string {
  const dir = path.join(uploadsDir, subdir);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const fullPath = path.join(dir, filename);
  fs.writeFileSync(fullPath, buffer);
  return `${subdir}/${filename}`;
}

export { certificatesDir, qrcodesDir };
