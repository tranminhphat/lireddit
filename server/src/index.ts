import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import "dotenv-safe";
import express, { Application } from "express";
import session from "express-session";
import Redis from "ioredis";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import serverConfig from "./config/index";
import { AUTH_COOKIE, IN_PRODUCTION } from "./constants";
import { createUpdootLoader } from "./utils/createUpdootLoader";
import { createUserLoader } from "./utils/createUserLoader";

const main = async () => {
	const conn = await createConnection(serverConfig);
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
				domain: IN_PRODUCTION ? ".vercel.app" : undefined,
			},
			saveUninitialized: false,
			secret: (process.env.SESSION_SECRET as string) || "asdsadsadwqe1312",
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
