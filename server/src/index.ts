import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import "dotenv-safe";
import express, { Application } from "express";
import session from "express-session";
import Redis from "ioredis";
import path from "path";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { AUTH_COOKIE, IN_PRODUCTION } from "./constants";
import { Post } from "./entities/Post";
import { Updoot } from "./entities/Updoot";
import { User } from "./entities/User";
import { createUpdootLoader } from "./utils/createUpdootLoader";
import { createUserLoader } from "./utils/createUserLoader";

const main = async () => {
	const conn = await createConnection({
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
	});
	await conn.runMigrations();

	const app: Application = express();
	const RedisStore = connectRedis(session);
	const redisClient = new Redis(
		process.env.REDIS_URL ? process.env.REDIS_URL : undefined
	);

	app.use(
		cors({
			origin: IN_PRODUCTION
				? process.env.CORS_ORIGIN_PROD
				: process.env.CORS_ORIGIN_DEV,
			credentials: true,
		})
	);

	app.set("trust proxy", 1);

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
				sameSite: "none",
				secure: IN_PRODUCTION,
			},
			saveUninitialized: false,
			secret: process.env.SESSION_SECRET as string,
			resave: false,
		})
	);

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [__dirname + "/resolvers/*.js"],
			validate: false,
		}),
		context: ({ req, res }) => ({
			req,
			res,
			redis: redisClient,
			userLoader: createUserLoader(),
			updootLoader: createUpdootLoader(),
		}),
		plugins: [
			ApolloServerPluginLandingPageGraphQLPlayground(), // using the old playground
		],
	});
	await apolloServer.start();
	apolloServer.applyMiddleware({
		app,
		cors: false,
	});

	const PORT = process.env.PORT || 4000;
	app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
};

main();
