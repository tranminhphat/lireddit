import express, { Application } from "express";
import { createConnection } from "typeorm";
import router from "./routes";

const main = async () => {
	const conn = await createConnection({
		type: "postgres",
		database: "lireddit",
		username: "postgres",
		password: "201199",
		logging: true,
		synchronize: true,
		entities: [__dirname + "/entities/*.js"],
	});

	const app: Application = express();
	app.listen(4000, () => console.log("Server started on port 4000"));
	app.use(router);
};

main();
