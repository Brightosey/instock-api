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
			const updatedInventory = await knex("inventories")
				.where({ id })
				.update({
					warehouse_id,
					item_name,
					description,
					category,
					status,
					quantity,
					updated_at: knex.fn.now(),
				})
				.returning("*");

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
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { warehouse_id, item_name, description, category, status, quantity } =
			req.body;

		try {
			const warehouse = await db("warehouses")
				.where({ id: warehouse_id })
				.first();
			if (!warehouse) {
				return res.status(400).json({
					message: `Warehouse with ID ${warehouse_id} does not exist.`,
				});
			}

			const [newInventory] = await db("inventories").insert(
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

// PUT /api/inventories/:id - Edit a single inventory item
router.put(
  "/:id",
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
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Convert and validate the inventory id from URL
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format." });
    }
    
    // Check if the inventory item exists
    const inventory = await knex("inventories").where({ id }).first();
    if (!inventory) {
      return res.status(404).json({ message: `Inventory item with id ${id} not found.` });
    }
    
    const { warehouse_id, item_name, description, category, status, quantity } = req.body;
    
    // Check if the provided warehouse exists
    const warehouse = await knex("warehouses").where({ id: warehouse_id }).first();
    if (!warehouse) {
      return res.status(400).json({ message: `Warehouse with ID ${warehouse_id} does not exist.` });
    }
    
    try {
      // Update the inventory record
      await knex("inventories")
        .where({ id })
        .update({
          warehouse_id,
          item_name,
          description,
          category,
          status,
          quantity,
        });
      
      // Retrieve the updated record
      const updatedInventory = await knex("inventories").where({ id }).first();
      
      return res.status(200).json(updatedInventory);
    } catch (error) {
      console.error("Error updating inventory:", error);
      return res.status(500).json({ message: "Server error, please try again later." });
    }
  }
);



export default router;
