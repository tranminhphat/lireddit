import { ApolloServer } from "apollo-server-express";
import express, { Application } from "express";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";

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

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [__dirname + "/resolvers/*.js"],
			validate: false,
		}),
	});

	await apolloServer.start();
	apolloServer.applyMiddleware({ app });

	app.listen(4000, () => console.log("Server started on port 4000"));
};

main();
