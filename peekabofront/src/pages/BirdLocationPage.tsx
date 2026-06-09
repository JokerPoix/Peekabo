import React, { useEffect, useRef, useState, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import BirdList from '../components/BirdList';
import { getBirdIdLocation, getBirdIdPath } from '../api/default';
import type { Bird, Location } from '../api/peekaboo_methods.schemas';
import birdIconMap from '../assets/img/bird_icon_map.png';

const myIcon = L.icon({
  iconUrl: birdIconMap,
  iconSize: [95, 95],
  iconAnchor: [50, 70],
  popupAnchor: [0, -76],
});

const BirdLocationPage: React.FC = () => {
  const [selectedBird, setSelectedBird] = useState<Bird | null>(null);
  const [birdLocation, setBirdLocation] = useState({ latitude: 48.8566, longitude: 2.3522 });
  const [birdPath, setBirdPath] = useState<L.LatLng[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPath, setHasPath] = useState(false);

  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const fetchBirdLocation = useCallback(async (birdId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getBirdIdLocation(birdId);
      const location = response.data;
      if (location && location.latitude !== undefined && location.longitude !== undefined) {
        setBirdLocation({ latitude: location.latitude, longitude: location.longitude });
      }
    } catch {
      setError('Failed to load bird location data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBirdPath = useCallback(async (birdId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getBirdIdPath(birdId);
      const pathData = response.data;
      if (Array.isArray(pathData) && pathData.length > 0) {
        const sortedPath = [...pathData].sort((a: Location, b: Location) => {
          if (a.timestamp && b.timestamp) {
            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          }
          return 0;
        });

        const points = sortedPath
          .filter((point) => point.latitude !== undefined && point.longitude !== undefined)
          .map((point) => L.latLng(point.latitude!, point.longitude!));

        if (birdLocation.latitude && birdLocation.longitude) {
          points.push(L.latLng(birdLocation.latitude, birdLocation.longitude));
        }

        setBirdPath(points);
        setHasPath(points.length > 1);

        if (polylineRef.current) {
          polylineRef.current.setLatLngs(points);
          if (mapRef.current && points.length > 1) {
            mapRef.current.fitBounds(polylineRef.current.getBounds(), {
              padding: [50, 50],
              maxZoom: 13,
            });
          }
        }
      }
    } catch {
      setError('Failed to load bird path data.');
    } finally {
      setLoading(false);
    }
  }, [birdLocation]);

  const handleBirdSelected = useCallback(
    (bird: Bird | null) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      setSelectedBird(bird);
      if (bird) {
        if (bird.latitude !== undefined && bird.longitude !== undefined) {
          const newLoc = { latitude: bird.latitude, longitude: bird.longitude };
          setBirdLocation(newLoc);
          if (mapRef.current && markerRef.current) {
            const newLatLng = L.latLng(bird.latitude, bird.longitude);
            markerRef.current.setLatLng(newLatLng);
            mapRef.current.setView(newLatLng, mapRef.current.getZoom());
          }
        }
        if (bird.id) {
          fetchBirdLocation(bird.id);
          fetchBirdPath(bird.id);
          intervalRef.current = setInterval(() => {
            if (bird.id) fetchBirdLocation(bird.id);
          }, 10000);
        }
      } else {
        setBirdPath([]);
        setHasPath(false);
        if (polylineRef.current) {
          polylineRef.current.setLatLngs([]);
        }
      }
    },
    [fetchBirdLocation, fetchBirdPath]
  );

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView(
        [birdLocation.latitude, birdLocation.longitude],
        13
      );

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const marker = L.marker([birdLocation.latitude, birdLocation.longitude], { icon: myIcon }).addTo(map);
      const polyline = L.polyline([], { color: 'blue', weight: 3 }).addTo(map);

      mapRef.current = map;
      markerRef.current = marker;
      polylineRef.current = polyline;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      const newLatLng = L.latLng(birdLocation.latitude, birdLocation.longitude);
      markerRef.current.setLatLng(newLatLng);
      mapRef.current.setView(newLatLng, mapRef.current.getZoom());

      if (birdPath.length > 0) {
        const lastPoint = birdPath[birdPath.length - 1];
        if (lastPoint.lat !== newLatLng.lat || lastPoint.lng !== newLatLng.lng) {
          const updatedPath = [...birdPath, newLatLng];
          setBirdPath(updatedPath);
          setHasPath(updatedPath.length > 1);
          if (polylineRef.current) {
            polylineRef.current.setLatLngs(updatedPath);
          }
        }
      }
    }
  }, [birdLocation, birdPath]);

  useEffect(() => {
    if (polylineRef.current && birdPath.length > 0) {
      polylineRef.current.setLatLngs(birdPath);
    }
  }, [birdPath]);

  const updateLocation = (key: 'latitude' | 'longitude', value: string) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      setBirdLocation((prev) => ({ ...prev, [key]: numericValue }));
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setBirdLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error.message);
          alert('Unable to retrieve your location. Please check your browser settings.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const birdTitle = selectedBird
    ? `${selectedBird.name}'s Location`
    : 'Bird Location Tracker';

  return (
    <div>
      <div className="menu">
        <BirdList onBirdSelected={handleBirdSelected} />
      </div>

      {selectedBird && intervalRef.current && (
        <div className="update-indicator">
          <span className="update-dot"></span> Updating location every 10 seconds
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div ref={mapContainerRef} style={{ height: '400px', width: '100%', marginTop: '20px' }}></div>

      {selectedBird && (
        <div className="bird-details">
          <p><strong>ID de l'oiseau :</strong> {selectedBird.id}</p>
          <p><strong>Nom :</strong> {selectedBird.name}</p>
          <p><strong>ID GPS :</strong> {selectedBird.gps_id}</p>
          <p><strong>Propriétaire :</strong> {selectedBird.owner}</p>
          <p><strong>Position actuelle :</strong> {birdLocation.latitude.toFixed(6)}, {birdLocation.longitude.toFixed(6)}</p>
          {hasPath && <p><strong>Nombre de points du trajet :</strong> {birdPath.length}</p>}
        </div>
      )}

      <div className="manual-controls">
        <button onClick={getUserLocation}>Ma Position</button>
      </div>
    </div>
  );
};

export default BirdLocationPage;
