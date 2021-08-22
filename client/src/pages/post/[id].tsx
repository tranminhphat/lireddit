import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import * as React from "react";
import Layout from "../../components/Layout";
import { usePostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";

const Post: React.FC = () => {
	const router = useRouter();
	const id =
		typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
	const [{ data }] = usePostQuery({
		pause: id === -1,
		variables: {
			id,
		},
	});
	return <Layout>{data?.post?.text}</Layout>;
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
