import argon2 from "argon2";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { AUTH_COOKIE } from "../constants";
import { User } from "../entities/User";
import { LoginInput, RegisterInput, UserResponse } from "../graphql-types";
import { MyContext } from "../types";
@Resolver()
export class UserResolver {
	@Query(() => User, { nullable: true })
	currentUser(@Ctx() { req }: MyContext): Promise<User | undefined> | null {
		const { userId } = req.session;
		if (!userId) {
			return null; // no user is logged in;
		}

		const user = User.findOne(userId);
		return user;
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg("options") options: RegisterInput,
		@Ctx() { req }: MyContext
	): Promise<UserResponse> {
		const { username, email, password } = options;
		const hashedPassword = await argon2.hash(password);

		if (username.length <= 3) {
			return {
				errors: [
					{
						field: "username",
						message: "username must be greater than 3 characters",
					},
				],
			};
		}

		if (password.length <= 3) {
			return {
				errors: [
					{
						field: "password",
						message: "password must be greater than 3 characters",
					},
				],
			};
		}
		const user = User.create({
			username,
			email,
			password: hashedPassword,
		});

		try {
			await user.save();
		} catch (err) {
			if (err.code === "23505" && err.detail.includes("username")) {
				return {
					errors: [
						{
							field: "username",
							message: "username already exist",
						},
					],
				};
			}
			if (err.code === "23505" && err.detail.includes("email")) {
				return {
					errors: [
						{
							field: "email",
							message: "email already exist",
						},
					],
				};
			}
		}
		// store user into session
		req.session.userId = user.id;

		return { user };
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg("options") options: LoginInput,
		@Ctx() { req }: MyContext
	): Promise<UserResponse> {
		const { username, password } = options;
		const user = await User.findOne({ username });

		if (!user) {
			return {
				errors: [
					{
						field: "username",
						message: "incorrect username or password",
					},
				],
			};
		}

		const isValidPassword = await argon2.verify(user.password, password);
		if (!isValidPassword) {
			return {
				errors: [
					{
						field: "password",
						message: "incorrect username or password",
					},
				],
			};
		}
		// store user into session
		req.session.userId = user.id;

		return { user };
	}

	@Mutation(() => Boolean)
	async logout(@Ctx() { req, res }: MyContext): Promise<boolean> {
		return new Promise((resolve) => {
			res.clearCookie(AUTH_COOKIE);
			req.session.destroy((err) => {
				console.error(err);
				resolve(false);
				return;
			});

			resolve(true);
		});
	}

	@Query(() => [User])
	async users(): Promise<User[]> {
		return User.find();
	}

	@Query(() => User, { nullable: true })
	async user(@Arg("id") id: number): Promise<User | undefined> {
		return User.findOne(id);
	}

	@Mutation(() => Boolean)
	async deleteUser(@Arg("id", () => Int) id: number): Promise<boolean> {
		await User.delete({ id });
		return true;
	}
}
