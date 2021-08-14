import { Box, Flex, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import * as React from "react";

const NavBar: React.FC = () => {
	return (
		<Flex bg="tomato" p={4}>
			<Box ml="auto">
				<NextLink href="/login">
					<Link mr={2}>login</Link>
				</NextLink>
				<NextLink href="/register">
					<Link mr={2}>register</Link>
				</NextLink>
			</Box>
		</Flex>
	);
};

export default NavBar;
