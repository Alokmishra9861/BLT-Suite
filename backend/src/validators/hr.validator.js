const Joi = require("joi");

const validateEmployee = (req, res, next) => {
  const schema = Joi.object({
    firstName: Joi.string().required().trim(),
    lastName: Joi.string().required().trim(),
    email: Joi.string().email().required().lowercase().trim(),
    phone: Joi.string().optional().trim(),
    departmentId: Joi.string().required(),
    jobTitle: Joi.string().required().trim(),
    employmentType: Joi.string()
      .valid("full-time", "part-time", "contract")
      .required(),
    status: Joi.string().valid("active", "inactive", "terminated").optional(),
    salary: Joi.number().min(0).required(),
    payType: Joi.string().valid("salary", "hourly").required(),
    hireDate: Joi.date().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  next();
};

const validateDepartment = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().trim(),
    description: Joi.string().optional().trim(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  next();
};

const validateWorkPermit = (req, res, next) => {
  const schema = Joi.object({
    employeeId: Joi.string().required(),
    permitNumber: Joi.string().required().trim(),
    issueDate: Joi.date().required(),
    expiryDate: Joi.date().required(),
    status: Joi.string().valid("active", "expired").optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  next();
};

const validateLeaveRequest = (req, res, next) => {
  const schema = Joi.object({
    employeeId: Joi.string().required(),
    type: Joi.string().valid("vacation", "sick", "unpaid").required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    days: Joi.number().min(1).required(),
    reason: Joi.string().optional().trim(),
    status: Joi.string().valid("pending", "approved", "rejected").optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  next();
};

const validateBenefit = (req, res, next) => {
  const schema = Joi.object({
    employeeId: Joi.string().required(),
    type: Joi.string().valid("insurance", "pension").required(),
    amount: Joi.number().min(0).required(),
    status: Joi.string().valid("active", "inactive").optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  next();
};

const validateTermination = (req, res, next) => {
  const schema = Joi.object({
    employeeId: Joi.string().required(),
    terminationDate: Joi.date().required(),
    reason: Joi.string().required().trim(),
    severanceAmount: Joi.number().min(0).optional(),
    status: Joi.string().valid("active", "processed").optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  next();
};

module.exports = {
  validateEmployee,
  validateDepartment,
  validateWorkPermit,
  validateLeaveRequest,
  validateBenefit,
  validateTermination,
};
