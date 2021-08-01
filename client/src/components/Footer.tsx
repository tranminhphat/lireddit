import { Flex, FlexProps } from "@chakra-ui/react";
import React from "react";

export const Footer = (props: FlexProps): React.ReactElement => (
	<Flex as="footer" py="8rem" {...props} />
);
