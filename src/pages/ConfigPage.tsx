import { useEffect, useState, useRef } from 'react';
import { useConfigStore } from '../store/useConfigStore';
import CertificatePreview from '../components/CertificatePreview';
import { Upload, Save, ImageOff, User } from 'lucide-react';
import type { OrgConfigInput } from '../../shared/types';

export default function ConfigPage() {
  const { config, loading, load, save, uploadLogo, uploadSignature } = useConfigStore();
  const [form, setForm] = useState<OrgConfigInput | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (config) {
      setForm({
        orgName: config.orgName,
        courseName: config.courseName,
        courseHours: config.courseHours,
        instructorName: config.instructorName,
        numberPrefix: config.numberPrefix,
        numberDateFormat: config.numberDateFormat,
        numberStartIndex: config.numberStartIndex,
        numberDigits: config.numberDigits,
        issueDate: config.issueDate,
      });
    }
  }, [config]);

  const handleSave = async () => {
    if (!form) return;
    try {
      await save(form);
      setMessage({ type: 'success', text: '配置已保存' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '保存失败' });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'signature') => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (type === 'logo') await uploadLogo(file);
      else await uploadSignature(file);
      setMessage({ type: 'success', text: '上传成功' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '上传失败' });
    }
    e.target.value = '';
  };

  if (!form || !config) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-cert-ink/60">加载中...</div>
      </div>
    );
  }

  const previewData = {
    orgName: form.orgName,
    logoUrl: config.logoUrl,
    courseName: form.courseName,
    courseHours: form.courseHours,
    instructorName: form.instructorName,
    instructorSignatureUrl: config.instructorSignatureUrl,
    issueDate: form.issueDate,
    studentName: '张三',
    certNumber: `${form.numberPrefix}-${form.issueDate.replace(/-/g, '')}-${String(form.numberStartIndex).padStart(form.numberDigits, '0')}`,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif-display text-3xl text-cert-navy mb-1">机构配置</h1>
          <p className="text-sm text-cert-ink/60">配置证书模板和编号规则，右侧实时预览效果</p>
        </div>
        <button onClick={handleSave} disabled={loading} className="btn-primary flex items-center gap-2">
          <Save className="h-4 w-4" />
          保存配置
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-serif-display text-xl text-cert-navy mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-cert-gold rounded" />
              机构信息
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label-field">机构名称</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.orgName}
                  onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                />
              </div>
              <div>
                <label className="label-field">机构 Logo</label>
                <div className="flex items-start gap-4">
                  <div
                    onClick={() => logoInputRef.current?.click()}
                    className="w-24 h-24 border-2 border-dashed border-cert-gold/40 rounded-lg flex items-center justify-center cursor-pointer hover:border-cert-gold hover:bg-cert-gold/5 transition-all overflow-hidden bg-white"
                  >
                    {config.logoUrl ? (
                      <img src={config.logoUrl} alt="logo" className="w-full h-full object-contain p-2" />
                    ) : (
                      <div className="text-center text-cert-ink/40">
                        <ImageOff className="h-6 w-6 mx-auto mb-1" />
                        <span className="text-xs">点击上传</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 pt-2">
                    <button type="button" onClick={() => logoInputRef.current?.click()} className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1.5">
                      <Upload className="h-3.5 w-3.5" />
                      选择图片
                    </button>
                    <p className="text-xs text-cert-ink/50 mt-2">支持 PNG / JPG，建议正方形，不超过 5MB</p>
                  </div>
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'logo')} />
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-serif-display text-xl text-cert-navy mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-cert-gold rounded" />
              课程信息
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label-field">课程名称</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.courseName}
                  onChange={(e) => setForm({ ...form, courseName: e.target.value })}
                />
              </div>
              <div>
                <label className="label-field">课时数</label>
                <input
                  type="number"
                  min="1"
                  className="input-field"
                  value={form.courseHours}
                  onChange={(e) => setForm({ ...form, courseHours: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="label-field">颁发日期</label>
                <input
                  type="date"
                  className="input-field"
                  value={form.issueDate}
                  onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-serif-display text-xl text-cert-navy mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-cert-gold rounded" />
              讲师信息
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label-field">讲师姓名</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cert-ink/40" />
                  <input
                    type="text"
                    className="input-field pl-9"
                    value={form.instructorName}
                    onChange={(e) => setForm({ ...form, instructorName: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="label-field">讲师签名</label>
                <div className="flex items-start gap-4">
                  <div
                    onClick={() => sigInputRef.current?.click()}
                    className="w-40 h-20 border-2 border-dashed border-cert-gold/40 rounded-lg flex items-center justify-center cursor-pointer hover:border-cert-gold hover:bg-cert-gold/5 transition-all overflow-hidden bg-white"
                  >
                    {config.instructorSignatureUrl ? (
                      <img src={config.instructorSignatureUrl} alt="signature" className="w-full h-full object-contain p-2" />
                    ) : (
                      <div className="text-center text-cert-ink/40">
                        <span className="text-xs">点击上传签名图片</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 pt-2">
                    <button type="button" onClick={() => sigInputRef.current?.click()} className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1.5">
                      <Upload className="h-3.5 w-3.5" />
                      选择图片
                    </button>
                    <p className="text-xs text-cert-ink/50 mt-2">建议透明背景 PNG，横向签名</p>
                  </div>
                  <input ref={sigInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'signature')} />
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-serif-display text-xl text-cert-navy mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-cert-gold rounded" />
              证书编号规则
            </h2>
            <p className="text-xs text-cert-ink/50 mb-4">
              编号格式：前缀 + 日期 + 序号，例如 CERT-20240615-0001
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="label-field">前缀</label>
                <input
                  type="text"
                  className="input-field font-mono"
                  value={form.numberPrefix}
                  onChange={(e) => setForm({ ...form, numberPrefix: e.target.value })}
                />
              </div>
              <div>
                <label className="label-field">日期格式</label>
                <select
                  className="input-field"
                  value={form.numberDateFormat}
                  onChange={(e) => setForm({ ...form, numberDateFormat: e.target.value })}
                >
                  <option value="YYYYMMDD">YYYYMMDD</option>
                  <option value="YYYYMM">YYYYMM</option>
                  <option value="YYYY">YYYY</option>
                </select>
              </div>
              <div>
                <label className="label-field">起始序号</label>
                <input
                  type="number"
                  min="1"
                  className="input-field"
                  value={form.numberStartIndex}
                  onChange={(e) => setForm({ ...form, numberStartIndex: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="label-field">序号位数</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="input-field"
                  value={form.numberDigits}
                  onChange={(e) => setForm({ ...form, numberDigits: parseInt(e.target.value) || 4 })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="font-serif-display text-xl text-cert-navy mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-cert-gold rounded" />
            实时预览
          </h2>
          <CertificatePreview data={previewData} />
        </div>
      </div>
    </div>
  );
}
