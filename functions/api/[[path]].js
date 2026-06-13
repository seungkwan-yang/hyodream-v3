import worker from '../../src/worker.js';

export const onRequest = (context) => {
  return worker.fetch(context.request, context.env, context);
};
