import bcrypt from "bcrypt";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { v4 } from "uuid";
import { AUTH_COOKIE, FORGOT_PASSWORD_PREFIX } from "../constants";
import { User } from "../entities/User";
import { LoginInput, RegisterInput, UserResponse } from "../graphql-types";
import { MyContext } from "../types";
import sendEmail from "../utils/sendEmail";
import { validateRegister } from "../utils/validateRegister";
@Resolver()
export class UserResolver {
	@Query(() => User, { nullable: true })
	currentUser(@Ctx() { req }: MyContext): Promise<User | undefined> | null {
		const { userId } = req.session;
		if (!userId) {
			return null; // no user is logged in;
		}

		return User.findOne(userId);
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg("options") options: RegisterInput,
		@Ctx() { req }: MyContext
	): Promise<UserResponse> {
		const { username, email, password } = options;
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);
		const errors = validateRegister(options);

		if (errors) {
			return { errors };
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

		const isValidPassword = await bcrypt.compare(user.password, password);
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

	@Mutation(() => Boolean)
	async forgotPassword(
		@Arg("email") email: string,
		@Ctx() { redis }: MyContext
	): Promise<boolean> {
		const user = await User.findOne({ email });
		if (!user) {
			// do nothing if user doesn't exist
			return true;
		}

		const token = v4();
		await redis.set(
			FORGOT_PASSWORD_PREFIX + token,
			user.id,
			"ex",
			1000 * 60 * 60 * 24 // 1days
		);

		await sendEmail(
			email,
			`<a href="http://localhost:3000/change-password/${token}">reset password</a>`
		);

		return true;
	}

	@Mutation(() => UserResponse)
	async changePassword(
		@Arg("token") token: string,
		@Arg("newPassword") newPassword: string,
		@Arg("confirmPassword") confirmPassword: string,
		@Ctx() { redis, req }: MyContext
	): Promise<UserResponse> {
		if (newPassword.length <= 3) {
			return {
				errors: [
					{
						field: "newPassword",
						message: "password must be greater than 3 characters",
					},
				],
			};
		}

		if (newPassword !== confirmPassword) {
			return {
				errors: [
					{
						field: "confirmPassword",
						message: "confirm password is mismatch",
					},
				],
			};
		}

		const userId = await redis.get(FORGOT_PASSWORD_PREFIX + token);
		if (!userId) {
			return {
				errors: [
					{
						field: "token",
						message: "change password session has been expired",
					},
				],
			};
		}

		const user = await User.findOne(parseInt(userId));
		if (!user) {
			return {
				errors: [
					{
						field: "token",
						message: "user no longer exist",
					},
				],
			};
		}
		const salt = await bcrypt.genSalt();
		user.password = await bcrypt.hash(newPassword, salt);
		await user.save();
		await redis.del(FORGOT_PASSWORD_PREFIX + token);
		//log in user after change password
		req.session.userId = user.id;

		return { user };
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
