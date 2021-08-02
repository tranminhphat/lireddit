import { createConnection } from "typeorm";
import { Post } from "./entities/Post";

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

	await Post.create({ title: "my first post" }).save();
	const post = await Post.find();
	console.log(post);
};

main();
