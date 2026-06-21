import QRCode from 'qrcode';
import { saveFile } from './fileService';
import { randomUUID } from 'crypto';

export async function generateQrCode(certNumber: string, verifyUrl: string): Promise<string> {
  try {
    const buffer = await QRCode.toBuffer(verifyUrl, {
      width: 256,
      margin: 1,
      color: {
        dark: '#1e3a5f',
        light: '#ffffff',
      },
    });
    const filename = `${certNumber}-${randomUUID()}.png`;
    return saveFile(filename, buffer, 'qrcodes');
  } catch (err) {
    console.error('QR code generation failed:', err);
    return '';
  }
}
