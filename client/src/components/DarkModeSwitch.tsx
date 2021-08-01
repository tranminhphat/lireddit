import { Switch, useColorMode } from "@chakra-ui/react";
import React from "react";

export const DarkModeSwitch = (): React.ReactElement => {
	const { colorMode, toggleColorMode } = useColorMode();
	const isDark = colorMode === "dark";
	return (
		<Switch
			position="fixed"
			top="1rem"
			right="1rem"
			color="green"
			isChecked={isDark}
			onChange={toggleColorMode}
		/>
	);
};
