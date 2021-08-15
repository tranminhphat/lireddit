import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express, { Application } from "express";
import session from "express-session";
import Redis from "ioredis";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { AUTH_COOKIE, IN_PRODUCTION } from "./constants";

const main = async () => {
	await createConnection({
		type: "postgres",
		database: "lireddit",
		username: "postgres",
		password: "201199",
		logging: true,
		synchronize: true,
		entities: [__dirname + "/entities/*.js"],
	});

	const app: Application = express();
	const RedisStore = connectRedis(session);
	const redisClient = new Redis();

	app.use(
		cors({
			origin: "http://localhost:3000",
			credentials: true,
		})
	);

	app.use(
		session({
			name: AUTH_COOKIE,
			store: new RedisStore({
				client: redisClient,
				disableTouch: true,
			}),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
				httpOnly: true,
				sameSite: "lax", // csrf // research this
				secure: IN_PRODUCTION,
			},
			saveUninitialized: false,
			secret: "djaskldjasklfsdalgkhasdgklasd",
			resave: false,
		})
	);
	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [__dirname + "/resolvers/*.js"],
			validate: false,
		}),
		context: ({ req, res }) => ({ req, res, redis: redisClient }),
		plugins: [
			ApolloServerPluginLandingPageGraphQLPlayground(), // using the old playground
		],
	});

	await apolloServer.start();
	apolloServer.applyMiddleware({
		app,
		cors: false,
	});

	app.listen(4000, () => console.log("Server started on port 4000"));
};

main();
