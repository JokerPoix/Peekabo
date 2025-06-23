module.exports = {
  chatbotApi: {
    input: './schemas/openapi.yaml',
    output: {
      mode: 'tags',
      target: 'src/api/peekaboo_methods.ts',
      client: 'axios'
    }
  }
};
