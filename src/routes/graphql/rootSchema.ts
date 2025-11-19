import { GraphQLSchema, GraphQLObjectType, GraphQLList, GraphQLError } from 'graphql';
import { MemberType, memberTypeIdEnum } from './member-types/schemas.js';
import { PrismaClient } from '@prisma/client';

export type GraphQLContext = {
  prisma: PrismaClient
};


export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      memberTypes: {
        type: new GraphQLList(MemberType),
        resolve: (_, __, context: GraphQLContext) => context.prisma.memberType.findMany()
      },
      memberType: {
        type: MemberType,
        args: {
          id: { type: memberTypeIdEnum },
        },
        resolve: async (_, { id }, context: GraphQLContext) => {
          const memberType = await context.prisma.memberType.findUnique({
            where: {
              id: id as string
            }
          });
          if (memberType === null) {
            throw new GraphQLError("Member type is not found")
          }
          return memberType;
        },
      },
    }),
  }),
});
