import React from 'react';
import imagePeekaboo from '../assets/img/image_peekaboo.png';
import pexelsBg from '../assets/img/pexels-couleur-2317904.jpg';

const HomePage: React.FC = () => {
  return (
    <div className="page-container" style={{
      backgroundImage: `url(${pexelsBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh',
      color: 'white',
      textShadow: '0 0 5px #000',
    }}>
      <img
        src={imagePeekaboo}
        alt="Peekaboo Icon"
        className="chatbot-icon"
        style={{ maxWidth: '25vh', height: 'auto', padding: '20px', borderRadius: '150px' }}
      />
    </div>
  );
};

export default HomePage;
