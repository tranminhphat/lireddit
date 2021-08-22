import { Box, Button, Flex, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import * as React from "react";
import { IS_SERVER } from "../constants";
import { useCurrentUserQuery, useLogoutMutation } from "../generated/graphql";

const NavBar: React.FC = () => {
	const [{ fetching, data }] = useCurrentUserQuery({
		pause: IS_SERVER,
	});
	const router = useRouter();
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
						onClick={async () => {
							await logout();
							router.reload();
						}}
					>
						logout
					</Button>
				</Flex>
			);
		}
	};

	return (
		<Flex position="sticky" top={0} zIndex={1} bg="tan" p={4}>
			<Box ml="auto">
				<NavBarBody />
			</Box>
		</Flex>
	);
};

export default NavBar;
