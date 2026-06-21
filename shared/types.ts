export interface OrgConfig {
  id: string;
  orgName: string;
  logoUrl: string | null;
  courseName: string;
  courseHours: number;
  instructorName: string;
  instructorSignatureUrl: string | null;
  numberPrefix: string;
  numberDateFormat: string;
  numberStartIndex: number;
  numberDigits: number;
  issueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrgConfigInput {
  orgName: string;
  courseName: string;
  courseHours: number;
  instructorName: string;
  numberPrefix: string;
  numberDateFormat: string;
  numberStartIndex: number;
  numberDigits: number;
  issueDate: string;
}

export type CertificateStatus = 'valid' | 'reissued';

export interface Certificate {
  id: string;
  certNumber: string;
  studentName: string;
  studentId: string | null;
  courseName: string;
  courseHours: number;
  orgName: string;
  instructorName: string;
  issueDate: string;
  status: CertificateStatus;
  qrCodeUrl: string | null;
  pdfUrl: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateDetail extends Certificate {
  reissues: ReissueRecord[];
}

export interface ReissueRecord {
  id: string;
  oldCertId: string;
  newCertId: string;
  reason: string;
  createdAt: string;
}

export interface StudentInput {
  name: string;
  studentId?: string;
}

export interface BatchResult {
  success: number;
  failed: number;
  certificates: Certificate[];
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type VerifyStatus = 'valid' | 'reissued' | 'not_found';

export interface VerifyResponse {
  valid: boolean;
  status: VerifyStatus;
  certificate?: {
    certNumber: string;
    studentName: string;
    courseName: string;
    courseHours: number;
    orgName: string;
    issueDate: string;
    instructorName: string;
    reissued: boolean;
  };
  message?: string;
}
