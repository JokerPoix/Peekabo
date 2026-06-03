<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class ClassificationController extends AbstractController
{
    private const MAX_HISTORY_MESSAGES = 20;

    private string $serviceUrl;
    private string $ollamaBaseUrl;
    private string $ollamaModel;
    private HttpClientInterface $httpClient;

    private static array $chatSessions = [];

    public function __construct(HttpClientInterface $httpClient)
    {
        $this->httpClient = $httpClient;
        $this->serviceUrl = (string) getenv('CLASS_MODEL_SRV_URL') ?: 'http://peekaboo_class_model_service:8060';
        $this->ollamaBaseUrl = (string) getenv('OLLAMA_BASE_URL') ?: 'http://ollama:11434';
        $this->ollamaModel = (string) getenv('OLLAMA_MODEL') ?: 'llama3.2:3b';
    }

    #[Route('/predict', name: 'predict_bird', methods: ['POST'])]
    public function predict(Request $request): Response
    {
        $file = $request->files->get('image');

        if (!$file) {
            return new JsonResponse(['success' => false, 'error' => 'No image file provided'], Response::HTTP_BAD_REQUEST);
        }

        if (!$file->isValid()) {
            return new JsonResponse(['success' => false, 'error' => 'Invalid file upload'], Response::HTTP_BAD_REQUEST);
        }

        $topK = $request->request->getInt('top_k', 3);
        if ($topK < 1 || $topK > 10) {
            $topK = 3;
        }

        $ch = curl_init($this->serviceUrl . '/predict');
        if ($ch === false) {
            return new JsonResponse(['success' => false, 'error' => 'Classification service unavailable'], Response::HTTP_BAD_GATEWAY);
        }

        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POSTFIELDS     => [
                'image' => new \CurlFile($file->getPathname(), $file->getClientMimeType() ?: 'application/octet-stream', $file->getClientOriginalName()),
                'top_k' => (string) $topK,
            ],
            CURLOPT_TIMEOUT        => 30,
        ]);

        $body = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($body === false || $error !== '') {
            return new JsonResponse([
                'success' => false,
                'error'   => 'Classification service error: ' . $error,
            ], Response::HTTP_BAD_GATEWAY);
        }

        return new Response($body, $httpCode, ['Content-Type' => 'application/json']);
    }

    #[Route('/llm/get-chat-birds/', name: 'llm_get_chat_birds', methods: ['POST'])]
    public function llmGetChatBirds(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        if (!$data || !isset($data['message'])) {
            return new JsonResponse(['success' => false, 'error' => 'No message provided'], Response::HTTP_BAD_REQUEST);
        }

        $userMessage = (string) ($data['message'] ?? '');

        $ollamaMessages = [
            ['role' => 'system', 'content' => (
                'You are an expert ornithologist assistant for the Peekaboo bird-watching application. '
                . 'Answer questions about birds, their species, habitats, behaviours, and characteristics. '
                . 'Be concise and informative.'
            )],
            ['role' => 'user', 'content' => $userMessage],
        ];

        return $this->streamOllama($ollamaMessages);
    }

    #[Route('/llm/chat', name: 'llm_chat', methods: ['POST'])]
    public function llmChat(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        if (!$data || !isset($data['message'])) {
            return new JsonResponse(['success' => false, 'error' => 'No message provided'], Response::HTTP_BAD_REQUEST);
        }

        $userMessage = (string) ($data['message'] ?? '');
        $sessionId = (string) ($data['session_id'] ?? 'default');

        if (!isset(self::$chatSessions[$sessionId])) {
            self::$chatSessions[$sessionId] = [];
        }

        $history = &self::$chatSessions[$sessionId];
        $history[] = ['role' => 'user', 'content' => $userMessage];

        if (count($history) > self::MAX_HISTORY_MESSAGES) {
            $history = array_slice($history, -self::MAX_HISTORY_MESSAGES);
        }

        $ollamaMessages = array_merge(
            [
                ['role' => 'system', 'content' => (
                    'You are a helpful assistant for the Peekaboo bird-watching application. '
                    . 'You can help users identify birds, learn about bird species, and answer general questions.'
                )],
            ],
            $history
        );

        return $this->streamOllama($ollamaMessages, $sessionId);
    }

    private function streamOllama(array $ollamaMessages, ?string $sessionId = null): StreamedResponse
    {
        $ollamaUrl = $this->ollamaBaseUrl . '/api/chat';
        $model = $this->ollamaModel;
        $httpClient = $this->httpClient;

        $response = new StreamedResponse(function () use ($httpClient, $ollamaUrl, $model, $ollamaMessages, $sessionId): void {
            // Disable Apache compression
            if (function_exists('apache_setenv')) {
                apache_setenv('no-gzip', '1');
            }

            // Kill all PHP output buffering
            ini_set('output_buffering', '0');
            ini_set('zlib.output_compression', '0');
            while (ob_get_level() > 0) {
                ob_end_flush();
            }
            ob_implicit_flush(true);

            $fullReply = '';

            try {
                $ollamaResponse = $httpClient->request('POST', $ollamaUrl, [
                    'json' => [
                        'model'    => $model,
                        'messages' => $ollamaMessages,
                        'stream'   => true,
                    ],
                    'timeout' => 120,
                ]);

                $buffer = '';

                foreach ($httpClient->stream($ollamaResponse) as $chunk) {
                    if ($chunk->isTimeout()) {
                        continue;
                    }

                    $content = $chunk->getContent();
                    if ($content === '') {
                        continue;
                    }

                    $buffer .= $content;

                    // Process each complete NDJSON line in the buffer
                    while (($nlPos = strpos($buffer, "\n")) !== false) {
                        $line = substr($buffer, 0, $nlPos);
                        $buffer = substr($buffer, $nlPos + 1);

                        $line = trim($line);
                        if ($line === '') {
                            continue;
                        }

                        $payload = json_decode($line, true);
                        if (!\is_array($payload)) {
                            continue;
                        }

                        $token = $payload['message']['content'] ?? '';
                        if ($token !== '') {
                            $fullReply .= $token;
                            echo 'data: ' . $token . "\n\n";
                            flush();
                        }

                        if (!empty($payload['done'])) {
                            break 2;
                        }
                    }
                }
            } catch (\Exception $e) {
                $msg = str_replace(["\n", "\r"], ' ', $e->getMessage());
                echo 'data: [ERROR] ' . $msg . "\n\n";
                flush();
            }

            echo "data: [DONE]\n\n";
            flush();

            if ($sessionId !== null && $fullReply !== '') {
                self::$chatSessions[$sessionId][] = ['role' => 'assistant', 'content' => $fullReply];
                if (count(self::$chatSessions[$sessionId]) > self::MAX_HISTORY_MESSAGES) {
                    self::$chatSessions[$sessionId] = \array_slice(
                        self::$chatSessions[$sessionId],
                        -self::MAX_HISTORY_MESSAGES
                    );
                }
            }
        });

        $response->headers->set('Content-Type', 'text/event-stream; charset=utf-8');
        $response->headers->set('X-Accel-Buffering', 'no');
        $response->headers->set('Cache-Control', 'no-cache');

        return $response;
    }
}
