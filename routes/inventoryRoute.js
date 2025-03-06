import express from "express";
import { check, validationResult } from "express-validator"; //npm install express-validator
import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);

const router = express.Router();


// POST /api/inventories
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



export default router;