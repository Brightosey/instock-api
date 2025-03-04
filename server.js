import express from "express";
import "dotenv/config";

const app = express();
const router = express.Router();
const { PORT, DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

app.get("/", (_req, res) =>
	res.send(`Welcome to inStock api by team Witty Willows!`)
);

app.listen(PORT, () => console.log(`app running on port ${PORT}`));
