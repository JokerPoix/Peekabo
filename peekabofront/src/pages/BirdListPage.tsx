import React from 'react';
import BirdList from '../components/BirdList';

const BirdListPage: React.FC = () => {
  const handleBirdSelected = () => {};

  return (
    <div>
      <h1>Liste des Oiseaux</h1>
      <div className="menu">
        <BirdList onBirdSelected={handleBirdSelected} />
      </div>
    </div>
  );
};

export default BirdListPage;
