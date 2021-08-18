import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import * as React from "react";
import InputField from "../components/InputField";
import Layout from "../components/Layout";
import { useCreatePostMutation } from "../generated/graphql";
import { useIsAuth } from "../hooks/useIsAuth";
import { createUrqlClient } from "../utils/createUrqlClient";

const CreatePost: React.FC = () => {
	useIsAuth();
	const router = useRouter();
	const [, createPost] = useCreatePostMutation();
	return (
		<Layout>
			<Formik
				initialValues={{ title: "", text: "" }}
				onSubmit={async (values, { setErrors }) => {
					if (!values.title) {
						setErrors({ title: "title can not be empty" });
						return;
					}

					if (!values.text) {
						setErrors({ text: "content can not be empty" });
						return;
					}

					const { error } = await createPost({ options: values });
					if (!error) {
						router.push("/");
					}
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField name="title" placeholder="title" label="Title" />
						<Box mt={4}>
							<InputField
								textarea
								name="text"
								placeholder="your content"
								label="Content"
							/>
						</Box>
						<Button
							mt={4}
							type="submit"
							isLoading={isSubmitting}
							colorScheme="teal"
						>
							create post
						</Button>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient)(CreatePost);
