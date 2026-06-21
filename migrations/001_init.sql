CREATE TABLE IF NOT EXISTS org_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  org_name TEXT NOT NULL DEFAULT 'XX培训中心',
  logo_url TEXT,
  course_name TEXT NOT NULL DEFAULT '职业技能培训课程',
  course_hours INTEGER NOT NULL DEFAULT 40,
  instructor_name TEXT NOT NULL DEFAULT '张老师',
  instructor_signature_url TEXT,
  number_prefix TEXT NOT NULL DEFAULT 'CERT',
  number_date_format TEXT NOT NULL DEFAULT 'YYYYMMDD',
  number_start_index INTEGER NOT NULL DEFAULT 1,
  number_digits INTEGER NOT NULL DEFAULT 4,
  issue_date TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS certificate (
  id TEXT PRIMARY KEY,
  cert_number TEXT UNIQUE NOT NULL,
  student_name TEXT NOT NULL,
  student_id TEXT,
  course_name TEXT NOT NULL,
  course_hours INTEGER NOT NULL,
  org_name TEXT NOT NULL,
  instructor_name TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'valid',
  qr_code_url TEXT,
  pdf_url TEXT,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reissue_record (
  id TEXT PRIMARY KEY,
  old_cert_id TEXT NOT NULL REFERENCES certificate(id),
  new_cert_id TEXT NOT NULL REFERENCES certificate(id),
  reason TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_certificate_status ON certificate(status);
CREATE INDEX IF NOT EXISTS idx_certificate_student_name ON certificate(student_name);
CREATE INDEX IF NOT EXISTS idx_certificate_cert_number ON certificate(cert_number);
CREATE INDEX IF NOT EXISTS idx_reissue_record_old_cert ON reissue_record(old_cert_id);

INSERT OR IGNORE INTO org_config (id, org_name, course_name, course_hours, instructor_name, number_prefix, number_date_format, number_start_index, number_digits, issue_date)
VALUES ('default', '卓越职业培训学院', '高级Web前端开发工程师认证', 120, '李明远教授', 'CERT', 'YYYYMMDD', 1, 4, date('now'));
