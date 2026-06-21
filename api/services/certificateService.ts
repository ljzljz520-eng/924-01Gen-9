import { randomUUID } from 'crypto';
import type { Certificate, CertificateDetail, ReissueRecord, StudentInput, BatchResult, PaginatedResult, CertificateStatus } from '../../shared/types';
import { getConfig, queryOne, queryAll, run } from './configService';
import { generateQrCode } from './qrCodeService';
import { getDb } from '../db/index';

function rowToCertificate(row: Record<string, any>): Certificate {
  return {
    id: row.id,
    certNumber: row.cert_number,
    studentName: row.student_name,
    studentId: row.student_id,
    courseName: row.course_name,
    courseHours: row.course_hours,
    orgName: row.org_name,
    instructorName: row.instructor_name,
    issueDate: row.issue_date,
    status: row.status as CertificateStatus,
    qrCodeUrl: row.qr_code_url,
    pdfUrl: row.pdf_url,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToReissue(row: Record<string, any>): ReissueRecord {
  return {
    id: row.id,
    oldCertId: row.old_cert_id,
    newCertId: row.new_cert_id,
    reason: row.reason,
    createdAt: row.created_at,
  };
}

function formatDate(dateStr: string, format: string): string {
  const d = new Date(dateStr);
  const year = String(d.getFullYear());
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day);
}

function generateCertNumber(index: number, config: Awaited<ReturnType<typeof getConfig>>): string {
  const datePart = formatDate(config.issueDate, config.numberDateFormat);
  const indexStr = String(index).padStart(config.numberDigits, '0');
  return `${config.numberPrefix}-${datePart}-${indexStr}`;
}

async function getNextIndex(): Promise<number> {
  const config = await getConfig();
  const row = await queryOne('SELECT COUNT(*) as cnt FROM certificate');
  const cnt = Number(row?.cnt || 0);
  return config.numberStartIndex + cnt;
}

export async function getCertificates(
  page: number = 1,
  pageSize: number = 20,
  status: string = 'all',
  keyword: string = '',
): Promise<PaginatedResult<Certificate>> {
  const offset = (page - 1) * pageSize;
  const conditions: string[] = [];
  const params: any[] = [];

  if (status !== 'all') {
    conditions.push('status = ?');
    params.push(status);
  }
  if (keyword.trim()) {
    conditions.push('(student_name LIKE ? OR cert_number LIKE ?)');
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const totalRow = await queryOne(`SELECT COUNT(*) as cnt FROM certificate ${where}`, params);
  const total = Number(totalRow?.cnt || 0);
  const rows = await queryAll(
    `SELECT * FROM certificate ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  return {
    list: rows.map(rowToCertificate),
    total,
    page,
    pageSize,
  };
}

export async function getCertificateById(id: string): Promise<CertificateDetail | null> {
  const row = await queryOne('SELECT * FROM certificate WHERE id = ?', [id]);
  if (!row) return null;

  const reissues = await queryAll(`
    SELECT r.* FROM reissue_record r
    WHERE r.old_cert_id = ? OR r.new_cert_id = ?
    ORDER BY r.created_at DESC
  `, [id, id]);

  return {
    ...rowToCertificate(row),
    reissues: reissues.map(rowToReissue),
  };
}

export async function getCertificateByNumber(certNumber: string): Promise<Certificate | null> {
  const row = await queryOne('SELECT * FROM certificate WHERE cert_number = ?', [certNumber]);
  return row ? rowToCertificate(row) : null;
}

export async function createCertificate(student: StudentInput, customIndex?: number): Promise<Certificate> {
  const config = await getConfig();
  const index = customIndex ?? (await getNextIndex());
  const certNumber = generateCertNumber(index, config);
  const id = randomUUID();

  const verifyUrl = `${process.env.PUBLIC_URL || 'http://localhost:5173'}/verify/${certNumber}`;
  const qrPath = await generateQrCode(certNumber, verifyUrl);

  await run(`INSERT INTO certificate
    (id, cert_number, student_name, student_id, course_name, course_hours, org_name, instructor_name, issue_date, status, qr_code_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'valid', ?)`,
    [
      id,
      certNumber,
      student.name,
      student.studentId || null,
      config.courseName,
      config.courseHours,
      config.orgName,
      config.instructorName,
      config.issueDate,
      qrPath ? `/uploads/${qrPath}` : null,
    ]);

  return (await getCertificateById(id)) as Certificate;
}

export async function batchCreateCertificates(students: StudentInput[]): Promise<BatchResult> {
  const success: Certificate[] = [];
  let failed = 0;
  let currentIndex = await getNextIndex();

  for (const student of students) {
    try {
      if (!student.name?.trim()) {
        failed++;
        continue;
      }
      const cert = await createCertificate(student, currentIndex);
      success.push(cert);
      currentIndex++;
    } catch (err) {
      console.error('Failed to create certificate for', student.name, err);
      failed++;
    }
  }

  return { success: success.length, failed, certificates: success };
}

export async function reissueCertificate(oldCertId: string, reason: string): Promise<{ oldCertId: string; newCertificate: Certificate }> {
  const oldCert = await getCertificateById(oldCertId);
  if (!oldCert) throw new Error('证书不存在');

  await run("UPDATE certificate SET status = 'reissued', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [oldCertId]);

  const student: StudentInput = {
    name: oldCert.studentName,
    studentId: oldCert.studentId ?? undefined,
  };
  const newCert = await createCertificate(student);

  const reissueId = randomUUID();
  await run('INSERT INTO reissue_record (id, old_cert_id, new_cert_id, reason) VALUES (?, ?, ?, ?)', [
    reissueId,
    oldCertId,
    newCert.id,
    reason,
  ]);

  return { oldCertId, newCertificate: newCert };
}
