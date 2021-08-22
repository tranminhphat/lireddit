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
import { Updoot } from "../entities/Updoot";
import { User } from "../entities/User";
import { PaginatedPosts, PostInput } from "../graphql-types";
import { isAuth } from "../middlewares/isAuth";
import { MyContext } from "../types";

@Resolver(Post)
export class PostResolver {
	@FieldResolver(() => String)
	textSnippet(@Root() root: Post): string {
		return root.text.slice(0, 50);
	}

	@FieldResolver(() => User)
	creator(
		@Root() post: Post,
		@Ctx() { userLoader }: MyContext
	): Promise<User | undefined> {
		return userLoader.load(post.creatorId);
	}

	@FieldResolver(() => Int, { nullable: true })
	async voteStatus(
		@Root() post: Post,
		@Ctx() { req, updootLoader }: MyContext
	): Promise<number | null> {
		if (!req.session.userId) {
			return null;
		}

		const updoot = await updootLoader.load({
			postId: post.id,
			userId: req.session.userId,
		});
		return updoot ? updoot.value : null;
	}

	@Query(() => PaginatedPosts)
	async posts(
		@Arg("limit", () => Int) limit: number,
		@Arg("cursor", () => String, { nullable: true }) cursor: string | null
	): Promise<PaginatedPosts> {
		// 20 -> 21
		const realLimit = Math.min(50, limit);
		const reaLimitPlusOne = realLimit + 1;

		const replacements: any[] = [reaLimitPlusOne];

		if (cursor) {
			replacements.push(new Date(parseInt(cursor)));
		}

		const posts = await getConnection().query(
			`
    select p.*
    from post p
    ${cursor ? `where p."createdAt" < $2` : ""}
    order by p."createdAt" DESC
    limit $1
    `,
			replacements
		);

		return {
			data: posts.slice(0, realLimit),
			hasMore: posts.length === reaLimitPlusOne,
		};
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async vote(
		@Arg("postId", () => Int) postId: number,
		@Arg("value", () => Int) value: number,
		@Ctx() { req }: MyContext
	): Promise<boolean> {
		const { userId } = req.session;
		const isUpdoot = value !== -1;
		const realValue = isUpdoot ? 1 : -1;
		const updoot = await Updoot.findOne({ where: { userId, postId } });
		if (updoot && updoot.value !== realValue) {
			await getConnection().transaction(async (tm) => {
				await tm.query(
					`
			update updoot
			set value = $1
			where "postId" = $2 and "userId" = $3
					`,
					[realValue, postId, userId]
				);

				await tm.query(
					`
          update post
          set points = points + $1
          where id = $2
        `,
					[2 * realValue, postId]
				);
			});
		} else if (!updoot) {
			await getConnection().transaction(async (tm) => {
				await tm.query(
					`
    insert into updoot ("userId", "postId", value)
    values ($1, $2, $3)
        `,
					[userId, postId, realValue]
				);

				await tm.query(
					`
    update post
    set points = points + $1
    where id = $2
      `,
					[realValue, postId]
				);
			});
		}

		return true;
	}

	@Query(() => Post, { nullable: true })
	async post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
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
	@UseMiddleware(isAuth)
	async deletePost(
		@Arg("id", () => Int) id: number,
		@Ctx() { req }: MyContext
	): Promise<boolean> {
		await Post.delete({ id, creatorId: req.session.userId });
		return true;
	}
}
