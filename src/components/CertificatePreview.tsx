import { Award, Calendar, Clock } from 'lucide-react';

interface CertificateData {
  orgName: string;
  logoUrl?: string | null;
  courseName: string;
  courseHours: number;
  instructorName: string;
  instructorSignatureUrl?: string | null;
  issueDate: string;
  studentName: string;
  certNumber: string;
  qrCodeUrl?: string | null;
}

export default function CertificatePreview({
  data,
  compact = false,
}: {
  data: CertificateData;
  compact?: boolean;
}) {
  const formatDate = (d: string) => {
    try {
      const date = new Date(d);
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    } catch {
      return d;
    }
  };

  return (
    <div
      id="certificate-preview"
      className={`certificate-border shadow-certificate transition-all duration-300 hover:shadow-certificate-hover ${
        compact ? 'w-full max-w-2xl' : 'w-full aspect-[1.414/1] max-w-4xl'
      }`}
    >
      <div className="certificate-inner h-full w-full p-8 md:p-12 flex flex-col">
        <div className="corner-ornament corner-tl" />
        <div className="corner-ornament corner-tr" />
        <div className="corner-ornament corner-bl" />
        <div className="corner-ornament corner-br" />

        <div className="flex flex-1 flex-col items-center justify-center text-center z-10 px-8 py-4">
          {data.logoUrl && (
            <img
              src={data.logoUrl}
              alt="机构 logo"
              className={`${compact ? 'h-10 w-10' : 'h-16 w-16'} object-contain mb-4 rounded bg-white/50 p-1`}
            />
          )}
          {!data.logoUrl && (
            <div className={`gold-seal flex items-center justify-center ${compact ? 'h-12 w-12' : 'h-20 w-20'} mb-4`}>
              <Award className={`text-white ${compact ? 'h-6 w-6' : 'h-10 w-10'}`} />
            </div>
          )}

          <h2
            className={`font-serif-display text-cert-gold-dark ${
              compact ? 'text-lg tracking-widest mb-2' : 'text-2xl md:text-3xl tracking-[0.3em] mb-3'
            }`}
          >
            {data.orgName}
          </h2>

          <div className={`${compact ? 'h-px w-24' : 'h-px w-40'} bg-gradient-to-r from-transparent via-cert-gold to-transparent my-2`} />

          <h1
            className={`font-serif-display text-cert-navy font-semibold ${
              compact ? 'text-2xl mb-3' : 'text-4xl md:text-5xl mb-6'
            }`}
          >
            结业证书
          </h1>

          <p className={`text-cert-ink/70 ${compact ? 'text-xs mb-4' : 'text-sm md:text-base mb-6'}`}>
            Certificate of Completion
          </p>

          <div className={`${compact ? 'mb-3' : 'mb-8'} space-y-2`}>
            <p className={`text-cert-ink/80 ${compact ? 'text-xs' : 'text-base md:text-lg'}`}>
              兹证明
            </p>
            <p
              className={`font-serif-display text-cert-navy font-bold border-b border-cert-gold/40 pb-1 ${
                compact ? 'text-xl min-w-[160px]' : 'text-3xl md:text-4xl min-w-[240px]'
              }`}
            >
              {data.studentName || '____________'}
            </p>
            <p className={`text-cert-ink/80 ${compact ? 'text-xs mt-2' : 'text-sm md:text-base mt-4'}`}>
              已完成&nbsp;
              <span className="font-medium text-cert-navy">{data.courseName}</span>
              &nbsp;全部课程
            </p>
          </div>

          <div className={`flex items-center gap-6 text-cert-ink/70 ${compact ? 'text-xs mb-4' : 'text-sm mb-8'}`}>
            <span className="flex items-center gap-1">
              <Clock className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
              共计 {data.courseHours} 课时
            </span>
            <span className="flex items-center gap-1">
              <Calendar className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
              {formatDate(data.issueDate)}
            </span>
          </div>

          <div className={`flex items-start justify-between w-full ${compact ? 'mt-auto px-4' : 'mt-auto px-12'}`}>
            <div className="text-left">
              <p className={`${compact ? 'text-[10px]' : 'text-xs'} text-cert-ink/50 mb-1`}>证书编号</p>
              <p className={`font-mono text-cert-navy/80 ${compact ? 'text-xs' : 'text-sm'}`}>{data.certNumber}</p>
            </div>

            <div className="text-center">
              {data.instructorSignatureUrl && (
                <img
                  src={data.instructorSignatureUrl}
                  alt="讲师签名"
                  className={`object-contain ${compact ? 'h-8 mb-1' : 'h-12 mb-2'} mx-auto`}
                />
              )}
              <div className={`${compact ? 'h-px w-20' : 'h-px w-32'} bg-cert-ink/30 mx-auto`} />
              <p className={`${compact ? 'text-[10px] mt-0.5' : 'text-xs mt-1'} text-cert-ink/60`}>
                讲师：{data.instructorName}
              </p>
            </div>

            <div className="text-right">
              {data.qrCodeUrl && (
                <img
                  src={data.qrCodeUrl}
                  alt="验证二维码"
                  className={`object-contain bg-white p-0.5 border border-cert-gold/30 ${compact ? 'h-12 w-12' : 'h-20 w-20'}`}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
