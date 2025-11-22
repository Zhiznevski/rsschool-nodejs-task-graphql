import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLError,
  GraphQLNonNull,
  GraphQLScalarType,
  GraphQLBoolean,
  GraphQLString,
} from 'graphql';
import { MemberType, memberTypeIdEnum } from './member-types/schemas.js';
import { PrismaClient } from '@prisma/client';
import { ChangePostInput, CreatePostInput, Post } from './posts/schemas.js';
import { UUIDType } from './types/uuid.js';
import { ChangeUserInput, CreateUserInput, User } from './users/schemas.js';
import { ChangeProfileInput, CreateProfileInput, Profile } from './profile/schemas.js';

export type GraphQLContext = {
  prisma: PrismaClient;
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
        resolve: async (_, { id }, context: GraphQLContext) => {
          const memberType = await context.prisma.memberType.findUnique({
            where: {
              id: id as string,
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
        resolve: (_, __, context: GraphQLContext) => context.prisma.user.findMany(),
      },
      user: {
        type: User,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }, context: GraphQLContext) => {
          const user = await context.prisma.user.findUnique({
            where: {
              id: id as string,
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
        resolve: async (_, { id }, context: GraphQLContext) => {
          const post = await context.prisma.post.findUnique({
            where: {
              id: id as string,
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
        resolve: async (_, { id }, context: GraphQLContext) => {
          const profile = await context.prisma.profile.findUnique({
            where: {
              id: id as string,
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
        type: User,
        args: {
          dto: { type: new GraphQLNonNull(CreateUserInput) },
        },
        resolve: (_, { dto }: { dto }, context: GraphQLContext) =>
          context.prisma.user.create({
            data: dto,
          }),
      },
      changeUser: {
        type: User,
        args: {
          dto: { type: new GraphQLNonNull(ChangeUserInput) },
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: (_, { id, dto }: { id, dto }, context: GraphQLContext) =>
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
        resolve: async (_, { id }: { id }, context: GraphQLContext) => {
          await context.prisma.user.delete({
            where: {
              id: id,
            },
          });
          return "User is deleted";
        },
      },
      createPost: {
        type: Post,
        args: {
          dto: { type: new GraphQLNonNull(CreatePostInput) },
        },
        resolve: (_, { dto }: { dto }, context: GraphQLContext) =>
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
        resolve: (_, { id, dto }: { id; dto }, context: GraphQLContext) =>
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
        resolve: async (_, { id }: { id }, context: GraphQLContext) => {
          await context.prisma.post.delete({
            where: {
              id: id,
            },
          });
          return "Post is deleted";
        },
      },
      createProfile: {
        type: Profile,
        args: {
          dto: { type: new GraphQLNonNull(CreateProfileInput) },
        },
        resolve: (_, { dto }: { dto }, context: GraphQLContext) =>
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
        resolve: (_, { id, dto }: { id; dto }, context: GraphQLContext) =>
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
        resolve: async (_, { id }: { id }, context: GraphQLContext) => {
          await context.prisma.profile.delete({
            where: {
              id: id,
            },
          });
          return "Profile is deleted"
        },
      },
    },
  }),
});
