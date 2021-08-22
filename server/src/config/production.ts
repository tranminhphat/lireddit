import path from "path";
import { ConnectionOptions } from "typeorm";

export default {
	type: "postgres",
	url: process.env.DATABASE_URL,
	logging: true,
	migrations: [path.join(__dirname, "./migrations/*")],
	entities: [__dirname + "/entities/*.js"],
	extra: {
		ssl: {
			rejectUnauthorized: false,
		},
	},
	ssl: true,
} as ConnectionOptions;
