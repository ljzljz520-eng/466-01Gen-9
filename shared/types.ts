export interface MaintenanceCompany {
  id: string;
  name: string;
  contactPerson: string;
  contactPhone: string;
  address: string;
  createdAt: string;
}

export interface Elevator {
  id: string;
  building: string;
  floor: string;
  manufacturer: string;
  installDate: string;
  maintenanceCompanyId: string;
  nextInspectionDate: string;
  status: 'normal' | 'maintenance' | 'fault';
  createdAt: string;
}

export interface FaultRecord {
  id: string;
  elevatorId: string;
  faultDate: string;
  description: string;
  handler: string;
  solution: string;
  status: 'open' | 'processing' | 'resolved';
  createdAt: string;
}

export interface InspectionReport {
  id: string;
  elevatorId: string;
  companyId: string;
  reportDate: string;
  reportUrl: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewerId: string;
  reviewComment: string;
  reviewDate: string;
  createdAt: string;
}

export interface Rectification {
  id: string;
  reportId: string;
  elevatorId: string;
  description: string;
  responsible: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
  completionDate: string;
  createdAt: string;
}

export type ReminderType = '30days' | '15days' | '7days' | '1day';

export interface Reminder {
  id: string;
  elevatorId: string;
  type: ReminderType;
  isRead: boolean;
  createdAt: string;
}

export type CreateMaintenanceCompany = Omit<MaintenanceCompany, 'id' | 'createdAt'>;
export type CreateElevator = Omit<Elevator, 'id' | 'createdAt'>;
export type CreateFaultRecord = Omit<FaultRecord, 'id' | 'status' | 'createdAt'> & { status?: FaultRecord['status'] };
export type CreateInspectionReport = Omit<InspectionReport, 'id' | 'status' | 'reviewerId' | 'reviewComment' | 'reviewDate' | 'createdAt'>;
export type CreateRectification = Omit<Rectification, 'id' | 'status' | 'completionDate' | 'createdAt'>;
export type CreateReminder = Omit<Reminder, 'id' | 'isRead' | 'createdAt'>;

export type UpdateMaintenanceCompany = Partial<CreateMaintenanceCompany>;
export type UpdateElevator = Partial<CreateElevator>;
export type UpdateFaultRecord = Partial<CreateFaultRecord & { status: FaultRecord['status'] }>;
export type UpdateInspectionReport = Partial<CreateInspectionReport & { status: InspectionReport['status']; reviewerId: string; reviewComment: string; reviewDate: string }>;
export type UpdateRectification = Partial<CreateRectification & { status: Rectification['status']; completionDate: string }>;
