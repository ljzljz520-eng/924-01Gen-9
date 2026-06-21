import { Request, Response } from 'express';
import {
  getCertificates,
  getCertificateById,
  batchCreateCertificates,
  reissueCertificate,
} from '../services/certificateService';
import type { StudentInput } from '../../shared/types';

export async function listCertificatesHandler(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const status = (req.query.status as string) || 'all';
    const keyword = (req.query.keyword as string) || '';
    const result = await getCertificates(page, pageSize, status, keyword);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getCertificateHandler(req: Request, res: Response) {
  try {
    const cert = await getCertificateById(req.params.id);
    if (!cert) return res.status(404).json({ error: '证书不存在' });
    res.json(cert);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function batchCreateHandler(req: Request, res: Response) {
  try {
    const { students } = req.body as { students: StudentInput[] };
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: '请提供学员列表' });
    }
    const result = await batchCreateCertificates(students);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function reissueHandler(req: Request, res: Response) {
  try {
    const { reason } = req.body as { reason: string };
    if (!reason?.trim()) return res.status(400).json({ error: '请填写补发原因' });
    const result = await reissueCertificate(req.params.id, reason);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
