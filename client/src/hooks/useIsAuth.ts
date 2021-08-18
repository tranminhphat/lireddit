import { useRouter } from "next/router";
import { useEffect } from "react";
import { useCurrentUserQuery } from "../generated/graphql";

export const useIsAuth = (): void => {
	const [{ data, fetching }] = useCurrentUserQuery();
	const router = useRouter();

	useEffect(() => {
		if (!fetching && !data?.currentUser) {
			router.replace("/login");
		}
	}, [fetching, data, router]);
};
