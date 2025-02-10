<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: "App\Repository\LocationHistoryRepository")]
#[ORM\Table(name: "location_history")]
class LocationHistory
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    private int $id;

    #[ORM\Column(type: "float")]
    private float $latitude;

    #[ORM\Column(type: "float")]
    private float $longitude;

    #[ORM\Column(type: "datetime")]
    private \DateTime $timestamp;

    #[ORM\ManyToOne(targetEntity: Bird::class)]
    #[ORM\JoinColumn(nullable: false)]
    private Bird $bird;

    public function getId(): int
    {
        return $this->id;
    }

    public function getLatitude(): float
    {
        return $this->latitude;
    }

    public function setLatitude(float $latitude): self
    {
        $this->latitude = $latitude;
        return $this;
    }

    public function getLongitude(): float
    {
        return $this->longitude;
    }

    public function setLongitude(float $longitude): self
    {
        $this->longitude = $longitude;
        return $this;
    }

    public function getTimestamp(): \DateTime
    {
        return $this->timestamp;
    }

    public function setTimestamp(\DateTime $timestamp): self
    {
        $this->timestamp = $timestamp;
        return $this;
    }

    public function getBird(): Bird
    {
        return $this->bird;
    }

    public function setBird(Bird $bird): self
    {
        $this->bird = $bird;
        return $this;
    }
}
