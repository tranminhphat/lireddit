import { Box, Button, Container, Link, Text } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import router from "next/dist/client/router";
import NextLink from "next/link";
import * as React from "react";
import { useState } from "react";
import InputField from "../../components/InputField";
import { useChangePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { toErrorMap } from "../../utils/toErrorMap";

interface ChangePasswordPageProps {
	token: string;
}

const ChangePasswordPage: NextPage<ChangePasswordPageProps> = ({
	token,
}: ChangePasswordPageProps) => {
	const [, changePassword] = useChangePasswordMutation();
	const [tokenError, setTokenError] = useState("");

	return (
		<Container mt={8}>
			<Formik
				initialValues={{ newPassword: "", confirmPassword: "" }}
				onSubmit={async ({ newPassword, confirmPassword }, { setErrors }) => {
					const response = await changePassword({
						token,
						newPassword,
						confirmPassword,
					});
					const errors = response.data?.changePassword.errors;
					const user = response.data?.changePassword.user;

					if (errors) {
						const errorMap = toErrorMap(errors);
						if ("token" in errorMap) {
							setTokenError(errorMap.token);
						}
						setErrors(toErrorMap(errors));
					} else if (user) {
						router.push("/");
					}
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField
							name="newPassword"
							placeholder="new password"
							label="New password"
							type="password"
						/>
						<Box mt={4}>
							<InputField
								name="confirmPassword"
								placeholder="confirm password"
								label="Confirm password"
								type="password"
							/>
						</Box>
						{!tokenError ? null : (
							<Box mt={4}>
								<Text color="red">{tokenError}</Text>
								<NextLink href="/forgot-password">
									<Link>Click here to get a new one</Link>
								</NextLink>
							</Box>
						)}
						<Button
							mt={4}
							type="submit"
							isLoading={isSubmitting}
							colorScheme="teal"
						>
							change password
						</Button>
					</Form>
				)}
			</Formik>
		</Container>
	);
};

ChangePasswordPage.getInitialProps = ({ query }) => {
	return {
		token: query.token as string,
	};
};

export default withUrqlClient(createUrqlClient)(ChangePasswordPage);
