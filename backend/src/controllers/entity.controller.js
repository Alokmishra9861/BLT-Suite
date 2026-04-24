const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const Entity = require("../models/Entity");

const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");

const list = catchAsync(async (req, res) => {
  // If authorization header present and valid, return only user's entities
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.substring(7) : null;

  if (token) {
    try {
      const payload = jwt.verify(token, jwtConfig.secret);
      if (payload && payload.id) {
        const user = await require("../models/User").findById(payload.id).populate("entityIds").lean();
        if (user) {
          return res.json(new ApiResponse({ data: user.entityIds }));
        }
      }
    } catch (e) {
      // fallthrough to public list
    }
  }

  const entities = await Entity.find().sort({ name: 1 }).lean();
  res.json(new ApiResponse({ data: entities }));
});

const getById = catchAsync(async (req, res) => {
  const entity = await Entity.findById(req.params.id).lean();
  if (!entity) {
    throw new ApiError(404, "Entity not found");
  }
  res.json(new ApiResponse({ data: entity }));
});

const create = catchAsync(async (req, res) => {
  const bcrypt = require("bcryptjs");
  const Role = require("../models/Role");
  const User = require("../models/User");
  const { ROLES } = require("../config/constants");

  const entity = await Entity.create(req.body);

  // Auto-create admin user for new entity and return generated credentials
  try {
    const adminRole =
      (await Role.findOneAndUpdate(
        { name: ROLES.ADMIN },
        { name: ROLES.ADMIN, description: "Entity admin" },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )) || (await Role.findOne({ name: ROLES.ADMIN }));

    const rawPassword = "Admin123!";
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const adminEmail = `admin+${entity.code}@blt.com`;

    const adminUser = await User.findOneAndUpdate(
      { email: adminEmail },
      {
        name: `${entity.name} Admin`,
        email: adminEmail,
        password: hashedPassword,
        role: adminRole._id,
        entityIds: [entity._id],
        isActive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    // Ensure the creator (req.user) has this entityId in their list
    try {
      if (req.user && req.user.id) {
        await User.findByIdAndUpdate(req.user.id, {
          $addToSet: { entityIds: entity._id },
        });
      }
    } catch (e) {
      // non-fatal
      console.warn("Failed to add entity to creator user:", e.message || e);
    }

    return res.status(201).json(
      new ApiResponse({
        data: { entity, credentials: { email: adminEmail, password: rawPassword } },
        message: "Entity created",
      }),
    );
  } catch (err) {
    // If user creation fails, still return entity but log error
    console.warn("Failed to create admin user for entity:", err);
    return res.status(201).json(new ApiResponse({ data: { entity }, message: "Entity created" }));
  }
});

const update = catchAsync(async (req, res) => {
  const entity = await Entity.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).lean();

  if (!entity) {
    throw new ApiError(404, "Entity not found");
  }

  res.json(new ApiResponse({ data: entity, message: "Entity updated" }));
});

module.exports = {
  list,
  getById,
  create,
  update,
};
