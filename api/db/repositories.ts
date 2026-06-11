import db from './database.js';
import type {
  MaintenanceCompany,
  Elevator,
  FaultRecord,
  InspectionReport,
  Rectification,
  Reminder,
  CreateMaintenanceCompany,
  CreateElevator,
  CreateFaultRecord,
  CreateInspectionReport,
  CreateRectification,
  CreateReminder,
  UpdateMaintenanceCompany,
  UpdateElevator,
  UpdateFaultRecord,
  UpdateInspectionReport,
  UpdateRectification,
} from '../../shared/types.js';

function generateId(): string {
  return 'id_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

function rowToMaintenanceCompany(row: any): MaintenanceCompany {
  return {
    id: row.id,
    name: row.name,
    contactPerson: row.contact_person,
    contactPhone: row.contact_phone,
    address: row.address,
    createdAt: row.created_at,
  };
}

function rowToElevator(row: any): Elevator {
  return {
    id: row.id,
    building: row.building,
    floor: row.floor,
    manufacturer: row.manufacturer,
    installDate: row.install_date,
    maintenanceCompanyId: row.maintenance_company_id,
    nextInspectionDate: row.next_inspection_date,
    status: row.status,
    createdAt: row.created_at,
  };
}

function rowToFaultRecord(row: any): FaultRecord {
  return {
    id: row.id,
    elevatorId: row.elevator_id,
    faultDate: row.fault_date,
    description: row.description,
    handler: row.handler,
    solution: row.solution,
    status: row.status,
    createdAt: row.created_at,
  };
}

function rowToInspectionReport(row: any): InspectionReport {
  return {
    id: row.id,
    elevatorId: row.elevator_id,
    companyId: row.company_id,
    reportDate: row.report_date,
    reportUrl: row.report_url,
    content: row.content,
    status: row.status,
    reviewerId: row.reviewer_id,
    reviewComment: row.review_comment,
    reviewDate: row.review_date,
    createdAt: row.created_at,
  };
}

function rowToRectification(row: any): Rectification {
  return {
    id: row.id,
    reportId: row.report_id,
    elevatorId: row.elevator_id,
    description: row.description,
    responsible: row.responsible,
    deadline: row.deadline,
    status: row.status,
    completionDate: row.completion_date,
    createdAt: row.created_at,
  };
}

function rowToReminder(row: any): Reminder {
  return {
    id: row.id,
    elevatorId: row.elevator_id,
    type: row.type,
    isRead: row.is_read === 1,
    createdAt: row.created_at,
  };
}

export const maintenanceCompanyRepository = {
  getAll(): MaintenanceCompany[] {
    const rows = db.prepare(`
      SELECT id, name, contact_person, contact_phone, address, created_at
      FROM maintenance_companies
    `).all();
    return rows.map(rowToMaintenanceCompany);
  },

  getById(id: string): MaintenanceCompany | null {
    const row = db.prepare(`
      SELECT id, name, contact_person, contact_phone, address, created_at
      FROM maintenance_companies
      WHERE id = ?
    `).get(id);
    return row ? rowToMaintenanceCompany(row) : null;
  },

  create(data: CreateMaintenanceCompany): MaintenanceCompany {
    const id = generateId();
    const createdAt = new Date().toISOString();
    db.prepare(`
      INSERT INTO maintenance_companies (id, name, contact_person, contact_phone, address, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, data.name, data.contactPerson, data.contactPhone, data.address, createdAt);
    return this.getById(id)!;
  },

  update(id: string, data: UpdateMaintenanceCompany): MaintenanceCompany | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.contactPerson !== undefined) {
      fields.push('contact_person = ?');
      values.push(data.contactPerson);
    }
    if (data.contactPhone !== undefined) {
      fields.push('contact_phone = ?');
      values.push(data.contactPhone);
    }
    if (data.address !== undefined) {
      fields.push('address = ?');
      values.push(data.address);
    }

    if (fields.length === 0) return existing;

    values.push(id);
    db.prepare(`UPDATE maintenance_companies SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.getById(id);
  },

  delete(id: string): boolean {
    const result = db.prepare('DELETE FROM maintenance_companies WHERE id = ?').run(id);
    return result.changes > 0;
  },
};

export const elevatorRepository = {
  getAll(): Elevator[] {
    const rows = db.prepare(`
      SELECT id, building, floor, manufacturer, install_date, maintenance_company_id, next_inspection_date, status, created_at
      FROM elevators
    `).all();
    return rows.map(rowToElevator);
  },

  getById(id: string): Elevator | null {
    const row = db.prepare(`
      SELECT id, building, floor, manufacturer, install_date, maintenance_company_id, next_inspection_date, status, created_at
      FROM elevators
      WHERE id = ?
    `).get(id);
    return row ? rowToElevator(row) : null;
  },

  create(data: CreateElevator): Elevator {
    const id = generateId();
    const createdAt = new Date().toISOString();
    db.prepare(`
      INSERT INTO elevators (id, building, floor, manufacturer, install_date, maintenance_company_id, next_inspection_date, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.building,
      data.floor,
      data.manufacturer,
      data.installDate,
      data.maintenanceCompanyId,
      data.nextInspectionDate,
      data.status ?? 'normal',
      createdAt
    );
    return this.getById(id)!;
  },

  update(id: string, data: UpdateElevator): Elevator | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const fields: string[] = [];
    const values: any[] = [];

    if (data.building !== undefined) {
      fields.push('building = ?');
      values.push(data.building);
    }
    if (data.floor !== undefined) {
      fields.push('floor = ?');
      values.push(data.floor);
    }
    if (data.manufacturer !== undefined) {
      fields.push('manufacturer = ?');
      values.push(data.manufacturer);
    }
    if (data.installDate !== undefined) {
      fields.push('install_date = ?');
      values.push(data.installDate);
    }
    if (data.maintenanceCompanyId !== undefined) {
      fields.push('maintenance_company_id = ?');
      values.push(data.maintenanceCompanyId);
    }
    if (data.nextInspectionDate !== undefined) {
      fields.push('next_inspection_date = ?');
      values.push(data.nextInspectionDate);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }

    if (fields.length === 0) return existing;

    values.push(id);
    db.prepare(`UPDATE elevators SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.getById(id);
  },

  delete(id: string): boolean {
    const result = db.prepare('DELETE FROM elevators WHERE id = ?').run(id);
    return result.changes > 0;
  },
};

export const faultRecordRepository = {
  getAll(): FaultRecord[] {
    const rows = db.prepare(`
      SELECT id, elevator_id, fault_date, description, handler, solution, status, created_at
      FROM fault_records
    `).all();
    return rows.map(rowToFaultRecord);
  },

  getById(id: string): FaultRecord | null {
    const row = db.prepare(`
      SELECT id, elevator_id, fault_date, description, handler, solution, status, created_at
      FROM fault_records
      WHERE id = ?
    `).get(id);
    return row ? rowToFaultRecord(row) : null;
  },

  create(data: CreateFaultRecord): FaultRecord {
    const id = generateId();
    const createdAt = new Date().toISOString();
    db.prepare(`
      INSERT INTO fault_records (id, elevator_id, fault_date, description, handler, solution, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.elevatorId,
      data.faultDate,
      data.description,
      data.handler,
      data.solution,
      data.status ?? 'open',
      createdAt
    );
    return this.getById(id)!;
  },

  update(id: string, data: UpdateFaultRecord): FaultRecord | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const fields: string[] = [];
    const values: any[] = [];

    if (data.elevatorId !== undefined) {
      fields.push('elevator_id = ?');
      values.push(data.elevatorId);
    }
    if (data.faultDate !== undefined) {
      fields.push('fault_date = ?');
      values.push(data.faultDate);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.handler !== undefined) {
      fields.push('handler = ?');
      values.push(data.handler);
    }
    if (data.solution !== undefined) {
      fields.push('solution = ?');
      values.push(data.solution);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }

    if (fields.length === 0) return existing;

    values.push(id);
    db.prepare(`UPDATE fault_records SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.getById(id);
  },

  delete(id: string): boolean {
    const result = db.prepare('DELETE FROM fault_records WHERE id = ?').run(id);
    return result.changes > 0;
  },
};

export const inspectionReportRepository = {
  getAll(): InspectionReport[] {
    const rows = db.prepare(`
      SELECT id, elevator_id, company_id, report_date, report_url, content, status, reviewer_id, review_comment, review_date, created_at
      FROM inspection_reports
    `).all();
    return rows.map(rowToInspectionReport);
  },

  getById(id: string): InspectionReport | null {
    const row = db.prepare(`
      SELECT id, elevator_id, company_id, report_date, report_url, content, status, reviewer_id, review_comment, review_date, created_at
      FROM inspection_reports
      WHERE id = ?
    `).get(id);
    return row ? rowToInspectionReport(row) : null;
  },

  create(data: CreateInspectionReport): InspectionReport {
    const id = generateId();
    const createdAt = new Date().toISOString();
    db.prepare(`
      INSERT INTO inspection_reports (id, elevator_id, company_id, report_date, report_url, content, status, reviewer_id, review_comment, review_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.elevatorId,
      data.companyId,
      data.reportDate,
      data.reportUrl,
      data.content,
      'pending',
      null,
      null,
      null,
      createdAt
    );
    return this.getById(id)!;
  },

  update(id: string, data: UpdateInspectionReport): InspectionReport | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const fields: string[] = [];
    const values: any[] = [];

    if (data.elevatorId !== undefined) {
      fields.push('elevator_id = ?');
      values.push(data.elevatorId);
    }
    if (data.companyId !== undefined) {
      fields.push('company_id = ?');
      values.push(data.companyId);
    }
    if (data.reportDate !== undefined) {
      fields.push('report_date = ?');
      values.push(data.reportDate);
    }
    if (data.reportUrl !== undefined) {
      fields.push('report_url = ?');
      values.push(data.reportUrl);
    }
    if (data.content !== undefined) {
      fields.push('content = ?');
      values.push(data.content);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }
    if (data.reviewerId !== undefined) {
      fields.push('reviewer_id = ?');
      values.push(data.reviewerId);
    }
    if (data.reviewComment !== undefined) {
      fields.push('review_comment = ?');
      values.push(data.reviewComment);
    }
    if (data.reviewDate !== undefined) {
      fields.push('review_date = ?');
      values.push(data.reviewDate);
    }

    if (fields.length === 0) return existing;

    values.push(id);
    db.prepare(`UPDATE inspection_reports SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.getById(id);
  },

  delete(id: string): boolean {
    const result = db.prepare('DELETE FROM inspection_reports WHERE id = ?').run(id);
    return result.changes > 0;
  },
};

export const rectificationRepository = {
  getAll(): Rectification[] {
    const rows = db.prepare(`
      SELECT id, report_id, elevator_id, description, responsible, deadline, status, completion_date, created_at
      FROM rectifications
    `).all();
    return rows.map(rowToRectification);
  },

  getById(id: string): Rectification | null {
    const row = db.prepare(`
      SELECT id, report_id, elevator_id, description, responsible, deadline, status, completion_date, created_at
      FROM rectifications
      WHERE id = ?
    `).get(id);
    return row ? rowToRectification(row) : null;
  },

  create(data: CreateRectification): Rectification {
    const id = generateId();
    const createdAt = new Date().toISOString();
    db.prepare(`
      INSERT INTO rectifications (id, report_id, elevator_id, description, responsible, deadline, status, completion_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.reportId,
      data.elevatorId,
      data.description,
      data.responsible,
      data.deadline,
      'pending',
      null,
      createdAt
    );
    return this.getById(id)!;
  },

  update(id: string, data: UpdateRectification): Rectification | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const fields: string[] = [];
    const values: any[] = [];

    if (data.reportId !== undefined) {
      fields.push('report_id = ?');
      values.push(data.reportId);
    }
    if (data.elevatorId !== undefined) {
      fields.push('elevator_id = ?');
      values.push(data.elevatorId);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.responsible !== undefined) {
      fields.push('responsible = ?');
      values.push(data.responsible);
    }
    if (data.deadline !== undefined) {
      fields.push('deadline = ?');
      values.push(data.deadline);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }
    if (data.completionDate !== undefined) {
      fields.push('completion_date = ?');
      values.push(data.completionDate);
    }

    if (fields.length === 0) return existing;

    values.push(id);
    db.prepare(`UPDATE rectifications SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.getById(id);
  },

  delete(id: string): boolean {
    const result = db.prepare('DELETE FROM rectifications WHERE id = ?').run(id);
    return result.changes > 0;
  },
};

export const reminderRepository = {
  getAll(): Reminder[] {
    const rows = db.prepare(`
      SELECT id, elevator_id, type, is_read, created_at
      FROM reminders
    `).all();
    return rows.map(rowToReminder);
  },

  getById(id: string): Reminder | null {
    const row = db.prepare(`
      SELECT id, elevator_id, type, is_read, created_at
      FROM reminders
      WHERE id = ?
    `).get(id);
    return row ? rowToReminder(row) : null;
  },

  create(data: CreateReminder): Reminder {
    const id = generateId();
    const createdAt = new Date().toISOString();
    db.prepare(`
      INSERT INTO reminders (id, elevator_id, type, is_read, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, data.elevatorId, data.type, 0, createdAt);
    return this.getById(id)!;
  },

  update(id: string, data: { isRead?: boolean }): Reminder | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const fields: string[] = [];
    const values: any[] = [];

    if (data.isRead !== undefined) {
      fields.push('is_read = ?');
      values.push(data.isRead ? 1 : 0);
    }

    if (fields.length === 0) return existing;

    values.push(id);
    db.prepare(`UPDATE reminders SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.getById(id);
  },

  delete(id: string): boolean {
    const result = db.prepare('DELETE FROM reminders WHERE id = ?').run(id);
    return result.changes > 0;
  },
};
