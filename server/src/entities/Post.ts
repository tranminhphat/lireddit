import { Field, Int, ObjectType } from "type-graphql";
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
@ObjectType()
@Entity()
export class Post extends BaseEntity {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id: number;

	@Field()
	@Column("text")
	title!: string;

	@Field()
	@Column("text")
	text!: string;

	@Field()
	@Column({ type: "int", default: 0 })
	points!: number;

	@Field()
	@Column()
	creatorId!: number;

	@Field()
	@ManyToOne(() => User, (user) => user.posts)
	creator: User;

	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date;

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date;
}
