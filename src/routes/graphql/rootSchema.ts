import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLError,
  GraphQLNonNull,
} from 'graphql';
import { MemberType, memberTypeIdEnum } from './member-types/schemas.js';
import { PrismaClient } from '@prisma/client';
import { ChangePostInput, CreatePostInput, Post } from './posts/schemas.js';
import { UUIDType } from './types/uuid.js';
import { ChangeUserInput, CreateUserInput, User } from './users/schemas.js';
import { Profile } from './profile/schemas.js';

export type GraphQLContext = {
  prisma: PrismaClient;
};

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      memberTypes: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MemberType))),
        resolve: async (_, __, context: GraphQLContext) =>
          context.prisma.memberType.findMany(),
      },
      memberType: {
        type: new GraphQLNonNull(MemberType),
        args: {
          id: { type: new GraphQLNonNull(memberTypeIdEnum) },
        },
        resolve: async (_, { id }, context: GraphQLContext) => {
          const memberType = await context.prisma.memberType.findUnique({
            where: {
              id: id as string,
            },
          });
          if (memberType === null) {
            throw new GraphQLError('Member type is not found');
          }
          return memberType;
        },
      },
      users: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
        resolve: (_, __, context: GraphQLContext) => context.prisma.user.findMany(),
      },
      user: {
        type: new GraphQLNonNull(User),
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }, context: GraphQLContext) => {
          const user = await context.prisma.post.findUnique({
            where: {
              id: id as string,
            },
          });
          if (user === null) {
            throw new GraphQLError('User is not found');
          }
          return user;
        },
      },
      posts: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))),
        resolve: (_, __, context: GraphQLContext) => context.prisma.post.findMany(),
      },
      post: {
        type: new GraphQLNonNull(Post),
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }, context: GraphQLContext) => {
          const post = await context.prisma.post.findUnique({
            where: {
              id: id as string,
            },
          });
          if (post === null) {
            throw new GraphQLError('Post type is not found');
          }
          return post;
        },
      },
      profiles: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Profile))),
        resolve: (_, __, context: GraphQLContext) => context.prisma.profile.findMany(),
      },
      profile: {
        type: new GraphQLNonNull(Profile),
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }, context: GraphQLContext) => {
          const profile = await context.prisma.profile.findUnique({
            where: {
              id: id as string,
            },
          });
          if (profile === null) {
            throw new GraphQLError('User is not found');
          }
          return profile.id;
        },
      },
    }),
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      createUser: {
        type: User,
        args: {
          dto: { type: new GraphQLNonNull(CreateUserInput) },
        },
        resolve: (_, { dto }: { dto }, context: GraphQLContext) => {
          return context.prisma.user.create({
            data: dto,
          });
        },
      },
      changeUser: {
        type: User,
        args: {
          dto: { type: new GraphQLNonNull(ChangeUserInput) },
        },
        resolve: (_, { dto }: { dto }, context: GraphQLContext) => {
          return context.prisma.user.create({
            data: dto,
          });
        },
      },
      deleteUser: {
        type: User,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }: { id }, context: GraphQLContext) => {
          const user = await context.prisma.user.delete({
            where: {
              id: id,
            },
          });
          return user.name;
        },
      },
      createPost: {
        type: Post,
        args: {
          dto: { type: new GraphQLNonNull(CreatePostInput) },
        },
        resolve: (_, { dto }: { dto }, context: GraphQLContext) => {
          return context.prisma.post.create({
            data: dto,
          });
        },
      },
      changePost: {
        type: Post,
        args: {
          dto: { type: new GraphQLNonNull(ChangePostInput) },
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: (_, { id, dto }: { id; dto }, context: GraphQLContext) => {
          return context.prisma.post.update({
            where: {
              id: id,
            },
            data: dto,
          });
        },
      },
      deletePost: {
        type: Post,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }: { id }, context: GraphQLContext) => {
          const post = await context.prisma.post.delete({
            where: {
              id: id,
            },
          });
          return post.title;
        },
      },
    },
  }),
});
