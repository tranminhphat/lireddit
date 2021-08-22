import path from "path";
import { ConnectionOptions } from "typeorm";
import { Post } from "../entities/Post";
import { Updoot } from "../entities/Updoot";
import { User } from "../entities/User";

export default {
	type: "postgres",
	url: process.env.DATABASE_URL,
	logging: true,
	migrations: [path.join(__dirname, "./migrations/*")],
	entities: [Post, User, Updoot],
	extra: {
		ssl: {
			rejectUnauthorized: false,
		},
	},
	ssl: true,
} as ConnectionOptions;
