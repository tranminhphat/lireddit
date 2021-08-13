import { Box, Button, Container } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import * as React from "react";
import InputField from "../components/InputField";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface RegisterPageProps {}

const RegisterPage: React.FC<RegisterPageProps> = () => {
	return (
		<Container mt={8}>
			<Formik
				initialValues={{ username: "", password: "" }}
				onSubmit={(values) => console.log("values = ", values)}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField
							name="username"
							placeholder="username"
							label="Username"
						/>
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
