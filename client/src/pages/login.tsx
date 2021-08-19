import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useRouter } from "next/router";
import * as React from "react";
import InputField from "../components/InputField";
import Layout from "../components/Layout";
import { useLoginMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { toErrorMap } from "../utils/toErrorMap";

const LoginPage: React.FC = () => {
	const [, login] = useLoginMutation();
	const router = useRouter();
	return (
		<Layout>
			<Formik
				initialValues={{ username: "", password: "" }}
				onSubmit={async (values, { setErrors }) => {
					const response = await login({ options: values });
					const errors = response.data?.login.errors;
					const user = response.data?.login.user;

					if (errors) {
						setErrors(toErrorMap(errors));
					} else if (user) {
						router.push(
							router.query.next ? (router.query.next as string) : "/"
						);
					}
				}}
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
						<Flex mt={4}>
							<Box ml="auto">
								<NextLink href="/forgot-password">
									<Link>forgot your password?</Link>
								</NextLink>
							</Box>
						</Flex>
						<Button
							mt={4}
							type="submit"
							isLoading={isSubmitting}
							colorScheme="teal"
						>
							login
						</Button>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient)(LoginPage);
