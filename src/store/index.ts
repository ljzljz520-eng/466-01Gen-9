import { create } from 'zustand';
import type {
  Elevator,
  MaintenanceCompany,
  FaultRecord,
  InspectionReport,
  Rectification,
  Reminder,
  CreateElevator,
  CreateMaintenanceCompany,
  CreateFaultRecord,
  CreateInspectionReport,
  CreateRectification,
  UpdateElevator,
  UpdateMaintenanceCompany,
  UpdateFaultRecord,
} from '@shared/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface AppState {
  elevators: Elevator[];
  companies: MaintenanceCompany[];
  faults: FaultRecord[];
  reports: InspectionReport[];
  rectifications: Rectification[];
  reminders: Reminder[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  fetchElevators: () => Promise<void>;
  fetchCompanies: () => Promise<void>;
  fetchFaults: () => Promise<void>;
  fetchReports: () => Promise<void>;
  fetchRectifications: () => Promise<void>;
  fetchReminders: () => Promise<void>;
  checkReminders: () => Promise<void>;
  markReminderRead: (id: string) => Promise<void>;
  createElevator: (data: CreateElevator) => Promise<Elevator | null>;
  addElevator: (data: CreateElevator) => Promise<Elevator | null>;
  updateElevator: (id: string, data: UpdateElevator) => Promise<Elevator | null>;
  deleteElevator: (id: string) => Promise<boolean>;
  createCompany: (data: CreateMaintenanceCompany) => Promise<MaintenanceCompany | null>;
  addCompany: (data: CreateMaintenanceCompany) => Promise<MaintenanceCompany | null>;
  updateCompany: (id: string, data: UpdateMaintenanceCompany) => Promise<MaintenanceCompany | null>;
  deleteCompany: (id: string) => Promise<boolean>;
  createFault: (data: CreateFaultRecord) => Promise<FaultRecord | null>;
  updateFault: (id: string, data: UpdateFaultRecord) => Promise<FaultRecord | null>;
  createReport: (data: CreateInspectionReport) => Promise<InspectionReport | null>;
  approveReport: (id: string, reviewerId: string, reviewComment: string) => Promise<InspectionReport | null>;
  rejectReport: (id: string, reviewerId: string, reviewComment: string) => Promise<InspectionReport | null>;
  createRectification: (data: CreateRectification) => Promise<Rectification | null>;
  completeRectification: (id: string) => Promise<Rectification | null>;
}

const apiGet = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error || 'Request failed');
  return json.data;
};

const apiPost = async <T>(url: string, body: unknown): Promise<T> => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error || 'Request failed');
  return json.data;
};

const apiPut = async <T>(url: string, body: unknown): Promise<T> => {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error || 'Request failed');
  return json.data;
};

const apiDelete = async <T>(url: string): Promise<T> => {
  const res = await fetch(url, { method: 'DELETE' });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error || 'Request failed');
  return json.data;
};

