import { Container } from "@chakra-ui/react";
import * as React from "react";
import NavBar from "./NavBar";

type ContainerSize = "xl" | "lg" | "md" | "sm" | "xs";

interface LayoutProps {
	children: React.ReactNode;
	size?: ContainerSize;
}

const Layout: React.FC<LayoutProps> = ({ children, size }: LayoutProps) => {
	return (
		<>
			<NavBar />
			<Container maxW={size ? `container.${size}` : "96"} mt={8}>
				{children}
			</Container>
		</>
	);
};

export default Layout;
