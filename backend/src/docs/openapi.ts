/** Hand-written OpenAPI 3.0 spec served at /api/docs via swagger-ui-express. */
export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: '1Fi Marketplace API',
    version: '1.0.0',
    description:
      'Products, variants and mutual-fund-backed EMI plans for the 1Fi Marketplace. ' +
      'EMI monthly amounts are computed from the selected variant price.',
  },
  servers: [{ url: '/api/v1', description: 'v1' }],
  tags: [
    { name: 'Products', description: 'Product catalogue and EMI plans' },
    { name: 'Images', description: 'Self-hosted product imagery' },
  ],
  paths: {
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'List products',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 50 } },
          {
            name: 'sort',
            in: 'query',
            schema: { type: 'string', enum: ['newest', 'price_asc', 'price_desc'] },
          },
        ],
        responses: {
          '200': { description: 'Paginated product list' },
          '422': { description: 'Invalid query parameters' },
        },
      },
    },
    '/products/{slug}': {
      get: {
        tags: ['Products'],
        summary: 'Get a product by slug',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Product detail with variants + EMI plans' },
          '404': { description: 'Product not found' },
          '422': { description: 'Invalid slug' },
        },
      },
    },
    '/products/{slug}/emi': {
      get: {
        tags: ['Products'],
        summary: 'EMI plans computed for a specific variant',
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'variantId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'EMI plans for the chosen variant price' },
          '404': { description: 'Product or variant not found' },
          '422': { description: 'Invalid variantId' },
        },
      },
    },
    '/images/{id}': {
      get: {
        tags: ['Images'],
        summary: 'Stream a stored image',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Image bytes', content: { 'image/*': {} } },
          '404': { description: 'Image not found' },
          '422': { description: 'Invalid image id' },
        },
      },
    },
  },
} as const;
