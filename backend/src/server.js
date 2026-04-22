require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const seedDemoData = require("./seeds/demoData.seed");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedDemoData();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
