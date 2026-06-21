import type {
  OrgConfig,
  OrgConfigInput,
  Certificate,
  CertificateDetail,
  PaginatedResult,
  StudentInput,
  BatchResult,
  VerifyResponse,
} from '../../shared/types';

const BASE = '/api';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '请求失败' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchConfig(): Promise<OrgConfig> {
  return request<OrgConfig>('/config');
}

export async function saveConfig(input: OrgConfigInput): Promise<OrgConfig> {
  return request<OrgConfig>('/config', { method: 'PUT', body: JSON.stringify(input) });
}

export async function uploadLogo(file: File): Promise<{ logoUrl: string }> {
  const fd = new FormData();
  fd.append('logo', file);
  const res = await fetch(`${BASE}/config/logo`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error('上传失败');
  return res.json();
}

export async function uploadSignature(file: File): Promise<{ signatureUrl: string }> {
  const fd = new FormData();
  fd.append('signature', file);
  const res = await fetch(`${BASE}/config/signature`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error('上传失败');
  return res.json();
}

export async function fetchCertificates(
  page = 1,
  pageSize = 20,
  status = 'all',
  keyword = '',
): Promise<PaginatedResult<Certificate>> {
  const qs = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    status,
    keyword,
  });
  return request<PaginatedResult<Certificate>>(`/certificates?${qs.toString()}`);
}

export async function fetchCertificateDetail(id: string): Promise<CertificateDetail> {
  return request<CertificateDetail>(`/certificates/${id}`);
}

export async function batchGenerate(students: StudentInput[]): Promise<BatchResult> {
  return request<BatchResult>('/certificates/batch', {
    method: 'POST',
    body: JSON.stringify({ students }),
  });
}

export async function reissueCertificate(id: string, reason: string): Promise<{ oldCertId: string; newCertificate: Certificate }> {
  return request(`/certificates/${id}/reissue`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function verifyCertificate(certNumber: string): Promise<VerifyResponse> {
  return request<VerifyResponse>(`/public/verify/${encodeURIComponent(certNumber)}`);
}
