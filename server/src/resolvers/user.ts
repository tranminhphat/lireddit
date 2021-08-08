import argon2 from "argon2";
import { Arg, Int, Mutation, Query, Resolver } from "type-graphql";
import { User } from "../entities/User";
import { LoginInput, RegisterInput, UserResponse } from "../types/graphql";

@Resolver()
export class UserResolver {
	@Mutation(() => UserResponse)
	async register(
		@Arg("options") options: RegisterInput
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
		return { user };
	}

	@Mutation(() => UserResponse)
	async login(@Arg("options") options: LoginInput): Promise<UserResponse> {
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
