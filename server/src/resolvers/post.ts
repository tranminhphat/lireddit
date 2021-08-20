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
import { PostInput } from "../graphql-types";
import { isAuth } from "../middlewares/isAuth";
import { MyContext } from "../types";

@Resolver(Post)
export class PostResolver {
	@FieldResolver(() => String)
	textSnippet(@Root() root: Post): string {
		return root.text.slice(0, 50);
	}

	@Query(() => [Post])
	async posts(
		@Arg("limit", () => Int) limit: number,
		@Arg("cursor", () => String, { nullable: true }) cursor: string | null
	): Promise<Post[]> {
		const realLimit = Math.min(limit, 50);
		const qb = getConnection()
			.getRepository(Post)
			.createQueryBuilder("p")
			.orderBy('"createdAt"', "DESC")
			.take(realLimit);

		if (cursor) {
			qb.where('"createdAt" < :cursor', {
				cursor: new Date(parseInt(cursor)),
			});
		}

		return qb.getMany();
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
