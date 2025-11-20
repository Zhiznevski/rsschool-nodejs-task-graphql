import {
    GraphQLInputObjectType,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLString,
    GraphQLFloat,
    GraphQLList,
    GraphQLBoolean,
    GraphQLInt
} from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { Post } from '../posts/schemas.js';
import { MemberType } from '../member-types/schemas.js';

export const Profile = new GraphQLObjectType({
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
            type: new GraphQLNonNull(MemberType),
        },
    }),
});