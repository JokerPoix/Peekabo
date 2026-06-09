import React, { useEffect, useState } from 'react';
import type { Bird } from '../api/peekaboo_methods.schemas';

interface BirdDetailsProps {
  birdId: number;
}

const BirdDetails: React.FC<BirdDetailsProps> = ({ birdId }) => {
  const [bird, setBird] = useState<Bird | null>(null);

  useEffect(() => {
    const fetchBird = async () => {
      const response = await fetch(`/api/birds/${birdId}`);
      setBird(await response.json());
    };
    fetchBird();
  }, [birdId]);

  if (!bird) return <div>Loading...</div>;

  return (
    <div>
      <h1>Détails de l'oiseau</h1>
      <p><strong>Nom :</strong> {bird.name}</p>
      <p><strong>Latitude :</strong> {bird.latitude}</p>
      <p><strong>Longitude :</strong> {bird.longitude}</p>
      <p><strong>Propriétaire :</strong> {bird.owner}</p>
      <p><strong>ID GPS :</strong> {bird.gps_id}</p>
    </div>
  );
};

export default BirdDetails;
