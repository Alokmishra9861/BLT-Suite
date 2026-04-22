const express = require("express");
const controller = require("../controllers/bankAccount.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const entityMiddleware = require("../middlewares/entity.middleware");

const router = express.Router();

router.use(authMiddleware, entityMiddleware);

router.get("/cash-position", controller.getCashPosition);
router.post("/", controller.createBankAccount);
router.get("/", controller.getBankAccounts);
router.get("/:id", controller.getBankAccountById);
router.put("/:id", controller.updateBankAccount);
router.delete("/:id", controller.deleteBankAccount);

module.exports = router;
