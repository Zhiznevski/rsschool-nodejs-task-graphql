import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { MemberType, memberTypeIdEnum } from './member-types/schemas.js';
import { PrismaClient } from '@prisma/client';
import { ChangePostInput, CreatePostInput, Post } from './posts/schemas.js';
import { UUIDType } from './types/uuid.js';
import { ChangeUserInput, CreateUserInput, User } from './users/schemas.js';
import { ChangeProfileInput, CreateProfileInput, Profile } from './profile/schemas.js';
import DataLoader from 'dataloader';
import {
  parseResolveInfo,
  ResolveTree,
  simplifyParsedResolveInfoFragmentWithType,
} from 'graphql-parse-resolve-info';

type DataLoaderType = InstanceType<typeof DataLoader>;

export type GraphQLContext = {
  prisma: PrismaClient;
  postsLoader: DataLoaderType;
  profileLoader: DataLoaderType;
  userSubscriptions: DataLoaderType;
  userSubscribers: DataLoaderType;
  memberTypesLoader: DataLoaderType;
};

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      memberTypes: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MemberType))),
        resolve: (_, __, context: GraphQLContext) => context.prisma.memberType.findMany(),
      },
      memberType: {
        type: MemberType,
        args: {
          id: { type: new GraphQLNonNull(memberTypeIdEnum) },
        },
        resolve: async (_, { id }: { id: string }, context: GraphQLContext) => {
          const memberType = await context.prisma.memberType.findUnique({
            where: {
              id: id,
            },
          });
          if (!memberType) {
            return null;
          }
          return memberType;
        },
      },
      users: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
        resolve: async (_, __, context, info) => {
          const parsedResolveInfoFragment = parseResolveInfo(info);
          const { fields } = simplifyParsedResolveInfoFragmentWithType(
            parsedResolveInfoFragment as ResolveTree,
            info.returnType,
          );
          const isIncludeUserSubscribedTo = 'userSubscribedTo' in fields;
          const isIncludeSubscribedToUser = 'subscribedToUser' in fields;

          const users = await context.prisma.user.findMany({
            include: {
              userSubscribedTo: isIncludeUserSubscribedTo,
              subscribedToUser: isIncludeSubscribedToUser,
            },
          });

          if (isIncludeUserSubscribedTo) {
            for (const user of users) {
              context.userSubscriptions.prime(user.id, []);
            }
          }
          if (isIncludeSubscribedToUser) {
            for (const user of users) {
              context.userSubscribers.prime(user.id, []);
            }
          }
          return users;
        },
      },
      user: {
        type: User as GraphQLObjectType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }: { id: string }, context: GraphQLContext) => {
          const user = await context.prisma.user.findUnique({
            where: {
              id: id,
            },
          });
          if (!user) {
            return null;
          }
          return user;
        },
      },
      posts: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))),
        resolve: (_, __, context: GraphQLContext) => context.prisma.post.findMany(),
      },
      post: {
        type: Post,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }: { id: string }, context: GraphQLContext) => {
          const post = await context.prisma.post.findUnique({
            where: {
              id: id,
            },
          });
          if (!post) {
            return null;
          }
          return post;
        },
      },
      profiles: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Profile))),
        resolve: (_, __, context: GraphQLContext) => context.prisma.profile.findMany(),
      },
      profile: {
        type: Profile,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }: { id: string }, context: GraphQLContext) => {
          const profile = await context.prisma.profile.findUnique({
            where: {
              id: id,
            },
          });
          if (!profile) {
            return null;
          }
          return profile;
        },
      },
    }),
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      createUser: {
        type: User as GraphQLObjectType,
        args: {
          dto: { type: new GraphQLNonNull(CreateUserInput) },
        },
        resolve: (
          _,
          { dto }: { dto: { name: string; balance: number } },
          context: GraphQLContext,
        ) =>
          context.prisma.user.create({
            data: dto,
          }),
      },
      changeUser: {
        type: User as GraphQLObjectType,
        args: {
          dto: { type: new GraphQLNonNull(ChangeUserInput) },
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: (
          _,
          { id, dto }: { id: string; dto: { name: string; balance: number } },
          context: GraphQLContext,
        ) =>
          context.prisma.user.update({
            where: {
              id: id,
            },
            data: dto,
          }),
      },
      deleteUser: {
        type: new GraphQLNonNull(GraphQLString),
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }: { id: string }, context: GraphQLContext) => {
          await context.prisma.user.delete({
            where: {
              id: id,
            },
          });
          return 'User is deleted';
        },
      },
      subscribeTo: {
        type: new GraphQLNonNull(GraphQLString),
        args: {
          userId: { type: new GraphQLNonNull(UUIDType) },
          authorId: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (
          _,
          { userId, authorId }: { userId: string; authorId: string },
          context,
        ) => {
          await context.prisma.subscribersOnAuthors.create({
            data: {
              subscriberId: userId,
              authorId: authorId,
            },
          });
          return 'You successfully subscribed';
        },
      },
      unsubscribeFrom: {
        type: new GraphQLNonNull(GraphQLString),
        args: {
          userId: { type: new GraphQLNonNull(UUIDType) },
          authorId: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (
          _,
          { userId, authorId }: { userId: string; authorId: string },
          context,
        ) => {
          await context.prisma.subscribersOnAuthors.delete({
            where: {
              subscriberId_authorId: {
                authorId: authorId,
                subscriberId: userId,
              },
            },
          });
          return 'You successfully unsubscribed';
        },
      },
      createPost: {
        type: Post,
        args: {
          dto: { type: new GraphQLNonNull(CreatePostInput) },
        },
        resolve: (
          _,
          { dto }: { dto: { title: string; content: string; authorId: string } },
          context: GraphQLContext,
        ) =>
          context.prisma.post.create({
            data: dto,
          }),
      },
      changePost: {
        type: Post,
        args: {
          dto: { type: new GraphQLNonNull(ChangePostInput) },
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: (
          _,
          { id, dto }: { id: string; dto: { title: string; content: string } },
          context: GraphQLContext,
        ) =>
          context.prisma.post.update({
            where: {
              id: id,
            },
            data: dto,
          }),
      },
      deletePost: {
        type: new GraphQLNonNull(GraphQLString),
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }: { id: string }, context: GraphQLContext) => {
          await context.prisma.post.delete({
            where: {
              id: id,
            },
          });
          return 'Post is deleted';
        },
      },
      createProfile: {
        type: Profile,
        args: {
          dto: { type: new GraphQLNonNull(CreateProfileInput) },
        },
        resolve: (
          _,
          {
            dto,
          }: {
            dto: {
              isMale: boolean;
              yearOfBirth: number;
              userId: string;
              memberTypeId: string;
            };
          },
          context: GraphQLContext,
        ) =>
          context.prisma.profile.create({
            data: dto,
          }),
      },
      changeProfile: {
        type: Profile,
        args: {
          dto: { type: new GraphQLNonNull(ChangeProfileInput) },
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: (
          _,
          {
            id,
            dto,
          }: {
            id: string;
            dto: { isMale: boolean; yearOfBirth: number; memberTypeId: string };
          },
          context: GraphQLContext,
        ) =>
          context.prisma.profile.update({
            where: {
              id: id,
            },
            data: dto,
          }),
      },
      deleteProfile: {
        type: new GraphQLNonNull(GraphQLString),
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }: { id: string }, context: GraphQLContext) => {
          await context.prisma.profile.delete({
            where: {
              id: id,
            },
          });
          return 'Profile is deleted';
        },
      },
    },
  }),
});
