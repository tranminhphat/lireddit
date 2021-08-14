import { Box, Button, Container } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useRouter } from "next/dist/client/router";
import * as React from "react";
import InputField from "../components/InputField";
import { useRegisterMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface RegisterPageProps {}

const RegisterPage: React.FC<RegisterPageProps> = () => {
	const [, register] = useRegisterMutation();
	const router = useRouter();
	return (
		<Container mt={8}>
			<Formik
				initialValues={{ email: "", username: "", password: "" }}
				onSubmit={async (values, { setErrors }) => {
					const response = await register({ options: values });
					const errors = response.data?.register.errors;
					const user = response.data?.register.user;

					if (errors) {
						setErrors(toErrorMap(errors));
					} else if (user) {
						router.push("/");
					}
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField
							name="email"
							placeholder="email"
							label="Email"
							type="email"
						/>
						<Box mt={4}>
							<InputField
								name="username"
								placeholder="username"
								label="Username"
							/>
						</Box>
						<Box mt={4}>
							<InputField
								name="password"
								placeholder="password"
								label="Password"
								type="password"
							/>
						</Box>
						<Button
							mt={4}
							type="submit"
							isLoading={isSubmitting}
							colorScheme="teal"
						>
							register
						</Button>
					</Form>
				)}
			</Formik>
		</Container>
	);
};

export default RegisterPage;
