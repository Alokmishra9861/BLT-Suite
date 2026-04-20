const express = require("express");
const entityController = require("../controllers/entity.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  createEntityValidator,
  updateEntityValidator,
} = require("../validators/entity.validator");
const { ROLES } = require("../config/constants");

const router = express.Router();

router.get("/", authMiddleware, entityController.list);
router.get("/:id", authMiddleware, entityController.getById);
router.post(
  "/",
  authMiddleware,
  roleMiddleware([ROLES.SUPER_ADMIN, ROLES.ADMIN]),
  validate(createEntityValidator),
  entityController.create,
);
router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware([ROLES.SUPER_ADMIN, ROLES.ADMIN]),
  validate(updateEntityValidator),
  entityController.update,
);

module.exports = router;
