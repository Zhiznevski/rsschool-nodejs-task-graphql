import {
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';

export const memberTypeIdEnum = new GraphQLEnumType({
  name: 'MemberTypeId',
  description: 'One of the member type',
  values: {
    BASIC: {
      value: 'BASIC',
      description: 'Basic member type',
    },
    BUSINESS: {
      value: 'BUSINESS',
      description: 'Business member type',
    },
  },
});

export const MemberType = new GraphQLObjectType({
  name: 'memberType',
  description: 'A member type options (BASIC | BUSINESS)',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(memberTypeIdEnum),
      description: 'The id of the member type',
    },
    discount: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The discount of member type',
    },
    postsLimitPerMonth: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The post limit per month of member type',
    },
  }),
});
