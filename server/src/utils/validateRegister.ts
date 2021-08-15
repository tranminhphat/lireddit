import { FieldError, RegisterInput } from "src/graphql-types";

export const validateRegister = (
	options: RegisterInput
): FieldError[] | null => {
	if (!options.email.includes("@")) {
		return [
			{
				field: "email",
				message: "invalid email",
			},
		];
	}

	if (options.username.length <= 3) {
		return [
			{
				field: "username",
				message: "username must be greater than 3 characters",
			},
		];
	}

	if (options.password.length <= 3) {
		return [
			{
				field: "password",
				message: "password must be greater than 3 characters",
			},
		];
	}

	return null;
};
