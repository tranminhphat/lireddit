import {
	Arg,
	Ctx,
	FieldResolver,
	Int,
	Mutation,
	Query,
	Resolver,
	Root,
	UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Post } from "../entities/Post";
import { PaginatedPosts, PostInput } from "../graphql-types";
import { isAuth } from "../middlewares/isAuth";
import { MyContext } from "../types";

@Resolver(Post)
export class PostResolver {
	@FieldResolver(() => String)
	textSnippet(@Root() root: Post): string {
		return root.text.slice(0, 50);
	}

	@Query(() => PaginatedPosts)
	async posts(
		@Arg("limit", () => Int) limit: number,
		@Arg("cursor", () => String, { nullable: true }) cursor: string | null
	): Promise<PaginatedPosts> {
		const realLimit = Math.min(limit, 50);
		const realLimitPlusOne = realLimit + 1;

		const qb = getConnection()
			.getRepository(Post)
			.createQueryBuilder("p")
			.innerJoinAndSelect("p.creator", "u")
			.orderBy("p.createdAt", "DESC")
			.take(realLimitPlusOne);

		if (cursor) {
			qb.where("p.createdAt < :cursor", {
				cursor: new Date(parseInt(cursor)),
			});
		}

		const posts = await qb.getMany();
		// if the response has one more data, it means that we has more data.
		return {
			data: posts.slice(0, realLimit),
			hasMore: posts.length === realLimitPlusOne,
		};
	}

	@Query(() => Post, { nullable: true })
	async post(@Arg("id") id: number): Promise<Post | undefined> {
		return Post.findOne(id);
	}

	@Mutation(() => Post)
	@UseMiddleware(isAuth)
	async createPost(
		@Arg("options") options: PostInput,
		@Ctx() { req }: MyContext
	): Promise<Post> {
		return Post.create({
			...options,
			creatorId: req.session.userId,
		}).save();
	}

	@Mutation(() => Post, { nullable: true })
	async updatePost(
		@Arg("id") id: number,
		@Arg("title") title: string
	): Promise<Post | null> {
		const post = await Post.findOne(id);
		if (!post) {
			return null;
		}

		if (typeof title !== undefined) {
			Post.update({ id }, { title });
		}

		return post;
	}

	@Mutation(() => Boolean)
	async deletePost(@Arg("id", () => Int) id: number): Promise<boolean> {
		await Post.delete(id);
		return true;
	}
}
