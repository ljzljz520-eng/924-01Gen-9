import { Request, Response } from 'express';
import { getConfig, updateConfig, updateLogoUrl, updateSignatureUrl } from '../services/configService';
import { getPublicUrl } from '../services/fileService';
import type { OrgConfigInput } from '../../shared/types';

export async function getConfigHandler(_req: Request, res: Response) {
  try {
    const config = await getConfig();
    res.json(config);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateConfigHandler(req: Request, res: Response) {
  try {
    const input = req.body as OrgConfigInput;
    if (!input.orgName?.trim() || !input.courseName?.trim()) {
      return res.status(400).json({ error: '机构名和课程名不能为空' });
    }
    const config = await updateConfig(input);
    res.json(config);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function uploadLogoHandler(req: Request, res: Response) {
  try {
    if (!req.file) return res.status(400).json({ error: '请上传 logo 图片' });
    const relativePath = `logos/${req.file.filename}`;
    const logoUrl = getPublicUrl(relativePath);
    const config = await updateLogoUrl(logoUrl);
    res.json({ logoUrl: config.logoUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function uploadSignatureHandler(req: Request, res: Response) {
  try {
    if (!req.file) return res.status(400).json({ error: '请上传签名图片' });
    const relativePath = `signatures/${req.file.filename}`;
    const signatureUrl = getPublicUrl(relativePath);
    const config = await updateSignatureUrl(signatureUrl);
    res.json({ signatureUrl: config.instructorSignatureUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
