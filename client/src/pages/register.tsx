import { Box, Button, Container } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import * as React from "react";
import { useMutation } from "urql";
import InputField from "../components/InputField";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface RegisterPageProps {}

const REGISTER_MUTATION = `
	mutation Register($email: String!, $username: String!, $password: String!) {
		register(options: {email: $email, username: $username, password: $password}) {
			user {
				id
				username
				email
			}
			errors {
				field
				message
			}
		}
	}
`;

const RegisterPage: React.FC<RegisterPageProps> = () => {
	const [, register] = useMutation(REGISTER_MUTATION);
	return (
		<Container mt={8}>
			<Formik
				initialValues={{ email: "", username: "", password: "" }}
				onSubmit={(values) => register(values)}
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
