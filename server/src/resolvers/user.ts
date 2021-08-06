import argon2 from "argon2";
import { Arg, Field, InputType, Mutation, Resolver } from "type-graphql";
import { User } from "../entities/User";

@InputType()
class CredentialsInput {
	@Field()
	username: string;

	@Field()
	email: string;

	@Field()
	password: string;
}
@Resolver()
export class UserResolver {
	@Mutation(() => User)
	async register(@Arg("options") options: CredentialsInput): Promise<User> {
		const { username, email, password } = options;
		const hashedPassword = await argon2.hash(password);

		return User.create({ username, email, password: hashedPassword }).save();
	}
}
