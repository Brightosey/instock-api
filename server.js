import express from "express";
import "dotenv/config";
import cors from "cors";
import initKnex from "knex";
import configuration from "./knexfile.js";
import warehouseRoutes from "./routes/warehouseRoute.js";

const knex = initKnex(configuration);

const { PORT, DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

const app = express();
const router = express.Router();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Mount the warehouse routes under "/api/warehouses"
app.use("/api/warehouses", warehouseRoutes);

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

app.get("/", (_req, res) =>
	res.send(`Welcome to the InStock API by Team Witty Willows!`)
);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
