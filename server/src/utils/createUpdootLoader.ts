import DataLoader from "dataloader";
import { Updoot } from "../entities/Updoot";

type UpdootKey = {
	postId: number;
	userId: number;
};

export const createUpdootLoader = (): DataLoader<UpdootKey, Updoot | null> =>
	new DataLoader<UpdootKey, Updoot | null>(async (keys) => {
		const updoots = await Updoot.findByIds(keys as UpdootKey[]);
		const updootIdsToUpdoot: Record<string, Updoot> = {};
		updoots.forEach((updoot) => {
			updootIdsToUpdoot[`${updoot.postId}|${updoot.userId}`] = updoot;
		});

		return keys.map((key) => updootIdsToUpdoot[`${key.postId}|${key.userId}`]);
	});
