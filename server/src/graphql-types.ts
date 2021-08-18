import { Field, InputType, ObjectType } from "type-graphql";
import { User } from "./entities/User";

// Input types
@InputType()
export class RegisterInput {
	@Field()
	username: string;
	@Field()
	email: string;
	@Field()
	password: string;
}
@InputType()
export class LoginInput {
	@Field()
	username: string;
	@Field()
	password: string;
}

@InputType()
export class PostInput {
	@Field()
	title: string;
	@Field()
	text: string;
}

// Object types
@ObjectType()
export class FieldError {
	@Field()
	field: string;
	@Field()
	message: string;
}

@ObjectType()
export class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];
	@Field(() => User, { nullable: true })
	user?: User;
}
