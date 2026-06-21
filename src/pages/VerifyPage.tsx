import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { verifyCertificate } from '../api/client';
import CertificatePreview from '../components/CertificatePreview';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Award,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import type { VerifyResponse } from '../../shared/types';

export default function VerifyPage() {
  const { certNumber } = useParams<{ certNumber: string }>();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerifyResponse | null>(null);

  useEffect(() => {
    async function load() {
      if (!certNumber) return;
      setLoading(true);
      try {
        const res = await verifyCertificate(certNumber);
        setResult(res);
      } catch (err: any) {
        setResult({ valid: false, status: 'not_found', message: err.message || '验证失败' });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [certNumber]);

  const formatDate = (d: string) => {
    try {
      const date = new Date(d);
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    } catch {
      return d;
    }
  };

  return (
    <div className="min-h-screen bg-cert-paper">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, #1e3a5f 0%, transparent 50%), radial-gradient(circle at 75% 75%, #c9a962 0%, transparent 50%)`
      }} />

      <div className="relative max-w-4xl mx-auto px-4 py-8">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-cert-navy/60 hover:text-cert-navy text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </a>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-12 w-12 text-cert-navy animate-spin mb-4" />
            <p className="text-cert-ink/60">正在验证证书...</p>
          </div>
        )}

        {!loading && result && (
          <div className="animate-slide-up">
            <div className={`p-6 rounded-xl mb-8 border flex items-start gap-4 ${
              result.status === 'valid'
                ? 'bg-green-50 border-green-200'
                : result.status === 'reissued'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-red-50 border-red-200'
            }`}>
              {result.status === 'valid' && (
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-7 w-7 text-green-600" />
                </div>
              )}
              {result.status === 'reissued' && (
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-7 w-7 text-amber-600" />
                </div>
              )}
              {result.status === 'not_found' && (
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <XCircle className="h-7 w-7 text-red-600" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {result.status === 'valid' ? (
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                  ) : result.status === 'reissued' ? (
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <h2 className={`font-serif-display text-xl font-semibold ${
                    result.status === 'valid' ? 'text-green-700' :
                    result.status === 'reissued' ? 'text-amber-700' : 'text-red-700'
                  }`}>
                    {result.status === 'valid' ? '证书验证通过' :
                     result.status === 'reissued' ? '证书已被补发' : '证书不存在'}
                  </h2>
                </div>
                <p className={`text-sm ${
                  result.status === 'valid' ? 'text-green-600/80' :
                  result.status === 'reissued' ? 'text-amber-600/80' : 'text-red-600/80'
                }`}>
                  {result.message}
                </p>
              </div>
            </div>

            {result.certificate ? (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                  <CertificatePreview
                    compact
                    data={{
                      orgName: result.certificate.orgName,
                      courseName: result.certificate.courseName,
                      courseHours: result.certificate.courseHours,
                      instructorName: result.certificate.instructorName,
                      issueDate: result.certificate.issueDate,
                      studentName: result.certificate.studentName,
                      certNumber: result.certificate.certNumber,
                    }}
                  />
                </div>

                <div className="lg:col-span-2 space-y-4">
                  <div className="card p-5">
                    <h3 className="font-serif-display text-lg text-cert-navy mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5 text-cert-gold" />
                      证书信息
                    </h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-xs text-cert-ink/50 uppercase tracking-wide mb-0.5">证书编号</dt>
                        <dd className="font-mono text-cert-navy">{result.certificate.certNumber}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-cert-ink/50 uppercase tracking-wide mb-0.5">学员姓名</dt>
                        <dd className="text-cert-ink font-medium">{result.certificate.studentName}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-cert-ink/50 uppercase tracking-wide mb-0.5">培训课程</dt>
                        <dd className="text-cert-ink">{result.certificate.courseName}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-cert-ink/50 uppercase tracking-wide mb-0.5">课时数</dt>
                        <dd className="text-cert-ink">{result.certificate.courseHours} 课时</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-cert-ink/50 uppercase tracking-wide mb-0.5">颁发机构</dt>
                        <dd className="text-cert-ink">{result.certificate.orgName}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-cert-ink/50 uppercase tracking-wide mb-0.5">授课讲师</dt>
                        <dd className="text-cert-ink">{result.certificate.instructorName}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-cert-ink/50 uppercase tracking-wide mb-0.5">颁发日期</dt>
                        <dd className="text-cert-ink">{formatDate(result.certificate.issueDate)}</dd>
                      </div>
                    </dl>
                  </div>

                  {result.certificate.reissued && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-700">注意：该证书已被补发</p>
                          <p className="text-xs text-amber-600/80 mt-1">
                            此证书编号已被冻结作废，机构已向该学员颁发了新的证书。
                            请联系颁发机构获取最新有效证书。
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-center text-xs text-cert-ink/40 py-2">
                    此页面为公开验证页面，仅展示证书基本信息
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="h-10 w-10 text-red-400" />
                </div>
                <h3 className="text-xl font-medium text-cert-ink mb-2">未找到该证书</h3>
                <p className="text-cert-ink/60">
                  证书编号：<span className="font-mono">{certNumber}</span>
                </p>
                <p className="text-sm text-cert-ink/40 mt-4">
                  请检查证书编号是否正确，或联系证书颁发机构确认
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
