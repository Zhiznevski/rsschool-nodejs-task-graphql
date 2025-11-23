import {
  DocumentNode,
  GraphQLArgs,
  execute,
  parse,
  specifiedRules,
  validate,
} from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { schema } from './rootSchema.js';

const allValidationRules = [...specifiedRules, depthLimit(5)];

export function executeGraphQLRequest(args: GraphQLArgs) {
  let document: DocumentNode;
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
