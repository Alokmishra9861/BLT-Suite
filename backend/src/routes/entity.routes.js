const express = require("express");
const controller = require("../controllers/entity.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// Public route — returns only _id, name, code for the login page dropdown
router.get("/public", controller.getEntitiesPublic);

router.use(authMiddleware);

router.get("/tree", controller.getEntityTree);
router.post("/", controller.createEntity);
router.get("/", controller.getEntities);
router.get("/:id", controller.getEntityById);
router.put("/:id", controller.updateEntity);
router.delete("/:id", controller.deactivateEntity);

module.exports = router;
