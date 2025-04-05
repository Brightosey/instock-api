import express from "express";
import "dotenv/config";
import cors from "cors";
import initKnex from "knex";
import configuration from "./knexfile.js";
import warehouseRoutes from "./routes/warehouseRoute.js";
import inventoryRoutes from "./routes/inventoryRoute.js";

const knex = initKnex(configuration);

const { PORT, DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

const app = express();
const router = express.Router();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Mount the warehouse routes under "/api/warehouses"
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/inventories", inventoryRoutes);

app.get("/", (_req, res) =>
  res.send(`Welcome to the InStock API by Team Witty Willows!`)
);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
