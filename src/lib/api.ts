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
} from '@shared/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  const result = (await response.json()) as ApiResponse<T>;

  if (!result.success) {
    throw new Error(result.error || 'Request failed');
  }

  return result.data;
}

const API_BASE = '/api';

export const companiesApi = {
  getAll: (): Promise<MaintenanceCompany[]> =>
    request<MaintenanceCompany[]>(`${API_BASE}/companies`),
  getById: (id: string): Promise<MaintenanceCompany> =>
    request<MaintenanceCompany>(`${API_BASE}/companies/${id}`),
  create: (data: CreateMaintenanceCompany): Promise<MaintenanceCompany> =>
    request<MaintenanceCompany>(`${API_BASE}/companies`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateMaintenanceCompany): Promise<MaintenanceCompany> =>
    request<MaintenanceCompany>(`${API_BASE}/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  remove: (id: string): Promise<{ id: string }> =>
    request<{ id: string }>(`${API_BASE}/companies/${id}`, {
      method: 'DELETE',
    }),
};

export const elevatorsApi = {
  getAll: (): Promise<Elevator[]> =>
    request<Elevator[]>(`${API_BASE}/elevators`),
  getById: (id: string): Promise<Elevator> =>
    request<Elevator>(`${API_BASE}/elevators/${id}`),
  create: (data: CreateElevator): Promise<Elevator> =>
    request<Elevator>(`${API_BASE}/elevators`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateElevator): Promise<Elevator> =>
    request<Elevator>(`${API_BASE}/elevators/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  remove: (id: string): Promise<{ id: string }> =>
    request<{ id: string }>(`${API_BASE}/elevators/${id}`, {
      method: 'DELETE',
    }),
  getFaults: (id: string): Promise<FaultRecord[]> =>
    request<FaultRecord[]>(`${API_BASE}/elevators/${id}/faults`),
  getReports: (id: string): Promise<InspectionReport[]> =>
    request<InspectionReport[]>(`${API_BASE}/elevators/${id}/reports`),
};

export const faultsApi = {
  getAll: (elevatorId?: string): Promise<FaultRecord[]> => {
    const url = elevatorId
      ? `${API_BASE}/faults?elevatorId=${encodeURIComponent(elevatorId)}`
      : `${API_BASE}/faults`;
    return request<FaultRecord[]>(url);
  },
  getById: (id: string): Promise<FaultRecord> =>
    request<FaultRecord>(`${API_BASE}/faults/${id}`),
  create: (data: CreateFaultRecord): Promise<FaultRecord> =>
    request<FaultRecord>(`${API_BASE}/faults`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateFaultRecord): Promise<FaultRecord> =>
    request<FaultRecord>(`${API_BASE}/faults/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  remove: (id: string): Promise<{ id: string }> =>
    request<{ id: string }>(`${API_BASE}/faults/${id}`, {
      method: 'DELETE',
    }),
};

export const reportsApi = {
  getAll: (): Promise<InspectionReport[]> =>
    request<InspectionReport[]>(`${API_BASE}/reports`),
  getById: (id: string): Promise<InspectionReport> =>
    request<InspectionReport>(`${API_BASE}/reports/${id}`),
  create: (data: CreateInspectionReport): Promise<InspectionReport> =>
    request<InspectionReport>(`${API_BASE}/reports`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateInspectionReport): Promise<InspectionReport> =>
    request<InspectionReport>(`${API_BASE}/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  remove: (id: string): Promise<{ id: string }> =>
    request<{ id: string }>(`${API_BASE}/reports/${id}`, {
      method: 'DELETE',
    }),
  approve: (
    id: string,
    reviewerId: string,
    reviewComment: string,
    approved?: boolean,
  ): Promise<InspectionReport> =>
    request<InspectionReport>(`${API_BASE}/reports/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ reviewerId, reviewComment, approved }),
    }),
  reject: (
    id: string,
    reviewerId: string,
    reviewComment: string,
  ): Promise<InspectionReport> =>
    request<InspectionReport>(`${API_BASE}/reports/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reviewerId, reviewComment }),
    }),
};

export const rectificationsApi = {
  getAll: (): Promise<Rectification[]> =>
    request<Rectification[]>(`${API_BASE}/rectifications`),
  getById: (id: string): Promise<Rectification> =>
    request<Rectification>(`${API_BASE}/rectifications/${id}`),
  create: (data: CreateRectification): Promise<Rectification> =>
    request<Rectification>(`${API_BASE}/rectifications`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateRectification): Promise<Rectification> =>
    request<Rectification>(`${API_BASE}/rectifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  remove: (id: string): Promise<{ id: string }> =>
    request<{ id: string }>(`${API_BASE}/rectifications/${id}`, {
      method: 'DELETE',
    }),
  complete: (id: string): Promise<Rectification> =>
    request<Rectification>(`${API_BASE}/rectifications/${id}/complete`, {
      method: 'PUT',
    }),
};

export const remindersApi = {
  getAll: (): Promise<Reminder[]> =>
    request<Reminder[]>(`${API_BASE}/reminders`),
  getById: (id: string): Promise<Reminder> =>
    request<Reminder>(`${API_BASE}/reminders/${id}`),
  create: (data: CreateReminder): Promise<Reminder> =>
    request<Reminder>(`${API_BASE}/reminders`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<CreateReminder>): Promise<Reminder> =>
    request<Reminder>(`${API_BASE}/reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  remove: (id: string): Promise<{ id: string }> =>
    request<{ id: string }>(`${API_BASE}/reminders/${id}`, {
      method: 'DELETE',
    }),
  markRead: (id: string): Promise<Reminder> =>
    request<Reminder>(`${API_BASE}/reminders/${id}/read`, {
      method: 'PUT',
    }),
  check: (): Promise<{ generated: number }> =>
    request<{ generated: number }>(`${API_BASE}/reminders/check`),
};
