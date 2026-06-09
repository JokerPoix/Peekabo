import React, { useEffect, useRef, useState, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import BirdList from '../components/BirdList';
import BirdReportsList from '../components/BirdReportsList';
import { getBirdIdLocation, getBirdIdPath } from '../api/default';
import type { Bird, Location } from '../api/peekaboo_methods.schemas';
import birdIconMap from '../assets/img/bird_icon_map.png';

interface BirdReport {
  id: string;
  species: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  user_email: string | null;
  photo_url: string | null;
}

const myIcon = L.icon({
  iconUrl: birdIconMap,
  iconSize: [95, 95],
  iconAnchor: [50, 70],
  popupAnchor: [0, -76],
});

const reportIcon = L.divIcon({
  className: 'bird-report-marker',
  html: '<div style="background:#e74c3c;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);">&#x1F426;</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -20],
});

const BirdLocationPage: React.FC = () => {
  const [selectedBird, setSelectedBird] = useState<Bird | null>(null);
  const [birdLocation, setBirdLocation] = useState({ latitude: 48.8566, longitude: 2.3522 });
  const [birdPath, setBirdPath] = useState<L.LatLng[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPath, setHasPath] = useState(false);

  const [birdReports, setBirdReports] = useState<BirdReport[]>([]);
  const [showBirdList, setShowBirdList] = useState(false);
  const [showBirdReports, setShowBirdReports] = useState(false);

  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const reportLayerRef = useRef<L.LayerGroup | null>(null);

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

  const fetchBirdReports = useCallback(async () => {
    try {
      const response = await fetch('/bird_reports');
      if (response.ok) {
        const data: BirdReport[] = await response.json();
        setBirdReports(data);
      }
    } catch {
      // Reports are non-critical, fail silently
    }
  }, []);

  const renderReportMarkers = useCallback((reports: BirdReport[]) => {
    if (!mapRef.current) return;

    if (!reportLayerRef.current) {
      reportLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }
    reportLayerRef.current.clearLayers();

    reports.forEach((report) => {
      const time = report.timestamp.split(' ')[1]?.substring(0, 5) || '';
      const photoHtml = report.photo_url
        ? `<img src="${report.photo_url}" alt="${report.species}" style="width:120px;height:auto;border-radius:4px;margin-top:4px;display:block;" />`
        : '';
      const popupContent = `
        <div style="font-family:sans-serif;min-width:140px;text-align:center;">
          <strong style="color:#e74c3c;">${report.species}</strong><br/>
          <span style="font-size:12px;color:#666;">${time}</span>
          ${photoHtml}
        </div>
      `;
      const marker = L.marker([report.latitude, report.longitude], { icon: reportIcon })
        .bindPopup(popupContent);
      reportLayerRef.current?.addLayer(marker);
    });
  }, []);

  useEffect(() => {
    fetchBirdReports();
  }, [fetchBirdReports]);

  useEffect(() => {
    renderReportMarkers(birdReports);
  }, [birdReports, renderReportMarkers]);

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

  const handleReportClick = useCallback((lat: number, lng: number) => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 15);
    }
  }, []);

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

  const collapsibleBtnStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    background: '#ffd000',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 700,
    color: '#333',
    textAlign: 'left',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'background 0.2s',
  };

  const collapsibleContentStyle: React.CSSProperties = {
    borderBottom: '1px solid #e0e0e0',
  };

  return (
    <div>
      {/* Map controls */}
      <div style={{ padding: '8px 0', display: 'flex', gap: '8px' }}>
        <button
          onClick={getUserLocation}
          style={{
            background: '#ffd000',
            color: '#333',
            border: 'none',
            borderRadius: '12px',
            padding: '10px 20px',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(255, 208, 0, 0.3)',
            transition: 'all 0.2s',
          }}
        >
          Ma Position
        </button>
      </div>

      {/* Map on TOP */}
      <div ref={mapContainerRef} style={{ height: '400px', width: '100%' }}></div>

      {error && <div className="error-message">{error}</div>}

      {selectedBird && (
        <div className="bird-details">
          <p><strong>ID de l'oiseau :</strong> {selectedBird.id}</p>
          <p><strong>Nom :</strong> {selectedBird.name}</p>
          <p><strong>ID GPS :</strong> {selectedBird.gps_id}</p>
          <p><strong>Propriétaire :</strong> {selectedBird.owner}</p>
          <p><strong>Position actuelle :</strong> {birdLocation.latitude.toFixed(6)}, {birdLocation.longitude.toFixed(6)}</p>
          {hasPath && <p><strong>Nombre de points du trajet :</strong> {birdPath.length}</p>}
          {selectedBird && intervalRef.current && (
            <div className="update-indicator">
              <span className="update-dot"></span> Updating location every 10 seconds
            </div>
          )}
        </div>
      )}

      {/* Collapsible: Bird List */}
      <div>
        <button
          style={collapsibleBtnStyle}
          onClick={() => setShowBirdList((v) => !v)}
        >
          <span>Liste des Oiseaux</span>
          <span>{showBirdList ? '▲' : '▼'}</span>
        </button>
        {showBirdList && (
          <div style={collapsibleContentStyle}>
            <BirdList onBirdSelected={handleBirdSelected} />
          </div>
        )}
      </div>

      {/* Collapsible: Bird Reports */}
      <div>
        <button
          style={collapsibleBtnStyle}
          onClick={() => setShowBirdReports((v) => !v)}
        >
          <span>Signalements Oiseaux ({birdReports.length})</span>
          <span>{showBirdReports ? '▲' : '▼'}</span>
        </button>
        {showBirdReports && (
          <div style={collapsibleContentStyle}>
            <BirdReportsList reports={birdReports} onReportClick={handleReportClick} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BirdLocationPage;
