require("dotenv").config();

const connectDB = require("../src/config/db");
const seedDemoData = require("../src/seeds/demoData.seed");

(async () => {
  try {
    await connectDB();
    await seedDemoData();
    console.log("Demo data seed completed");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
