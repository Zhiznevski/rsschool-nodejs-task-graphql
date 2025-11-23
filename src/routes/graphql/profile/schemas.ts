import {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLInputObjectType,
} from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { MemberType, memberTypeIdEnum } from '../member-types/schemas.js';
import { GraphQLContext } from '../rootSchema.js';
import { Profile as ProfileType } from '@prisma/client';

export const Profile = new GraphQLObjectType<ProfileType, GraphQLContext> ({
  name: 'Profile',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    isMale: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    yearOfBirth: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    memberType: {
      type: MemberType,
      resolve: (parent: ProfileType, _, context: GraphQLContext) =>
        context.memberTypesLoader.load(parent.memberTypeId),
    },
  }),
});

export const CreateProfileInput = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(memberTypeIdEnum) },
  },
});

export const ChangeProfileInput = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: {
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: memberTypeIdEnum },
  },
});
