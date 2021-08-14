import { Box, Button, Flex, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import * as React from "react";
import { useCurrentUserQuery, useLogoutMutation } from "../generated/graphql";

const NavBar: React.FC = () => {
	const [{ fetching, data }] = useCurrentUserQuery();
	const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

	const NavBarBody = () => {
		if (fetching) {
			// data is fetching
			return null;
		} else if (!data?.currentUser) {
			// no user
			return (
				<>
					<NextLink href="/login">
						<Link mr={2}>login</Link>
					</NextLink>
					<NextLink href="/register">
						<Link mr={2}>register</Link>
					</NextLink>
				</>
			);
		} else {
			// user is logged in
			return (
				<Flex>
					<Box mr={2}>{data.currentUser.username}</Box>
					<Button
						variant="link"
						isLoading={logoutFetching}
						onClick={() => logout()}
					>
						logout
					</Button>
				</Flex>
			);
		}
	};

	return (
		<Flex bg="tan" p={4}>
			<Box ml="auto">
				<NavBarBody />
			</Box>
		</Flex>
	);
};

export default NavBar;
