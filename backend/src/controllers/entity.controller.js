const entityService = require("../services/entity.service");

const createEntity = async (req, res, next) => {
  try {
    const data = await entityService.createEntity(req.body, req.user?._id);

    res.status(201).json({
      success: true,
      message: "Entity created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getEntities = async (req, res, next) => {
  try {
    const data = await entityService.getEntities();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getEntityById = async (req, res, next) => {
  try {
    const data = await entityService.getEntityById(req.params.id);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const updateEntity = async (req, res, next) => {
  try {
    const data = await entityService.updateEntity(
      req.params.id,
      req.body,
      req.user?._id,
    );

    res.json({
      success: true,
      message: "Entity updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getEntityTree = async (req, res, next) => {
  try {
    const data = await entityService.getEntityTree();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const deactivateEntity = async (req, res, next) => {
  try {
    const data = await entityService.deactivateEntity(
      req.params.id,
      req.user?._id,
    );

    res.json({
      success: true,
      message: "Entity deactivated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getEntitiesPublic = async (req, res, next) => {
  try {
    const data = await entityService.getEntitiesPublic();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEntity,
  getEntities,
  getEntitiesPublic,
  getEntityById,
  updateEntity,
  getEntityTree,
  deactivateEntity,
};
