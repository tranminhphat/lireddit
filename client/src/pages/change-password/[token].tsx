import { Box, Button, Link, Text } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useRouter } from "next/router";
import * as React from "react";
import { useState } from "react";
import InputField from "../../components/InputField";
import Layout from "../../components/Layout";
import { useChangePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { toErrorMap } from "../../utils/toErrorMap";

const ChangePasswordPage: NextPage = () => {
	const [, changePassword] = useChangePasswordMutation();
	const [tokenError, setTokenError] = useState("");
	const router = useRouter();

	return (
		<Layout>
			<Formik
				initialValues={{ newPassword: "", confirmPassword: "" }}
				onSubmit={async ({ newPassword, confirmPassword }, { setErrors }) => {
					const response = await changePassword({
						newPassword,
						confirmPassword,
						token: router.query.token as string,
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
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient)(ChangePasswordPage);
