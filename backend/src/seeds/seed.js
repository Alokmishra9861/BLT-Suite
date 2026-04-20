require("dotenv").config();

const connectDB = require("../config/db");
const Role = require("../models/Role");
const User = require("../models/User");
const Entity = require("../models/Entity");
const Department = require("../models/Department");
const Employee = require("../models/Employee");
const WorkPermit = require("../models/WorkPermit");
const LeaveRequest = require("../models/LeaveRequest");
const Benefit = require("../models/Benefit");
const Termination = require("../models/Termination");
const { ROLES } = require("../config/constants");

const seed = async () => {
  await connectDB();

  const roleNames = Object.values(ROLES);
  const existingRoles = await Role.find({ name: { $in: roleNames } }).lean();
  const existingRoleNames = new Set(existingRoles.map((role) => role.name));

  const rolesToCreate = roleNames
    .filter((name) => !existingRoleNames.has(name))
    .map((name) => ({ name, description: `${name} role` }));

  if (rolesToCreate.length) {
    await Role.insertMany(rolesToCreate);
  }

  let entity = await Entity.findOne({ code: "BLT-HQ" });
  if (!entity) {
    entity = await Entity.create({
      name: "BLT International Group HQ",
      code: "BLT-HQ",
      country: "AE",
      currency: "AED",
      timezone: "Asia/Dubai",
      active: true,
    });
  }

  const adminRole = await Role.findOne({ name: ROLES.SUPER_ADMIN });
  if (!adminRole) {
    throw new Error("SUPER_ADMIN role not found");
  }

  const adminEmail = "admin@blt-suite.local";
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    await User.create({
      name: "BLT Super Admin",
      email: adminEmail,
      password: "Admin123!@#",
      role: adminRole._id,
      entityIds: [entity._id],
      isActive: true,
    });
  }

  const adminUser = await User.findOne({ email: adminEmail });

  const hrDepartments = [
    {
      name: "Human Resources",
      description: "People operations and employee support",
    },
    { name: "Operations", description: "Operational support and execution" },
    { name: "Finance", description: "Accounting and financial management" },
  ];

  for (const department of hrDepartments) {
    await Department.findOneAndUpdate(
      { entityId: entity._id, name: department.name },
      { ...department, entityId: entity._id },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  const departments = await Department.find({ entityId: entity._id })
    .sort({ name: 1 })
    .lean();
  const hrDepartment =
    departments.find((department) => department.name === "Human Resources") ||
    departments[0];
  const opsDepartment =
    departments.find((department) => department.name === "Operations") ||
    departments[1] ||
    departments[0];
  const financeDepartment =
    departments.find((department) => department.name === "Finance") ||
    departments[2] ||
    departments[0];

  const sampleEmployees = [
    {
      firstName: "Ava",
      lastName: "Morris",
      email: "ava.morris@blt-suite.local",
      phone: "+9715550101",
      departmentId: hrDepartment._id,
      jobTitle: "HR Manager",
      employmentType: "full-time",
      status: "active",
      salary: 95000,
      payType: "salary",
      entityId: entity._id,
      hireDate: new Date("2024-04-01"),
      createdBy: adminUser._id,
    },
    {
      firstName: "Noah",
      lastName: "Patel",
      email: "noah.patel@blt-suite.local",
      phone: "+9715550102",
      departmentId: opsDepartment._id,
      jobTitle: "Operations Specialist",
      employmentType: "contract",
      status: "active",
      salary: 72000,
      payType: "salary",
      entityId: entity._id,
      hireDate: new Date("2024-06-10"),
      createdBy: adminUser._id,
    },
    {
      firstName: "Mia",
      lastName: "Chen",
      email: "mia.chen@blt-suite.local",
      phone: "+9715550103",
      departmentId: financeDepartment._id,
      jobTitle: "Finance Analyst",
      employmentType: "full-time",
      status: "terminated",
      salary: 88000,
      payType: "salary",
      entityId: entity._id,
      hireDate: new Date("2023-09-15"),
      createdBy: adminUser._id,
    },
  ];

  for (const employee of sampleEmployees) {
    await Employee.findOneAndUpdate(
      { entityId: entity._id, email: employee.email },
      employee,
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  const seededEmployees = await Employee.find({ entityId: entity._id })
    .sort({ createdAt: 1 })
    .lean();
  const ava = seededEmployees.find(
    (employee) => employee.email === "ava.morris@blt-suite.local",
  );
  const noah = seededEmployees.find(
    (employee) => employee.email === "noah.patel@blt-suite.local",
  );
  const mia = seededEmployees.find(
    (employee) => employee.email === "mia.chen@blt-suite.local",
  );

  if (ava) {
    await WorkPermit.findOneAndUpdate(
      { entityId: entity._id, permitNumber: "WP-2026-001" },
      {
        employeeId: ava._id,
        permitNumber: "WP-2026-001",
        issueDate: new Date("2025-05-01"),
        expiryDate: new Date("2026-05-01"),
        status: "active",
        entityId: entity._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  if (noah) {
    await LeaveRequest.findOneAndUpdate(
      {
        entityId: entity._id,
        employeeId: noah._id,
        type: "vacation",
        startDate: new Date("2026-04-21"),
      },
      {
        employeeId: noah._id,
        type: "vacation",
        startDate: new Date("2026-04-21"),
        endDate: new Date("2026-04-25"),
        days: 5,
        reason: "Family travel",
        status: "pending",
        entityId: entity._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    await Benefit.findOneAndUpdate(
      { entityId: entity._id, employeeId: noah._id, type: "insurance" },
      {
        employeeId: noah._id,
        type: "insurance",
        amount: 1200,
        status: "active",
        entityId: entity._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  if (mia) {
    await Termination.findOneAndUpdate(
      { entityId: entity._id, employeeId: mia._id },
      {
        employeeId: mia._id,
        terminationDate: new Date("2026-03-31"),
        reason: "Role restructure",
        severanceAmount: 15000,
        status: "processed",
        entityId: entity._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  console.log("Seed completed");
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
