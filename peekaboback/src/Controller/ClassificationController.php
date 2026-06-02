<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Proxy controller that exposes the ML classification service endpoints
 * through the Symfony backend. The Python service becomes an internal
 * dependency — the frontend only ever talks to Symfony.
 */
class ClassificationController extends AbstractController
{
    private string $serviceUrl;

    public function __construct()
    {
        $this->serviceUrl = (string) getenv('CLASS_MODEL_SRV_URL') ?: 'http://peekaboo_class_model_service:8060';
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
        return $this->streamToPython($request, '/llm/get-chat-birds/');
    }

    #[Route('/llm/chat', name: 'llm_chat', methods: ['POST'])]
    public function llmChat(Request $request): Response
    {
        return $this->streamToPython($request, '/llm/chat');
    }

    private function streamToPython(Request $request, string $path): Response
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['message'])) {
            return new JsonResponse(['success' => false, 'error' => 'No message provided'], Response::HTTP_BAD_REQUEST);
        }

        $url = $this->serviceUrl . $path;
        $jsonData = json_encode($data);
        if ($jsonData === false) {
            return new JsonResponse(['success' => false, 'error' => 'Invalid request data'], Response::HTTP_BAD_REQUEST);
        }

        $response = new StreamedResponse(function () use ($url, $jsonData): void {
            $ch = curl_init($url);
            if ($ch === false) {
                echo '[ERROR] Classification service unavailable';
                return;
            }

            curl_setopt_array($ch, [
                CURLOPT_POST       => true,
                CURLOPT_POSTFIELDS => $jsonData,
                CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
                CURLOPT_RETURNTRANSFER => false,
                CURLOPT_TIMEOUT    => 120,
                CURLOPT_WRITEFUNCTION => function ($ch, $data): int {
                    echo $data;
                    if (ob_get_level() > 0) {
                        ob_flush();
                    }
                    flush();
                    return strlen($data);
                },
            ]);

            curl_exec($ch);
            curl_close($ch);
        });

        $response->headers->set('Content-Type', 'text/plain; charset=utf-8');
        $response->headers->set('X-Accel-Buffering', 'no');

        return $response;
    }
}
