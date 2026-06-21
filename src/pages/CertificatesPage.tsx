import { useEffect, useState, useRef } from 'react';
import { fetchCertificates, batchGenerate, reissueCertificate, fetchCertificateDetail } from '../api/client';
import CertificatePreview from '../components/CertificatePreview';
import { exportCertificateAsImage, exportCertificateAsPDF } from '../utils/export';
import {
  Users,
  Upload,
  Search,
  Filter,
  Download,
  RefreshCw,
  FileText,
  Eye,
  X,
  Plus,
  Trash2,
  AlertTriangle,
  Check,
} from 'lucide-react';
import type { Certificate, CertificateDetail, StudentInput } from '../../shared/types';

interface PendingStudent extends StudentInput {
  _id: string;
}

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [status, setStatus] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const [showBatch, setShowBatch] = useState(false);
  const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([
    { _id: crypto.randomUUID(), name: '', studentId: '' },
  ]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResult, setBatchResult] = useState<{ success: number; failed: number } | null>(null);

  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CertificateDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [showReissue, setShowReissue] = useState(false);
  const [reissueCert, setReissueCert] = useState<Certificate | null>(null);
  const [reissueReason, setReissueReason] = useState('');
  const [reissueLoading, setReissueLoading] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const csvRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCerts();
  }, [page, status, keyword]);

  async function loadCerts() {
    setLoading(true);
    try {
      const res = await fetchCertificates(page, pageSize, status, keyword);
      setCerts(res.list);
      setTotal(res.total);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleBatchGenerate() {
    const valid = pendingStudents.filter(s => s.name.trim());
    if (!valid.length) {
      setMessage({ type: 'error', text: '请至少输入一位有效学员姓名' });
      return;
    }
    setBatchLoading(true);
    try {
      const result = await batchGenerate(valid.map(({ name, studentId }) => ({ name, studentId })));
      setBatchResult({ success: result.success, failed: result.failed });
      setPendingStudents([{ _id: crypto.randomUUID(), name: '', studentId: '' }]);
      await loadCerts();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setBatchLoading(false);
    }
  }

  function addStudentRow() {
    setPendingStudents([...pendingStudents, { _id: crypto.randomUUID(), name: '', studentId: '' }]);
  }

  function updateStudent(id: string, field: keyof StudentInput, value: string) {
    setPendingStudents(pendingStudents.map(s => (s._id === id ? { ...s, [field]: value } : s)));
  }

  function removeStudent(id: string) {
    if (pendingStudents.length <= 1) return;
    setPendingStudents(pendingStudents.filter(s => s._id !== id));
  }

  function importCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      const students: PendingStudent[] = lines.slice(1).map(line => {
        const cols = line.split(',');
        return {
          _id: crypto.randomUUID(),
          name: (cols[0] || '').trim(),
          studentId: (cols[1] || '').trim(),
        };
      }).filter(s => s.name);
      if (students.length) setPendingStudents(students);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  async function openDetail(id: string) {
    setDetailId(id);
    setDetailLoading(true);
    try {
      const d = await fetchCertificateDetail(id);
      setDetail(d);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setDetailLoading(false);
    }
  }

  function openReissue(cert: Certificate) {
    setReissueCert(cert);
    setReissueReason('');
    setShowReissue(true);
  }

  async function confirmReissue() {
    if (!reissueCert || !reissueReason.trim()) return;
    setReissueLoading(true);
    try {
      await reissueCertificate(reissueCert.id, reissueReason.trim());
      setMessage({ type: 'success', text: '补发成功，旧证书已冻结' });
      setShowReissue(false);
      setReissueCert(null);
      if (detailId === reissueCert.id) openDetail(reissueCert.id);
      await loadCerts();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setReissueLoading(false);
    }
  }

  function downloadCSVTemplate() {
    const content = 'name,studentId\n张三,2024001\n李四,2024002\n';
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '学员导入模板.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif-display text-3xl text-cert-navy mb-1">证书管理</h1>
          <p className="text-sm text-cert-ink/60">共 {total} 张证书，可批量生成、查看和补发</p>
        </div>
        <button onClick={() => setShowBatch(true)} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <Users className="h-4 w-4" />
          批量生成证书
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded border flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {message.type === 'success' ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cert-ink/40" />
            <input
              type="text"
              placeholder="搜索学员姓名或证书编号..."
              className="input-field pl-9"
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-cert-ink/60" />
            <select
              className="input-field w-auto"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="all">全部状态</option>
              <option value="valid">有效</option>
              <option value="reissued">已补发</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-cert-cream border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-cert-ink/60 uppercase tracking-wider">证书编号</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cert-ink/60 uppercase tracking-wider">学员姓名</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cert-ink/60 uppercase tracking-wider hidden sm:table-cell">课程</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cert-ink/60 uppercase tracking-wider hidden md:table-cell">颁发日期</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cert-ink/60 uppercase tracking-wider">状态</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-cert-ink/60 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-cert-ink/40">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                    加载中...
                  </td>
                </tr>
              )}
              {!loading && !certs.length && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-cert-ink/40">
                    <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    暂无证书，点击右上角按钮批量生成
                  </td>
                </tr>
              )}
              {!loading && certs.map((cert) => (
                <tr key={cert.id} className="hover:bg-cert-cream/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-cert-navy">{cert.certNumber}</td>
                  <td className="px-6 py-4 font-medium text-cert-ink">{cert.studentName}</td>
                  <td className="px-6 py-4 text-cert-ink/70 hidden sm:table-cell text-sm">{cert.courseName}</td>
                  <td className="px-6 py-4 text-cert-ink/70 hidden md:table-cell text-sm">{cert.issueDate}</td>
                  <td className="px-6 py-4">
                    <span className={`status-badge ${cert.status === 'valid' ? 'status-valid' : 'status-reissued'}`}>
                      {cert.status === 'valid' ? '有效' : '已补发'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openDetail(cert.id)} className="p-1.5 rounded hover:bg-cert-navy/10 text-cert-navy transition-colors" title="查看详情">
                        <Eye className="h-4 w-4" />
                      </button>
                      {cert.status === 'valid' && (
                        <button onClick={() => openReissue(cert)} className="p-1.5 rounded hover:bg-amber-50 text-amber-600 transition-colors" title="补发证书">
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <span className="text-sm text-cert-ink/60">第 {page} / {totalPages} 页</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50">上一页</button>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50">下一页</button>
            </div>
          </div>
        )}
      </div>

      {showBatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-serif-display text-xl text-cert-navy">批量生成证书</h2>
              <button onClick={() => { setShowBatch(false); setBatchResult(null); }} className="p-1 rounded hover:bg-gray-100">
                <X className="h-5 w-5 text-cert-ink/60" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {batchResult ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 gold-seal flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-medium text-cert-navy mb-2">生成完成</h3>
                  <p className="text-cert-ink/60">
                    成功 <span className="text-green-600 font-medium">{batchResult.success}</span> 张，
                    失败 <span className="text-red-600 font-medium">{batchResult.failed}</span> 张
                  </p>
                  <button onClick={() => { setBatchResult(null); setShowBatch(false); }} className="btn-primary mt-6">
                    完成
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <button onClick={() => csvRef.current?.click()} className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1.5">
                      <Upload className="h-3.5 w-3.5" />
                      导入 CSV
                    </button>
                    <button onClick={downloadCSVTemplate} className="text-sm text-cert-navy hover:underline flex items-center gap-1.5">
                      <Download className="h-3.5 w-3.5" />
                      下载模板
                    </button>
                    <button onClick={addStudentRow} className="text-sm text-cert-navy hover:underline flex items-center gap-1.5 ml-auto">
                      <Plus className="h-3.5 w-3.5" />
                      添加学员
                    </button>
                  </div>
                  <input ref={csvRef} type="file" accept=".csv" className="hidden" onChange={importCSV} />

                  <div className="border border-gray-100 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-12 bg-cert-cream px-4 py-2 text-xs font-medium text-cert-ink/60">
                      <div className="col-span-1">#</div>
                      <div className="col-span-5">姓名 *</div>
                      <div className="col-span-5">学号</div>
                      <div className="col-span-1" />
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                      {pendingStudents.map((s, idx) => (
                        <div key={s._id} className="grid grid-cols-12 items-center gap-2 px-4 py-2">
                          <div className="col-span-1 text-sm text-cert-ink/40">{idx + 1}</div>
                          <div className="col-span-5">
                            <input
                              type="text"
                              placeholder="学员姓名"
                              className="input-field py-1.5 text-sm"
                              value={s.name}
                              onChange={(e) => updateStudent(s._id, 'name', e.target.value)}
                            />
                          </div>
                          <div className="col-span-5">
                            <input
                              type="text"
                              placeholder="学号（选填）"
                              className="input-field py-1.5 text-sm"
                              value={s.studentId || ''}
                              onChange={(e) => updateStudent(s._id, 'studentId', e.target.value)}
                            />
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <button onClick={() => removeStudent(s._id)} className="p-1 text-cert-ink/30 hover:text-red-500" disabled={pendingStudents.length <= 1}>
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {!batchResult && (
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
                <button onClick={() => { setShowBatch(false); setBatchResult(null); }} className="px-5 py-2 rounded text-cert-ink/70 hover:bg-gray-100">取消</button>
                <button onClick={handleBatchGenerate} disabled={batchLoading} className="btn-primary flex items-center gap-2">
                  {batchLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
                  {batchLoading ? '生成中...' : '生成证书'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {detailId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-serif-display text-xl text-cert-navy">证书详情</h2>
              <button onClick={() => { setDetailId(null); setDetail(null); }} className="p-1 rounded hover:bg-gray-100">
                <X className="h-5 w-5 text-cert-ink/60" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {detailLoading && <div className="text-center py-12 text-cert-ink/40">加载中...</div>}
              {!detailLoading && detail && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  <div className="lg:col-span-3">
                    <CertificatePreview
                      data={{
                        orgName: detail.orgName,
                        courseName: detail.courseName,
                        courseHours: detail.courseHours,
                        instructorName: detail.instructorName,
                        issueDate: detail.issueDate,
                        studentName: detail.studentName,
                        certNumber: detail.certNumber,
                        qrCodeUrl: detail.qrCodeUrl,
                      }}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-cert-navy">证书状态</h3>
                        <span className={`status-badge ${detail.status === 'valid' ? 'status-valid' : 'status-reissued'}`}>
                          {detail.status === 'valid' ? '有效' : '已补发'}
                        </span>
                      </div>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between"><dt className="text-cert-ink/50">证书编号</dt><dd className="font-mono text-cert-navy">{detail.certNumber}</dd></div>
                        <div className="flex justify-between"><dt className="text-cert-ink/50">学员</dt><dd>{detail.studentName}</dd></div>
                        <div className="flex justify-between"><dt className="text-cert-ink/50">学号</dt><dd>{detail.studentId || '-'}</dd></div>
                        <div className="flex justify-between"><dt className="text-cert-ink/50">课程</dt><dd>{detail.courseName}</dd></div>
                        <div className="flex justify-between"><dt className="text-cert-ink/50">课时</dt><dd>{detail.courseHours} 课时</dd></div>
                        <div className="flex justify-between"><dt className="text-cert-ink/50">颁发日期</dt><dd>{detail.issueDate}</dd></div>
                      </dl>
                    </div>
                    {detail.reissues.length > 0 && (
                      <div className="card p-4">
                        <h3 className="font-medium text-cert-navy mb-3">补发记录</h3>
                        <ul className="space-y-3">
                          {detail.reissues.map((r) => (
                            <li key={r.id} className="text-sm border-l-2 border-amber-300 pl-3">
                              <p className="text-cert-ink/80">{r.reason}</p>
                              <p className="text-xs text-cert-ink/40 mt-0.5">{r.createdAt}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {detail.status === 'valid' && (
                      <button onClick={() => { openReissue(detail); setDetailId(null); setDetail(null); }} className="w-full btn-secondary flex items-center justify-center gap-2 mb-2">
                        <RefreshCw className="h-4 w-4" />
                        补发证书
                      </button>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => exportCertificateAsImage('certificate-preview', `${detail.certNumber}`)} className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm py-2">
                        <Download className="h-4 w-4" />
                        下载图片
                      </button>
                      <button onClick={() => exportCertificateAsPDF('certificate-preview', `${detail.certNumber}`)} className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm py-2">
                        <Download className="h-4 w-4" />
                        下载 PDF
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showReissue && reissueCert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-serif-display text-xl text-cert-navy flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                补发证书
              </h2>
            </div>
            <div className="p-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-amber-700">
                  补发后，旧证书编号 <span className="font-mono font-bold">{reissueCert.certNumber}</span> 将被冻结，
                  学员扫码验证时会显示"已补发"状态。
                </p>
              </div>
              <div>
                <label className="label-field">补发原因 *</label>
                <textarea
                  className="input-field h-24 resize-none"
                  placeholder="例如：原证书遗失、学员姓名更正等"
                  value={reissueReason}
                  onChange={(e) => setReissueReason(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => { setShowReissue(false); setReissueCert(null); }} className="px-5 py-2 rounded text-cert-ink/70 hover:bg-gray-100">取消</button>
              <button onClick={confirmReissue} disabled={reissueLoading || !reissueReason.trim()} className="btn-danger flex items-center gap-2">
                {reissueLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
                确认补发
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
