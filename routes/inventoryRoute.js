import express from "express";
import { check, validationResult } from "express-validator"; // npm install express-validator
import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);
const router = express.Router();

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
    console.log(err);
    res.status(500).json({ message: "Error getting inventories" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const inventoryItem = await knex("inventories")
      .join("warehouses", "warehouses.id", "inventories.warehouse_id")
      .select(
        "inventories.id",
        "inventories.warehouse_id",
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
// PUT /api/inventories/:id
router.put(
  "/:id",
  [
    check("warehouse_id")
      .isInt()
      .withMessage("Warehouse ID must be an integer"),
    check("item_name").notEmpty().withMessage("Item name is required"),
    check("description").notEmpty().withMessage("Description is required"),
    check("category").notEmpty().withMessage("Category is required"),
    check("status").notEmpty().withMessage("Status is required"),
    check("quantity").isInt().withMessage("Quantity must be an integer"),
  ],
  async (req, res) => {
    console.log(req.body);
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { warehouse_id, item_name, description, category, status, quantity } =
      req.body;
    try {
      // Check if the inventory item exists
      const inventory = await knex("inventories").where({ id }).first();
      if (!inventory) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      // Check if the warehouse exists
      const warehouse = await knex("warehouses")
        .where({ id: warehouse_id })
        .first();
      if (!warehouse) {
        return res.status(400).json({ message: "Warehouse ID does not exist" });
      }
      // Update the inventory item
      const updatedInventory = await knex("inventories").where({ id }).update({
        warehouse_id,
        item_name,
        description,
        category,
        status,
        quantity,
        updated_at: knex.fn.now(),
      });
      // Return the updated inventory item
      return res.status(200).json(updatedInventory[0]);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);
// POST /api/inventories
router.post(
  "/",
  [
    check("warehouse_id")
      .isInt()
      .withMessage("warehouse_id must be an integer"),
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
	
    const { warehouse_id, item_name, description, category, status, quantity } =
      req.body;
    console.log(req.body);
    try {
      const warehouse = await knex("warehouses")
        .where({ id: warehouse_id })
        .first();
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
        [
          "id",
          "warehouse_id",
          "item_name",
          "description",
          "category",
          "status",
          "quantity",
        ]
      );
      return res.status(201).json(newInventory);
    } catch (error) {
      console.error("Error inserting inventory:", error);
      return res
        .status(500)
        .json({ message: "Server error, please try again later." });
    }
  }
);

// DELETE /api/inventories/:id - To Delete a single inventory item
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Check if the inventory item exists
    const inventory = await knex("inventories").where({ id }).first();
    if (!inventory) {
      return res
        .status(404)
        .json({ message: `Inventory item with id ${id} not found.` });
    }
    // Delete the inventory item
    await knex("inventories").where({ id }).del();
    // Respond with a success message (204 No Content is typical for DELETE)
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting inventory:", error);
    return res
      .status(500)
      .json({ message: "Server error, please try again later." });
  }
});
export default router;
