import express from "express";
import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);

const router = express.Router();

// Define the route to get inventories for a specific warehouse
router.get("/:id/inventories", async (req, res) => {
  const warehouseId = req.params.id;

  try {
    // Check if the warehouse exists in the database
    const warehouse = await knex
      ("warehouses")
      .where({ id: warehouseId })
      .first();

    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    const inventories = await knex
     ("inventories")
      .where({ warehouse_id: warehouseId });

    if (inventories.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(inventories);
  } catch (error) {
    console.error("Error fetching inventories:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE route to delete warehouse and related inventory items
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const warehouse = await knex("warehouses").where("id", id).first();

    if (!warehouse) {
      return res.status(404).json({message: "No record found with the Id provided"});
    }

    await knex("warehouses").where("id", id).del();

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
