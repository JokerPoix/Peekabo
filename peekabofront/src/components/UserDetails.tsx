import React, { useEffect, useState } from 'react';
import type { User } from '../api/peekaboo_methods.schemas';
import './UserDetails.css';

interface UserDetailsProps {
  userId: number;
}

const UserDetails: React.FC<UserDetailsProps> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(`/api/users/${userId}`);
      setUser(await response.json());
    };
    fetchUser();
  }, [userId]);

  if (!user) {
    return (
      <div className="user-details-card loading">
        <div className="loading-indicator">
          <span>Chargement des détails de l'utilisateur...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="user-details-card">
      <h1>Détails de l'utilisateur</h1>
      <div className="details-container">
        <div className="detail-item">
          <div className="detail-label">Email&nbsp;:</div>
          <div className="detail-value">{user.email}</div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
