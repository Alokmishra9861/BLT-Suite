import api from "./api";

export const employeeService = {
  getEmployees: (entityId, params) =>
    api.get(`/entities/${entityId}/employees`, { params }),
  getEmployee: (entityId, id) =>
    api.get(`/entities/${entityId}/employees/${id}`),
  createEmployee: (entityId, data) =>
    api.post(`/entities/${entityId}/employees`, data),
  updateEmployee: (entityId, id, data) =>
    api.put(`/entities/${entityId}/employees/${id}`, data),
  deleteEmployee: (entityId, id) =>
    api.delete(`/entities/${entityId}/employees/${id}`),
};

export const departmentService = {
  getDepartments: (entityId) => api.get(`/entities/${entityId}/departments`),
  createDepartment: (entityId, data) =>
    api.post(`/entities/${entityId}/departments`, data),
  updateDepartment: (entityId, id, data) =>
    api.put(`/entities/${entityId}/departments/${id}`, data),
  deleteDepartment: (entityId, id) =>
    api.delete(`/entities/${entityId}/departments/${id}`),
};

export const workPermitService = {
  getWorkPermits: (entityId, params) =>
    api.get(`/entities/${entityId}/work-permits`, { params }),
  createWorkPermit: (entityId, data) =>
    api.post(`/entities/${entityId}/work-permits`, data),
  updateWorkPermit: (entityId, id, data) =>
    api.put(`/entities/${entityId}/work-permits/${id}`, data),
};

export const leaveRequestService = {
  getLeaveRequests: (entityId, params) =>
    api.get(`/entities/${entityId}/leave-requests`, { params }),
  createLeaveRequest: (entityId, data) =>
    api.post(`/entities/${entityId}/leave-requests`, data),
  updateLeaveRequest: (entityId, id, data) =>
    api.put(`/entities/${entityId}/leave-requests/${id}`, data),
  approveLeaveRequest: (entityId, id) =>
    api.patch(`/entities/${entityId}/leave-requests/${id}/approve`),
  rejectLeaveRequest: (entityId, id) =>
    api.patch(`/entities/${entityId}/leave-requests/${id}/reject`),
};

export const benefitService = {
  getBenefits: (entityId, params) =>
    api.get(`/entities/${entityId}/benefits`, { params }),
  createBenefit: (entityId, data) =>
    api.post(`/entities/${entityId}/benefits`, data),
  updateBenefit: (entityId, id, data) =>
    api.put(`/entities/${entityId}/benefits/${id}`, data),
};

export const terminationService = {
  getTerminations: (entityId, params) =>
    api.get(`/entities/${entityId}/terminations`, { params }),
  createTermination: (entityId, data) =>
    api.post(`/entities/${entityId}/terminations`, data),
};
