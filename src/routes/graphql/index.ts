import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import {
  GraphQLArgs,
  execute,
  parse,
  specifiedRules,
  validate,
} from 'graphql';
import { schema } from './rootSchema.js';
import depthLimit from 'graphql-depth-limit';
import DataLoader from 'dataloader';
import { PrismaClient } from '@prisma/client';

const allValidationRules = [...specifiedRules, depthLimit(5)];

export function executeGraphQLRequest(args: GraphQLArgs) {
  let document;
  try {
    document = parse(args.source);
  } catch (syntaxError) {
    return {
      errors: [syntaxError],
    };
  }

  const errors = validate(schema, document, allValidationRules);

  if (errors.length > 0) {
    return { errors };
  }

  return execute({ document, ...args });
}

function createContext(prisma: PrismaClient) {
  return {
    prisma,
    postsLoader: new DataLoader(async (userIds) => {
      const posts = await prisma.post.findMany({
        where: {
          authorId: {
            in: userIds as string[],
          }
        }
      })
      return userIds.map(id => posts.filter(post => post.authorId === id));
    }),
  };
}

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables } = req.body;

      const res = await executeGraphQLRequest({
        schema: schema,
        source: query,
        contextValue: createContext(prisma),
        variableValues: variables,
      });

      return res;
    },
  });
};

export default plugin;
