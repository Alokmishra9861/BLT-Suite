const { body } = require("express-validator");

const createInvoiceValidator = [
  body("customerId").notEmpty().withMessage("Customer is required"),
  body("invoiceNumber")
    .trim()
    .notEmpty()
    .withMessage("Invoice number is required"),
  body("issueDate").notEmpty().withMessage("Issue date is required"),
  body("dueDate").notEmpty().withMessage("Due date is required"),
  body("currency").optional().trim(),
  body("lineItems").isArray().withMessage("Line items must be an array"),
  body("lineItems.*.description")
    .trim()
    .notEmpty()
    .withMessage("Line item description is required"),
  body("lineItems.*.quantity")
    .isFloat({ min: 0 })
    .withMessage("Quantity must be a positive number"),
  body("lineItems.*.unitPrice")
    .isFloat({ min: 0 })
    .withMessage("Unit price must be a positive number"),
  body("taxAmount").optional().isFloat({ min: 0 }),
  body("notes").optional().trim(),
];

const createInvoicePaymentValidator = [
  body("invoiceId").notEmpty().withMessage("Invoice is required"),
  body("paymentDate").notEmpty().withMessage("Payment date is required"),
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),
  body("paymentMethod")
    .trim()
    .notEmpty()
    .isIn(["cash", "check", "bank_transfer", "credit_card", "other"])
    .withMessage("Valid payment method is required"),
  body("referenceNumber").optional().trim(),
  body("notes").optional().trim(),
];

module.exports = {
  createInvoiceValidator,
  createInvoicePaymentValidator,
};
