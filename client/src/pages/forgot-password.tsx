import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import * as React from "react";
import InputField from "../components/InputField";
import Layout from "../components/Layout";
import { useForgotPasswordMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const ForgotPasswordPage: React.FC = () => {
	const [{ data }, forgotPassword] = useForgotPasswordMutation();

	return (
		<Layout>
			<Formik
				initialValues={{ email: "" }}
				onSubmit={async (values) => {
					await forgotPassword({ email: values.email });
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
						{!data?.forgotPassword ? null : (
							<Box mt={4}>✓ an email sent to your email to change password</Box>
						)}
						<Button
							mt={4}
							type="submit"
							isLoading={isSubmitting}
							colorScheme="teal"
						>
							forgot password
						</Button>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient)(ForgotPasswordPage);
