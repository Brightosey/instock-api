import express from "express";
import "dotenv/config";
import cors from "cors";
import initKnex from "knex";
import configuration from "./knexfile.js";
import warehouseRoutes from "./routes/warehouseRoute.js";
import inventoryRoute from "./routes/inventoryRoute.js";

const knex = initKnex(configuration);

const { PORT, DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

const app = express();
const router = express.Router();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Mount the warehouse routes under "/api/warehouses"
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/inventories", inventoryRoute);

app.get("/api/warehouses", async (_req, res) => {
  try {
    const warehouses = await knex("warehouses");
    res.status(200).json(warehouses);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error getting warehouses" });
  }
});

app.get("/api/warehouses/:id", async (req, res) => {
  try {
    const warehouse = await knex("warehouses")
      .where({ id: req.params.id })
      .first();
    if (!warehouse) {
      return res
        .status(404)
        .json({ message: `Warehouse with id ${req.params.id} not found` });
    }
    res.status(200).json(warehouse);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error getting warehouse" });
  }
});

app.get("/api/inventories", async (req, res) => {
  try {
    const inventories = await knex("inventories")
      .join("warehouses", "warehouses.id", "inventories.warehouse_id")
      .select(
        "inventories.id",
        "warehouses.warehouse_name",
        "inventories.item_name",
        "inventories.description",
        "inventories.category",
        "inventories.status",
        "inventories.quantity"
      );
    res.status(200).json(inventories);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error getting inventories" });
  }
});

app.get("/api/inventories/:id", async (req, res) => {
  try {
    const inventoryItem = await knex("inventories")
      .join("warehouses", "warehouses.id", "inventories.warehouse_id")
      .select(
        "inventories.id",
        "warehouses.warehouse_name",
        "inventories.item_name",
        "inventories.description",
        "inventories.category",
        "inventories.status",
        "inventories.quantity"
      )
      .where({ "inventories.id": req.params.id })
      .first();
    if (!inventoryItem) {
      return res
        .status(404)
        .json({ message: `Inventory item with id ${req.params.id} not found` });
    }
    res.status(200).json(inventoryItem);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error getting inventory item" });
  }
});

app.get("/", (_req, res) =>
  res.send(`Welcome to the InStock API by Team Witty Willows!`)
);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
