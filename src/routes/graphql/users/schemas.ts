import {
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
} from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { Post } from '../posts/schemas.js';
import { Profile } from '../profile/schemas.js';
import { GraphQLContext } from '../rootSchema.js';

export const User = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    balance: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    profile: {
      type: Profile,
      resolve: async (parent, _, context: GraphQLContext) => {
        const profile = await context.prisma.profile.findFirst({
          where: {
            userId: parent.id
          },

        });
        if (!profile) {
          return null;
        }
        return profile;
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))),
      resolve: async (parent, _, context: GraphQLContext) => context.prisma.post.findMany({
        where: {
          authorId: parent.id
        },
      })
    },
    userSubscribedTo: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
    },
    subscribedToUser: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
    },
  }),
});

export const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  },
});

export const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  },
});
