import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLError,
  GraphQLNonNull,
} from 'graphql';
import { MemberType, memberTypeIdEnum } from './member-types/schemas.js';
import { PrismaClient } from '@prisma/client';
import { CreatePostInput, Post } from './posts/schemas.js';
import { UUIDType } from './types/uuid.js';

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
    }),
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
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
    },
  }),
});
