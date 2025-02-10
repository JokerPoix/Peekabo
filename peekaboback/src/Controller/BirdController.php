<?php

namespace App\Controller;

use App\Entity\Bird;
use App\Entity\LocationHistory;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class BirdController extends AbstractController
{
    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    #[Route('/birds', name: 'get_all_birds', methods: ['GET'])]
    public function getAllBirds(): JsonResponse
    {
        $birds = $this->entityManager->getRepository(Bird::class)->findAll();
        
        $response = array_map(function (Bird $bird) {
            return [
                'id' => $bird->getId(),
                'name' => $bird->getName(),
                'latitude' => $bird->getLatitude(),
                'longitude' => $bird->getLongitude(),
                'owner' => $bird->getOwner()->getUsername(),
            ];
        }, $birds);

        return $this->json($response);
    }

    #[Route('/user/{userId}/birds', name: 'get_user_birds', methods: ['GET'])]
    public function getUserBirds(int $userId): JsonResponse
    {
        $user = $this->entityManager->getRepository(User::class)->find($userId);

        if (!$user) {
            return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        $birds = $this->entityManager->getRepository(Bird::class)->findBy(['owner' => $user]);

        $response = array_map(function (Bird $bird) {
            return [
                'id' => $bird->getId(),
                'name' => $bird->getName(),
                'latitude' => $bird->getLatitude(),
                'longitude' => $bird->getLongitude(),
                'gps_id' => $bird->getGpsId(),
            ];
        }, $birds);

        return $this->json($response);
    }

    #[Route('/bird/{gpsId}/locations', name: 'update_locations', methods: ['POST'])]
    public function updateLocations(string $gpsId, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['locations']) || !is_array($data['locations'])) {
            return $this->json(['error' => 'Invalid payload'], Response::HTTP_BAD_REQUEST);
        }

        $bird = $this->entityManager->getRepository(Bird::class)->findOneBy(['gpsId' => $gpsId]);

        if (!$bird) {
            return $this->json(['error' => 'Bird not found'], Response::HTTP_NOT_FOUND);
        }

        foreach ($data['locations'] as $location) {
            if (isset($location['latitude'], $location['longitude'])) {
                $bird->setLatitude((float) $location['latitude']);
                $bird->setLongitude((float) $location['longitude']);
            }
        }

        $this->entityManager->persist($bird);
        $this->entityManager->flush();

        return $this->json(['message' => 'Locations updated successfully']);
    }

    #[Route('/bird/{id}/location', name: 'get_last_location', methods: ['GET'])]
    public function getLastLocation(int $id): JsonResponse
    {
        $bird = $this->entityManager->getRepository(Bird::class)->find($id);

        if (!$bird) {
            return $this->json(['error' => 'Bird not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $lastLocation = $this->entityManager->getRepository(LocationHistory::class)->findOneBy(
            ['bird' => $bird],
            ['timestamp' => 'DESC']
        );

        if (!$lastLocation) {
            return $this->json(['error' => 'No location history found for this bird'], JsonResponse::HTTP_NOT_FOUND);
        }

        return $this->json([
            'latitude' => $lastLocation->getLatitude(),
            'longitude' => $lastLocation->getLongitude(),
            'timestamp' => $lastLocation->getTimestamp()->format('Y-m-d H:i:s'),
        ]);
    }

    #[Route('/bird/{id}/path', name: 'get_bird_path', methods: ['GET'])]
    public function getBirdPath(int $id): JsonResponse
    {
        $bird = $this->entityManager->getRepository(Bird::class)->find($id);

        if (!$bird) {
            return $this->json(['error' => 'Bird not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $locations = $this->entityManager->getRepository(LocationHistory::class)->findBy(
            ['bird' => $bird],
            ['timestamp' => 'ASC'] 
        );

        $response = array_map(function (LocationHistory $location) {
            return [
                'latitude' => $location->getLatitude(),
                'longitude' => $location->getLongitude(),
                'timestamp' => $location->getTimestamp()->format('Y-m-d H:i:s'),
            ];
        }, $locations);

        return $this->json($response);
    }
}
