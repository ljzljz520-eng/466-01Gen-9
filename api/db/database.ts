import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..', '..');
const dataDir = join(projectRoot, 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, 'elevator.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const createTablesSql = `
CREATE TABLE IF NOT EXISTS maintenance_companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  contact_phone TEXT,
  address TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS elevators (
  id TEXT PRIMARY KEY,
  building TEXT NOT NULL,
  floor TEXT,
  manufacturer TEXT,
  install_date TEXT,
  maintenance_company_id TEXT,
  next_inspection_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'normal',
  created_at TEXT NOT NULL,
  FOREIGN KEY (maintenance_company_id) REFERENCES maintenance_companies(id)
);

CREATE TABLE IF NOT EXISTS fault_records (
  id TEXT PRIMARY KEY,
  elevator_id TEXT NOT NULL,
  fault_date TEXT NOT NULL,
  description TEXT NOT NULL,
  handler TEXT,
  solution TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL,
  FOREIGN KEY (elevator_id) REFERENCES elevators(id)
);

CREATE TABLE IF NOT EXISTS inspection_reports (
  id TEXT PRIMARY KEY,
  elevator_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  report_date TEXT NOT NULL,
  report_url TEXT,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewer_id TEXT,
  review_comment TEXT,
  review_date TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (elevator_id) REFERENCES elevators(id),
  FOREIGN KEY (company_id) REFERENCES maintenance_companies(id)
);

CREATE TABLE IF NOT EXISTS rectifications (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL,
  elevator_id TEXT NOT NULL,
  description TEXT NOT NULL,
  responsible TEXT NOT NULL,
  deadline TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  completion_date TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (report_id) REFERENCES inspection_reports(id),
  FOREIGN KEY (elevator_id) REFERENCES elevators(id)
);

CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  elevator_id TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (elevator_id) REFERENCES elevators(id)
);

CREATE INDEX IF NOT EXISTS idx_elevators_next_inspection ON elevators(next_inspection_date);
CREATE INDEX IF NOT EXISTS idx_reports_status ON inspection_reports(status);
CREATE INDEX IF NOT EXISTS idx_rectifications_status ON rectifications(status);
CREATE INDEX IF NOT EXISTS idx_reminders_unread ON reminders(is_read);
`;

db.exec(createTablesSql);

function generateId(): string {
  return 'id_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function seedData() {
  const companyCount = db.prepare('SELECT COUNT(*) as count FROM maintenance_companies').get() as { count: number };
  if (companyCount.count > 0) {
    return;
  }

  const now = new Date();
  const nowStr = now.toISOString();

  const insertCompany = db.prepare(`
    INSERT INTO maintenance_companies (id, name, contact_person, contact_phone, address, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const company1Id = generateId();
  const company2Id = generateId();

  insertCompany.run(company1Id, '安联电梯维保有限公司', '张经理', '13800138001', '北京市朝阳区建国路88号', nowStr);
  insertCompany.run(company2Id, '恒信电梯服务有限公司', '李主管', '13900139002', '上海市浦东新区世纪大道100号', nowStr);

  const insertElevator = db.prepare(`
    INSERT INTO elevators (id, building, floor, manufacturer, install_date, maintenance_company_id, next_inspection_date, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const elevatorData = [
    { building: 'A座', floor: '1-20层', manufacturer: '三菱电梯', installDate: formatDate(addDays(now, -365 * 3)), nextDate: formatDate(addDays(now, 7)), status: 'normal' as const, companyId: company1Id },
    { building: 'B座', floor: '1-15层', manufacturer: '奥的斯电梯', installDate: formatDate(addDays(now, -365 * 2)), nextDate: formatDate(addDays(now, 15)), status: 'normal' as const, companyId: company1Id },
    { building: 'C座', floor: '1-25层', manufacturer: '通力电梯', installDate: formatDate(addDays(now, -365 * 4)), nextDate: formatDate(addDays(now, 30)), status: 'maintenance' as const, companyId: company2Id },
    { building: 'D座', floor: '1-18层', manufacturer: '日立电梯', installDate: formatDate(addDays(now, -365 * 1)), nextDate: formatDate(addDays(now, 45)), status: 'normal' as const, companyId: company2Id },
    { building: 'E座', floor: '1-30层', manufacturer: '迅达电梯', installDate: formatDate(addDays(now, -365 * 5)), nextDate: formatDate(addDays(now, 60)), status: 'fault' as const, companyId: company1Id },
  ];

  const elevatorIds: string[] = [];
  for (const data of elevatorData) {
    const id = generateId();
    elevatorIds.push(id);
    insertElevator.run(id, data.building, data.floor, data.manufacturer, data.installDate, data.companyId, data.nextDate, data.status, nowStr);
  }

  const insertFault = db.prepare(`
    INSERT INTO fault_records (id, elevator_id, fault_date, description, handler, solution, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertFault.run(
    generateId(),
    elevatorIds[4],
    formatDate(addDays(now, -3)),
    '电梯运行时出现异常噪音，楼层显示闪烁',
    '王师傅',
    null,
    'processing',
    nowStr
  );
  insertFault.run(
    generateId(),
    elevatorIds[2],
    formatDate(addDays(now, -7)),
    '门机系统故障，无法正常开关门',
    '赵师傅',
    '已更换门机皮带',
    'resolved',
    nowStr
  );
  insertFault.run(
    generateId(),
    elevatorIds[0],
    formatDate(addDays(now, -1)),
    '按钮面板部分按键无响应',
    null,
    null,
    'open',
    nowStr
  );

  const insertReport = db.prepare(`
    INSERT INTO inspection_reports (id, elevator_id, company_id, report_date, report_url, content, status, reviewer_id, review_comment, review_date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const report1Id = generateId();
  const report2Id = generateId();

  insertReport.run(
    report1Id,
    elevatorIds[0],
    company1Id,
    formatDate(addDays(now, -5)),
    '/reports/report-001.pdf',
    '年检合格，各项指标正常',
    'approved',
    'reviewer_001',
    '报告完整，审批通过',
    formatDate(addDays(now, -2)),
    nowStr
  );
  insertReport.run(
    report2Id,
    elevatorIds[1],
    company1Id,
    formatDate(addDays(now, -3)),
    '/reports/report-002.pdf',
    '发现部分安全隐患，需整改',
    'pending',
    null,
    null,
    null,
    nowStr
  );

  const insertRectification = db.prepare(`
    INSERT INTO rectifications (id, report_id, elevator_id, description, responsible, deadline, status, completion_date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertRectification.run(
    generateId(),
    report2Id,
    elevatorIds[1],
    '限速器需要重新校准，紧急通话装置信号不稳定',
    '李主管',
    formatDate(addDays(now, 14)),
    'in_progress',
    null,
    nowStr
  );

  const insertReminder = db.prepare(`
    INSERT INTO reminders (id, elevator_id, type, is_read, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertReminder.run(generateId(), elevatorIds[0], '7days', 0, nowStr);
  insertReminder.run(generateId(), elevatorIds[1], '15days', 0, nowStr);
  insertReminder.run(generateId(), elevatorIds[2], '30days', 1, nowStr);
  insertReminder.run(generateId(), elevatorIds[3], '30days', 0, nowStr);
  insertReminder.run(generateId(), elevatorIds[4], '30days', 0, nowStr);
  insertReminder.run(generateId(), elevatorIds[0], '1day', 0, nowStr);
}

seedData();

export default db;
