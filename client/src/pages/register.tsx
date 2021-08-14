import { Box, Button, Container } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import * as React from "react";
import InputField from "../components/InputField";
import { useRegisterMutation } from "../generated/graphql";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface RegisterPageProps {}

const RegisterPage: React.FC<RegisterPageProps> = () => {
	const [, register] = useRegisterMutation();
	return (
		<Container mt={8}>
			<Formik
				initialValues={{ email: "", username: "", password: "" }}
				onSubmit={async (values) => {
					const result = await register(values);
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
