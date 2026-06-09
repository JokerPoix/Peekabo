import React, { useEffect, useState } from 'react';
import type { Bird } from '../api/peekaboo_methods.schemas';
import { getBirds } from '../api/default';
import './BirdList.css';

interface BirdWithImage extends Bird {
  image: string;
}

interface BirdListProps {
  onBirdSelected: (bird: Bird | null) => void;
}

const getRandomBirdImage = (birdName: string) => {
  const images = [
    'https://upload.wikimedia.org/wikipedia/commons/e/e1/Hausrotschwanz_Brutpflege_2006-05-24_211.jpg?uselang=fr',
    'https://upload.wikimedia.org/wikipedia/commons/b/bd/PasserDomesticusKopula.jpg?uselang=fr',
  ];
  const index = birdName.charCodeAt(0) % images.length;
  return images[index];
};

const BirdList: React.FC<BirdListProps> = ({ onBirdSelected }) => {
  const [birds, setBirds] = useState<BirdWithImage[]>([]);
  const [selectedBirdId, setSelectedBirdId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBirds = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getBirds();
      if (response.data && Array.isArray(response.data)) {
        setBirds(
          response.data.map((bird) => ({
            ...bird,
            image: getRandomBirdImage(bird.name || ''),
          }))
        );
      } else {
        setError('Unexpected response format from API');
      }
    } catch {
      setError('Failed to load birds. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBirds();
  }, []);

  const toggleSelection = (birdId: number) => {
    const selectedBird = birds.find((b) => b.id === birdId);
    if (selectedBirdId === birdId) {
      setSelectedBirdId(null);
      onBirdSelected(null);
    } else {
      setSelectedBirdId(birdId);
      if (selectedBird) {
        onBirdSelected(selectedBird);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <div>Chargement des oiseaux...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
        <div>
          <button className="retry-button" onClick={fetchBirds}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (birds.length === 0) {
    return (
      <div className="empty-state">
        Aucun oiseau trouvé. L'API retourne peut-être un tableau vide.
        <div>
          <button className="retry-button" onClick={fetchBirds}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bird-list-container">
      {birds.map((bird) => (
        <div
          key={bird.id}
          className={`bird-card${selectedBirdId === bird.id ? ' selected' : ''}`}
          onClick={() => bird.id !== undefined && toggleSelection(bird.id)}
        >
          <div className="bird-info">
            <div className="bird-image">
              <img src={bird.image} alt="Photo de l'oiseau" />
            </div>
            <div className="bird-details">
              <div className="bird-name">{bird.name}</div>
              {bird.latitude && bird.longitude && (
                <div className="bird-location">
                  <span>
                    {bird.latitude.toFixed(6)}, {bird.longitude.toFixed(6)}
                  </span>
                </div>
              )}
              {bird.owner && <div className="bird-owner">Propriétaire : {bird.owner}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BirdList;
