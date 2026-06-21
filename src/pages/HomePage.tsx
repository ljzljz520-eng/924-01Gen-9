import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCertificates } from '../api/client';
import { useConfigStore } from '../store/useConfigStore';
import CertificatePreview from '../components/CertificatePreview';
import {
  Award,
  FileText,
  Users,
  Settings,
  QrCode,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { config, load: loadConfig } = useConfigStore();
  const [totalCerts, setTotalCerts] = useState(0);
  const [recentCerts, setRecentCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchCertificates(1, 5);
        setTotalCerts(res.total);
        setRecentCerts(res.list);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const validCount = recentCerts.filter(c => c.status === 'valid').length;
  const reissuedCount = recentCerts.filter(c => c.status === 'reissued').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="bg-gradient-to-br from-cert-navy to-cert-navy-dark rounded-2xl p-8 md:p-12 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cert-gold/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cert-gold/5 rounded-full translate-y-1/2 -translate-x-1/3" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="gold-seal h-14 w-14 flex items-center justify-center">
              <Award className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="font-serif-display text-3xl md:text-4xl text-cert-gold mb-1">
                培训证书管理系统
              </h1>
              <p className="text-white/60 text-sm">专业、高效、可追溯的证书解决方案</p>
            </div>
          </div>
          <p className="text-white/70 max-w-xl mb-8">
            一键批量生成精美证书，二维码防伪验证，补发自动冻结旧编号，
            让证书管理轻松高效。
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate('/certificates')} className="bg-cert-gold hover:bg-cert-gold-light text-cert-navy-dark font-medium px-6 py-3 rounded transition-colors flex items-center gap-2">
              <FileText className="h-4 w-4" />
              管理证书
            </button>
            <button onClick={() => navigate('/config')} className="bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded transition-colors border border-white/20 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              配置模板
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/certificates')}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-cert-ink/50 mb-1">证书总数</p>
              <p className="text-3xl font-serif-display text-cert-navy font-semibold">
                {loading ? '...' : totalCerts}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cert-navy/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-cert-navy" />
            </div>
          </div>
          <p className="text-xs text-cert-ink/40 mt-4 flex items-center gap-1">
            点击查看全部证书 <ChevronRight className="h-3 w-3" />
          </p>
        </div>

        <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/certificates')}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-cert-ink/50 mb-1">有效证书</p>
              <p className="text-3xl font-serif-display text-green-600 font-semibold">
                {loading ? '...' : Math.max(0, totalCerts - reissuedCount)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <QrCode className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-cert-ink/40 mt-4">
            正常可验证的证书数量
          </p>
        </div>

        <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/certificates')}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-cert-ink/50 mb-1">已补发</p>
              <p className="text-3xl font-serif-display text-amber-600 font-semibold">
                {loading ? '...' : reissuedCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-cert-ink/40 mt-4">
            旧编号已冻结，已颁发新证书
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif-display text-xl text-cert-navy flex items-center gap-2">
              <Users className="h-5 w-5 text-cert-gold" />
              最近生成
            </h2>
            <button onClick={() => navigate('/certificates')} className="text-sm text-cert-navy hover:underline flex items-center gap-1">
              查看全部 <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          {loading ? (
            <div className="py-12 text-center text-cert-ink/40">加载中...</div>
          ) : recentCerts.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="h-10 w-10 text-cert-ink/20 mx-auto mb-2" />
              <p className="text-cert-ink/40 text-sm">暂无证书，点击上方按钮开始批量生成</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recentCerts.map((cert) => (
                <li key={cert.id} className="py-3 flex items-center justify-between group">
                  <div>
                    <p className="font-medium text-cert-ink group-hover:text-cert-navy transition-colors">
                      {cert.studentName}
                    </p>
                    <p className="text-xs text-cert-ink/40 font-mono">{cert.certNumber}</p>
                  </div>
                  <span className={`status-badge ${cert.status === 'valid' ? 'status-valid' : 'status-reissued'}`}>
                    {cert.status === 'valid' ? '有效' : '已补发'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-serif-display text-xl text-cert-navy flex items-center gap-2 mb-5">
            <Award className="h-5 w-5 text-cert-gold" />
            证书预览
          </h2>
          {config ? (
            <div className="scale-[0.55] origin-top-left -mb-40 -mr-40">
              <CertificatePreview
                data={{
                  orgName: config.orgName,
                  logoUrl: config.logoUrl,
                  courseName: config.courseName,
                  courseHours: config.courseHours,
                  instructorName: config.instructorName,
                  instructorSignatureUrl: config.instructorSignatureUrl,
                  issueDate: config.issueDate,
                  studentName: '示例学员',
                  certNumber: `${config.numberPrefix}-${config.issueDate.replace(/-/g, '')}-${String(config.numberStartIndex).padStart(config.numberDigits, '0')}`,
                }}
              />
            </div>
          ) : (
            <div className="py-16 text-center text-cert-ink/40">加载中...</div>
          )}
        </div>
      </div>
    </div>
  );
}
