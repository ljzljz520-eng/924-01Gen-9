import { getDb } from '../db/index';
import type { OrgConfig, OrgConfigInput } from '../../shared/types';

function rowToOrgConfig(row: Record<string, any>): OrgConfig {
  return {
    id: row.id,
    orgName: row.org_name,
    logoUrl: row.logo_url,
    courseName: row.course_name,
    courseHours: row.course_hours,
    instructorName: row.instructor_name,
    instructorSignatureUrl: row.instructor_signature_url,
    numberPrefix: row.number_prefix,
    numberDateFormat: row.number_date_format,
    numberStartIndex: row.number_start_index,
    numberDigits: row.number_digits,
    issueDate: row.issue_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function escapeSql(str: any): string {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str === 'number') return String(str);
  return "'" + String(str).replace(/'/g, "''") + "'";
}

function buildSelect(sql: string, params: any[] = []): string {
  let i = 0;
  return sql.replace(/\?/g, () => escapeSql(params[i++]));
}

async function queryOne(sql: string, params: any[] = []): Promise<Record<string, any> | null> {
  const db = await getDb();
  const finalSql = buildSelect(sql, params);
  const result = db.exec(finalSql);
  if (!result.length || !result[0].values.length) return null;
  const { columns, values } = result[0];
  const row: Record<string, any> = {};
  columns.forEach((col, idx) => {
    row[col] = values[0][idx];
  });
  return row;
}

async function queryAll(sql: string, params: any[] = []): Promise<Record<string, any>[]> {
  const db = await getDb();
  const finalSql = buildSelect(sql, params);
  const result = db.exec(finalSql);
  if (!result.length) return [];
  const { columns, values } = result[0];
  return values.map((valRow) => {
    const row: Record<string, any> = {};
    columns.forEach((col, idx) => {
      row[col] = valRow[idx];
    });
    return row;
  });
}

async function run(sql: string, params: any[] = []): Promise<void> {
  const db = await getDb();
  if (params.length) {
    db.run(sql, params);
  } else {
    db.run(sql);
  }
}

export async function getConfig(): Promise<OrgConfig> {
  const row = await queryOne("SELECT * FROM org_config WHERE id = 'default'");
  if (!row || !row.id) {
    const today = new Date().toISOString().split('T')[0];
    await run(`INSERT INTO org_config (id, org_name, course_name, course_hours, instructor_name, number_prefix, number_date_format, number_start_index, number_digits, issue_date)
      VALUES ('default', 'XX培训中心', '职业技能培训课程', 40, '张老师', 'CERT', 'YYYYMMDD', 1, 4, ?)`, [today]);
    return getConfig();
  }
  return rowToOrgConfig(row);
}

export async function updateConfig(input: OrgConfigInput): Promise<OrgConfig> {
  await run(`UPDATE org_config SET
    org_name = ?,
    course_name = ?,
    course_hours = ?,
    instructor_name = ?,
    number_prefix = ?,
    number_date_format = ?,
    number_start_index = ?,
    number_digits = ?,
    issue_date = ?,
    updated_at = CURRENT_TIMESTAMP
    WHERE id = 'default'`,
    [
      input.orgName,
      input.courseName,
      input.courseHours,
      input.instructorName,
      input.numberPrefix,
      input.numberDateFormat,
      input.numberStartIndex,
      input.numberDigits,
      input.issueDate,
    ]);
  return getConfig();
}

export async function updateLogoUrl(url: string): Promise<OrgConfig> {
  await run("UPDATE org_config SET logo_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 'default'", [url]);
  return getConfig();
}

export async function updateSignatureUrl(url: string): Promise<OrgConfig> {
  await run("UPDATE org_config SET instructor_signature_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 'default'", [url]);
  return getConfig();
}

export { queryOne, queryAll, run };
