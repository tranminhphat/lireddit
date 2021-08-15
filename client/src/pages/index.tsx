import { withUrqlClient } from "next-urql";
import React from "react";
import NavBar from "../components/NavBar";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = (): React.ReactElement => (
	<div>
		<NavBar />
		<div>Hello world</div>
	</div>
);

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
