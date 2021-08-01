import { Stack, StackProps } from "@chakra-ui/react";
import React from "react";

export const Main = (props: StackProps): React.ReactElement => (
	<Stack
		spacing="1.5rem"
		width="100%"
		maxWidth="48rem"
		mt="-45vh"
		pt="8rem"
		px="1rem"
		{...props}
	/>
);
