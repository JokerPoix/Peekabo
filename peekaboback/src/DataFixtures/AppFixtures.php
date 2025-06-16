<?php

namespace App\DataFixtures;

use App\Entity\Bird;
use App\Entity\LocationHistory;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        // Utilisateur de test
        $user = new User();
        $user->setEmail("user@example.com");
        $hashedPassword = $this->passwordHasher->hashPassword($user, "password");
        $user->setPassword($hashedPassword);
        $user->setRoles(['ROLE_USER']);
        $manager->persist($user);

        // Base GPS
        $baseLat = 43.6012;
        $baseLng = 3.9122;
        $offsets = [[0.0003, 0.0002], [-0.0004, 0.0001], [0.0002, -0.0003], [-0.0003, -0.0002]];

        for ($i = 0; $i < 4; $i++) {
            $bird = new Bird();
            $bird->setName("Bird #" . ($i + 1));
            $bird->setGpsId("GPS00$i");
            $bird->setOwner($user);
            $manager->persist($bird);

            // Position actuelle
            $lat = $baseLat + $offsets[$i][0];
            $lng = $baseLng + $offsets[$i][1];

            // Historique J-1
            $history1 = new LocationHistory();
            $history1->setBird($bird);
            $history1->setLatitude($lat - 0.0001);
            $history1->setLongitude($lng - 0.0001);
            $history1->setTimestamp(new \DateTime('-1 day'));
            $manager->persist($history1);

            // Historique J-0
            $history2 = new LocationHistory();
            $history2->setBird($bird);
            $history2->setLatitude($lat);
            $history2->setLongitude($lng);
            $history2->setTimestamp(new \DateTime());
            $manager->persist($history2);
        }

        $manager->flush();
    }
}
