import dotenv from "dotenv";
import { createApp } from "./app";

dotenv.config();

const port = process.env.PORT || 8181;

const app = createApp();

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
