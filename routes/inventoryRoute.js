import express from "express";
import { check, validationResult } from "express-validator"; // npm install express-validator
import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);

const router = express.Router();

// POST /api/inventories - Create a new inventory item
router.post(
  "/",
  [
    check("warehouse_id").isInt().withMessage("warehouse_id must be an integer"),
    check("item_name").notEmpty().withMessage("item_name is required"),
    check("description").notEmpty().withMessage("description is required"),
    check("category").notEmpty().withMessage("category is required"),
    check("status").notEmpty().withMessage("status is required"),
    check("quantity")
      .isInt({ min: 0 })
      .withMessage("quantity must be a number and greater than or equal to 0"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { warehouse_id, item_name, description, category, status, quantity } = req.body;
  
    try {
      const warehouse = await knex("warehouses").where({ id: warehouse_id }).first();
      if (!warehouse) {
        return res.status(400).json({
          message: `Warehouse with ID ${warehouse_id} does not exist.`,
        });
      }
  
      const [newInventory] = await knex("inventories").insert(
        {
          warehouse_id,
          item_name,
          description,
          category,
          status,
          quantity,
        },
        ["id", "warehouse_id", "item_name", "description", "category", "status", "quantity"]
      );
  
      return res.status(201).json(newInventory);
    } catch (error) {
      console.error("Error inserting inventory:", error);
      return res.status(500).json({ message: "Server error, please try again later." });
    }
  }
);

// GET /api/inventories - Retrieve all inventory items
router.get("/", async (req, res) => {
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
    console.error(err);
    res.status(500).json({ message: "Error getting inventories" });
  }
});

// GET /api/inventories/:id - Retrieve a specific inventory item by its ID
router.get("/:id", async (req, res) => {
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
    console.error(err);
    res.status(500).json({ message: "Error getting inventory item" });
  }
});

// DELETE /api/inventories/:id - Delete a specific inventory item
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }
  try {
    const deletedCount = await knex("inventories").where({ id }).del();
    if (deletedCount === 0) {
      return res.status(404).json({ message: `Inventory item with id ${id} not found.` });
    }
    return res.status(204).end();
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return res.status(500).json({ message: "Server error, please try again later." });
  }
});

export default router;
