import { handle } from 'hono/aws-lambda';
import { z } from 'zod';
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';

export const app = new OpenAPIHono();

const ParamsSchema = z.object({
  id: z
    // パスパラメータ&数値型で受け取りたいならZodライブラリの型強制（coercion）機能を使う
    .coerce
    .number()
    .min(3)
    .openapi({
      param: {
        name: 'id',
        in: 'path',
      },
      example: 1212121,
    }),
});

const UserSchema = z
  .object({
    id: z.number().openapi({
      example: 123,
    }),
  })
  .openapi('User');

const Body = z
  .object({
    name: z.string().openapi({
      example: 'John Doe',
    }),
    age: z.number().openapi({
      example: 42,
    }),
  })
  .openapi('Body');

app.openapi(
  createRoute({
    method: 'get',
    path: '/users/{id}',
    security: [{ apiKey: [] }],
    request: {
      params: ParamsSchema,
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: UserSchema,
          },
        },
        description: 'Retrieve the user',
      },
    },
  }),
  async (c) => {
    await new Promise(res => setTimeout(() => res(void 0), 1000));
    const { id } = c.req.valid('param')
    return c.json({
      id,
      age: 20,
      name: 'Ultra-man',
    })
  });


app.openapi(
  createRoute({
    method: 'patch',
    path: '/users/{id}',
    security: [{ apiKey: [] }],
    request: {
      params: ParamsSchema,
      body: {
        content: {
          'application/json': {
            schema: Body,
          },
        },
      }
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: UserSchema,
          },
        },
        description: 'Retrieve the user',
      },
    },
  }),
  async (c) => {
    await new Promise(res => setTimeout(() => res(void 0), 1000));
    const { name: _name, age: _age } = c.req.valid('json');
    // 又は const { name } = await c.req.parseBody();
    const { id: _id } = c.req.valid('param');

    return c.json({
      id: 1,
      age: 20,
      name: 'Ultra-man',
    })
  });

app.openAPIRegistry.registerComponent('securitySchemes', 'apiKey', {
  scheme: 'apiKey',
  type: 'apiKey',
  in: 'header',
  name: 'X-API-Key',
});

// The OpenAPI documentation will be available at /doc
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'My API',
  },
});

// SEE: https://github.com/honojs/middleware/tree/main/packages/swagger-ui#with-openapihono-usage
app.get('/ui', swaggerUI({ url: '/doc' }));

export const handler = handle(app);
