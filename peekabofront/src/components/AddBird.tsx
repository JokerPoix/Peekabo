import React, { useState } from 'react';

const AddBird: React.FC = () => {
  const [bird, setBird] = useState({
    name: '',
    latitude: 0,
    longitude: 0,
    owner: '',
  });

  const addBird = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/birds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bird),
    });
    alert('Bird added successfully!');
  };

  const handleChange = (field: string, value: string | number) => {
    setBird((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <h1>Ajouter un oiseau</h1>
      <form onSubmit={addBird}>
        <label>
          Nom :
          <input
            type="text"
            required
            value={bird.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </label>
        <label>
          Latitude :
          <input
            type="number"
            required
            value={bird.latitude}
            onChange={(e) => handleChange('latitude', parseFloat(e.target.value))}
          />
        </label>
        <label>
          Longitude :
          <input
            type="number"
            required
            value={bird.longitude}
            onChange={(e) => handleChange('longitude', parseFloat(e.target.value))}
          />
        </label>
        <label>
          Propriétaire :
          <input
            type="text"
            required
            value={bird.owner}
            onChange={(e) => handleChange('owner', e.target.value)}
          />
        </label>
        <button type="submit">Ajouter l'oiseau</button>
      </form>
    </div>
  );
};

export default AddBird;