export const useAppStore = create<AppState>((set, get) => ({
  elevators: [],
  companies: [],
  faults: [],
  reports: [],
  rectifications: [],
  reminders: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const [elevators, companies, faults, reports, rectifications, reminders] = await Promise.all([
        apiGet<Elevator[]>('/api/elevators'),
        apiGet<MaintenanceCompany[]>('/api/companies'),
        apiGet<FaultRecord[]>('/api/faults'),
        apiGet<InspectionReport[]>('/api/reports'),
        apiGet<Rectification[]>('/api/rectifications'),
        apiGet<Reminder[]>('/api/reminders'),
      ]);
      set({ elevators, companies, faults, reports, rectifications, reminders, loading: false });
    } catch (error) {
      console.error('fetchAll error:', error);
      set({ loading: false });
    }
  },

  fetchElevators: async () => {
    try {
      const elevators = await apiGet<Elevator[]>('/api/elevators');
      set({ elevators });
    } catch (error) {
      console.error('fetchElevators error:', error);
    }
  },

  fetchCompanies: async () => {
    try {
      const companies = await apiGet<MaintenanceCompany[]>('/api/companies');
      set({ companies });
    } catch (error) {
      console.error('fetchCompanies error:', error);
    }
  },

  fetchFaults: async () => {
    try {
      const faults = await apiGet<FaultRecord[]>('/api/faults');
      set({ faults });
    } catch (error) {
      console.error('fetchFaults error:', error);
    }
  },

  fetchReports: async () => {
    try {
      const reports = await apiGet<InspectionReport[]>('/api/reports');
      set({ reports });
    } catch (error) {
      console.error('fetchReports error:', error);
    }
  },

  fetchRectifications: async () => {
    try {
      const rectifications = await apiGet<Rectification[]>('/api/rectifications');
      set({ rectifications });
    } catch (error) {
      console.error('fetchRectifications error:', error);
    }
  },

  fetchReminders: async () => {
    try {
      const reminders = await apiGet<Reminder[]>('/api/reminders');
      set({ reminders });
    } catch (error) {
      console.error('fetchReminders error:', error);
    }
  },

  checkReminders: async () => {
    try {
      await apiGet('/api/reminders/check');
    } catch (error) {
      console.error('checkReminders error:', error);
    }
  },

  markReminderRead: async (id) => {
    try {
      const updated = await apiPut<Reminder>(`/api/reminders/${id}/read`, {});
      set({
        reminders: get().reminders.map((r) => (r.id === id ? updated : r)),
      });
    } catch (error) {
      console.error('markReminderRead error:', error);
    }
  },

  createElevator: async (data) => {
    try {
      const elevator = await apiPost<Elevator>('/api/elevators', data);
      set({ elevators: [...get().elevators, elevator] });
      return elevator;
    } catch (error) {
      console.error('createElevator error:', error);
      return null;
    }
  },
  addElevator: async (data) => get().createElevator(data),

  updateElevator: async (id, data) => {
    try {
      const elevator = await apiPut<Elevator>(`/api/elevators/${id}`, data);
      set({
        elevators: get().elevators.map((e) => (e.id === id ? elevator : e)),
      });
      return elevator;
    } catch (error) {
      console.error('updateElevator error:', error);
      return null;
    }
  },

  deleteElevator: async (id) => {
    try {
      await apiDelete(`/api/elevators/${id}`);
      set({ elevators: get().elevators.filter((e) => e.id !== id) });
      return true;
    } catch (error) {
      console.error('deleteElevator error:', error);
      return false;
    }
  },

  createCompany: async (data) => {
    try {
      const company = await apiPost<MaintenanceCompany>('/api/companies', data);
      set({ companies: [...get().companies, company] });
      return company;
    } catch (error) {
      console.error('createCompany error:', error);
      return null;
    }
  },
  addCompany: async (data) => get().createCompany(data),

  updateCompany: async (id, data) => {
    try {
      const company = await apiPut<MaintenanceCompany>(`/api/companies/${id}`, data);
      set({
        companies: get().companies.map((c) => (c.id === id ? company : c)),
      });
      return company;
    } catch (error) {
      console.error('updateCompany error:', error);
      return null;
    }
  },

  deleteCompany: async (id) => {
    try {
      await apiDelete(`/api/companies/${id}`);
      set({ companies: get().companies.filter((c) => c.id !== id) });
      return true;
    } catch (error) {
      console.error('deleteCompany error:', error);
      return false;
    }
  },

  createFault: async (data) => {
    try {
      const fault = await apiPost<FaultRecord>('/api/faults', { ...data, status: 'open' });
      set({ faults: [...get().faults, fault] });
      return fault;
    } catch (error) {
      console.error('createFault error:', error);
      return null;
    }
  },

  updateFault: async (id, data) => {
    try {
      const fault = await apiPut<FaultRecord>(`/api/faults/${id}`, data);
      set({
        faults: get().faults.map((f) => (f.id === id ? fault : f)),
      });
      return fault;
    } catch (error) {
      console.error('updateFault error:', error);
      return null;
    }
  },

  createReport: async (data) => {
    try {
      const report = await apiPost<InspectionReport>('/api/reports', data);
      set({ reports: [...get().reports, report] });
      return report;
    } catch (error) {
      console.error('createReport error:', error);
      return null;
    }
  },

  approveReport: async (id, reviewerId, reviewComment) => {
    try {
      const report = await apiPut<InspectionReport>(`/api/reports/${id}/approve`, {
        reviewerId,
        reviewComment,
        approved: true,
      });
      set({
        reports: get().reports.map((r) => (r.id === id ? report : r)),
      });
      return report;
    } catch (error) {
      console.error('approveReport error:', error);
      return null;
    }
  },

  rejectReport: async (id, reviewerId, reviewComment) => {
    try {
      const report = await apiPut<InspectionReport>(`/api/reports/${id}/reject`, {
        reviewerId,
        reviewComment,
      });
      set({
        reports: get().reports.map((r) => (r.id === id ? report : r)),
      });
      return report;
    } catch (error) {
      console.error('rejectReport error:', error);
      return null;
    }
  },

  createRectification: async (data) => {
    try {
      const rectification = await apiPost<Rectification>('/api/rectifications', data);
      set({ rectifications: [...get().rectifications, rectification] });
      return rectification;
    } catch (error) {
      console.error('createRectification error:', error);
      return null;
    }
  },

  completeRectification: async (id) => {
    try {
      const rectification = await apiPut<Rectification>(`/api/rectifications/${id}/complete`, {});
      set({
        rectifications: get().rectifications.map((r) => (r.id === id ? rectification : r)),
      });
      return rectification;
    } catch (error) {
      console.error('completeRectification error:', error);
      return null;
    }
  },
}));
