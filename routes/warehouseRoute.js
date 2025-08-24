import express from "express";
import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const warehouses = await knex("warehouses");
    res.status(200).json(warehouses);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error getting warehouses" });
  }
});

router.get("/:id", async (req, res) => {
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
    res.status(500).json({ message: "Error in getting warehouse" });
  }
});

// Define the route to get inventories for a specific warehouse
router.get("/:id/inventories", async (req, res) => {
  const warehouseId = req.params.id;

  try {
    // Check if the warehouse exists in the database
    const warehouse = await knex("warehouses")
      .where({ id: warehouseId })
      .first();

    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    const inventories = await knex("inventories").where({
      warehouse_id: warehouseId,
    });

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
      return res
        .status(404)
        .json({ message: "No record found with the Id provided" });
    }

    await knex("warehouses").where("id", id).del();

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

//check valid email
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//check valid phone number
const phoneRegex = /^\+?(\d{1,3})?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;

const isValidEmail = (email) => emailRegex.test(email);
const isValidPhone = (phone) => phoneRegex.test(phone);

//POST a New Warehouse
router.post("/", async (req, res) => {
  const {
    warehouse_name,
    address,
    city,
    country,
    contact_name,
    contact_position,
    contact_phone,
    contact_email,
  } = req.body;
  try {
    //validate if empty data received.
    if (
      !warehouse_name?.trim() ||
      !address?.trim() ||
      !city?.trim() ||
      !country?.trim() ||
      !contact_name?.trim() ||
      !contact_position?.trim() ||
      !contact_phone?.trim() ||
      !contact_email?.trim()
    )
      return res.status(400).json({ error: "Missing required information" });

    
    if (!isValidEmail(contact_email))
      return res.status(400).json({ error: "Invalid email format" });
   
    if (!isValidPhone(contact_phone))
      return res.status(400).json({ error: "Invalid phone number format" });

    //insert into db
    const [warehouseId] = await knex("warehouses").insert(req.body);

    //query the added warehouse object using id.
    if (!warehouseId)
      return res.status(500).json({ error: "Failed to insert warehouse" });
    const warehouse = await knex("warehouses")
      .where({ id: warehouseId })
      .first();
    return res.status(201).json(warehouse);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

//PUT/EDIT an existing Warehouse --Vivian
router.put("/:warehouseId", async (req, res) => {
  const { warehouseId } = req.params;

  const {
    warehouse_name,
    address,
    city,
    country,
    contact_name,
    contact_position,
    contact_phone,
    contact_email,
  } = req.body;
  try {
    //verify if empty fields.
    if (
      !warehouse_name?.trim() ||
      !address?.trim() ||
      !city?.trim() ||
      !country?.trim() ||
      !contact_name?.trim() ||
      !contact_position?.trim() ||
      !contact_phone?.trim() ||
      !contact_email?.trim()
    )
      return res.status(400).json({ error: "Missing required information" });

    //validate email
    if (!isValidEmail(contact_email))
      return res.status(400).json({ error: "Invalid email format" });
    //validate phone
    if (!isValidPhone(contact_phone))
      return res.status(400).json({ error: "Invalid phone number format" });

    //update db with id
    const updatedRow = await knex("warehouses")
      .where({ id: warehouseId })
      .update(req.body);
    //query the revised warehouse object using id.
    if (!updatedRow)
      return res
        .status(404)
        .json({ error: "Warehouse id not found. Update failed" });
    const updatedWarehouse = await knex("warehouses")
      .where({ id: warehouseId })
      .first();
    return res.status(200).json(updatedWarehouse);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
