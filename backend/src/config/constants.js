module.exports = {
  ROLES: {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    MANAGER: 'manager',
    ACCOUNTANT: 'accountant',
    HR_MANAGER: 'hr_manager',
    EMPLOYEE: 'employee',
    VIEWER: 'viewer',
  },

  JOURNAL_STATUS: {
    DRAFT: 'draft',
    POSTED: 'posted',
    VOIDED: 'voided',
  },

  LEAVE_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
  },

  PAYROLL_STATUS: {
    DRAFT: 'draft',
    PROCESSING: 'processing',
    PROCESSED: 'processed',
    POSTED: 'posted',
    CANCELLED: 'cancelled',
  },

  INVOICE_STATUS: {
    DRAFT: 'draft',
    SENT: 'sent',
    PARTIALLY_PAID: 'partially_paid',
    PAID: 'paid',
    OVERDUE: 'overdue',
    CANCELLED: 'cancelled',
  },

  BILL_STATUS: {
    DRAFT: 'draft',
    RECEIVED: 'received',
    PARTIALLY_PAID: 'partially_paid',
    PAID: 'paid',
    OVERDUE: 'overdue',
    CANCELLED: 'cancelled',
  },

  ACCOUNT_TYPES: {
    ASSET: 'asset',
    LIABILITY: 'liability',
    EQUITY: 'equity',
    REVENUE: 'revenue',
    EXPENSE: 'expense',
  },

  EMPLOYMENT_STATUS: {
    ACTIVE: 'active',
    ON_LEAVE: 'on_leave',
    TERMINATED: 'terminated',
    SUSPENDED: 'suspended',
  },

  TRANSACTION_TYPES: {
    DEPOSIT: 'deposit',
    WITHDRAWAL: 'withdrawal',
    TRANSFER: 'transfer',
    FEE: 'fee',
    INTEREST: 'interest',
    OTHER: 'other',
  },

  RECONCILIATION_STATUS: {
    PENDING: 'pending',
    RECONCILED: 'reconciled',
    DISCREPANCY: 'discrepancy',
  },

  AUDIT_ACTIONS: {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    POST: 'post',
    VOID: 'void',
    REVERSE: 'reverse',
    APPROVE: 'approve',
    REJECT: 'reject',
    LOGIN: 'login',
  },
};
