module.exports = {
  chatbotApi: {
    input: './schemas/openapi.yaml',
    output: {
      mode: 'tags',
      target: 'src/api/ChatbotService.ts',
      client: 'axios'
    }
  }
};
