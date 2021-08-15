import { withUrqlClient } from "next-urql";
import React from "react";
import NavBar from "../components/NavBar";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = (): React.ReactElement => {
	const [{ data }] = usePostsQuery();

	return (
		<div>
			<NavBar />
			<div>Hello world</div>
			{!data ? (
				<div>...loading</div>
			) : (
				data.posts.map((p) => <div key={p.id}>{p.title}</div>)
			)}
		</div>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
