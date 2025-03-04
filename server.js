import express from "express";
import "dotenv/config";
import cors from "cors";
import initKnex from "knex";
import configuration from "./knexfile.js";

const knex = initKnex(configuration);

const { PORT, DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

const app = express();
const router = express.Router();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

router.get("/api/warehouses", async (_req, res) => {
  try {
    const warehouses = await knex("warehouses").select(
      "id",
      "warehouse_name",
      "address",
      "city",
      "country",
      "contact_name",
      "contact_position",
      "contact_phone",
      "contact_email"
    );
    res.status(200).json(warehouses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error getting warehouses" });
  }
});

app.use(router);

app.get("/", (_req, res) =>
  res.send(`Welcome to the InStock API by Team Witty Willows!`)
);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
