import { Request, Response } from 'express';
import { getCertificateByNumber } from '../services/certificateService';
import type { VerifyResponse } from '../../shared/types';

export async function verifyCertificateHandler(req: Request, res: Response) {
  try {
    const certNumber = req.params.certNumber;
    const cert = await getCertificateByNumber(certNumber);

    if (!cert) {
      const response: VerifyResponse = {
        valid: false,
        status: 'not_found',
        message: '该证书不存在，请确认证书编号是否正确',
      };
      return res.json(response);
    }

    const reissued = cert.status === 'reissued';
    const response: VerifyResponse = {
      valid: !reissued,
      status: reissued ? 'reissued' : 'valid',
      certificate: {
        certNumber: cert.certNumber,
        studentName: cert.studentName,
        courseName: cert.courseName,
        courseHours: cert.courseHours,
        orgName: cert.orgName,
        issueDate: cert.issueDate,
        instructorName: cert.instructorName,
        reissued,
      },
      message: reissued ? '该证书已被补发，当前证书已作废' : '证书验证通过',
    };

    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
