import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";
@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
	@Field(() => Int)
	@Column({ type: "int" })
	value!: number;

	@Field()
	@PrimaryColumn()
	userId!: number;

	@ManyToOne(() => User, (user) => user.updoots)
	user: User;

	@Field()
	@PrimaryColumn()
	postId!: number;

	@ManyToOne(() => Post, (post) => post.updoots, { onDelete: "CASCADE" })
	post: Post;
}
