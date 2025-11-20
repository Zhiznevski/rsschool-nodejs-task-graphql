import {
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { UUIDType } from '../types/uuid.js';

export const Post = new GraphQLObjectType({
  name: 'Post',
  description: 'The post contains id, discount and postsLimitPerMonth',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(UUIDType),
      description: 'The id of the post',
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The discount of member type',
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The post content',
    },
  }),
});

export const CreatePostInput = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  },
});

export const ChangePostInput = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: {
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: GraphQLString },
  },
});
