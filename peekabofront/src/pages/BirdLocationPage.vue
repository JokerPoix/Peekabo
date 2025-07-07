<script setup lang="ts">
import { ref, watch, onMounted, computed, onUnmounted } from "vue";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import BirdList from "@/components/BirdList.vue";
import { getBirdIdLocation, getBirdIdPath } from "@/api/default";
import type { Bird, Location } from "@/api/peekaboo_methods.schemas";

// Selected bird from the BirdList
const selectedBird = ref<Bird | null>(null);

// Reactive location data with default values
const birdLocation = ref({
  latitude: 48.8566, // Default: Latitude of Paris
  longitude: 2.3522, // Default: Longitude of Paris
});

// Array to store the bird's path
const birdPath = ref<L.LatLng[]>([]);

// Loading and error states
const loading = ref(false);
const error = ref<string | null>(null);

// Store interval ID for location updates
const locationUpdateInterval = ref<number | null>(null);

// Custom bird icon
const myIcon = L.icon({
    iconUrl: '/src/assets/img/bird_icon_map.png',
    iconSize: [95, 95],
    iconAnchor: [50, 70],
    popupAnchor: [0, -76]
});

const map = ref<L.Map | null>(null);
const marker = ref<L.Marker | null>(null);
const polyline = ref<L.Polyline | null>(null);

// Function to start automatic location updates
const startLocationUpdates = (birdId: number) => {
  // Clear any existing interval first
  if (locationUpdateInterval.value) {
    clearInterval(locationUpdateInterval.value);
  }
  
  // Set up new interval - update every 10 seconds
  locationUpdateInterval.value = setInterval(() => {
    fetchBirdLocation(birdId);
  }, 10000);
};

// Handle bird selection
const handleBirdSelected = (bird: Bird | null) => {
  // Clear any existing update interval
  if (locationUpdateInterval.value) {
    clearInterval(locationUpdateInterval.value);
    locationUpdateInterval.value = null;
  }

  selectedBird.value = bird;
  
  if (bird) {
    // Immediately update the map location with the bird's coordinates
    if (bird.latitude !== undefined && bird.longitude !== undefined) {
      birdLocation.value.latitude = bird.latitude;
      birdLocation.value.longitude = bird.longitude;
      
      if (map.value && marker.value) {
        const newLatLng = L.latLng(bird.latitude, bird.longitude);
        marker.value.setLatLng(newLatLng);
        map.value.setView(newLatLng, map.value.getZoom());
      }
    }
    
    // If bird has an ID, fetch additional location data
    if (bird.id) {
      fetchBirdLocation(bird.id);
      fetchBirdPath(bird.id);
      
      // Start automatic updates
      startLocationUpdates(bird.id);
    }
  } else {
    // When no bird is selected, clear the path
    birdPath.value = [];
    if (polyline.value) {
      polyline.value.setLatLngs([]);
    }
  }
};

// Fetch the last known location of the selected bird
const fetchBirdLocation = async (birdId: number) => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await getBirdIdLocation(birdId);
    const location = response.data;
    
    if (location && location.latitude !== undefined && location.longitude !== undefined) {
      birdLocation.value.latitude = location.latitude;
      birdLocation.value.longitude = location.longitude;
    }
  } catch (err) {
    console.error('Error fetching bird location:', err);
    error.value = 'Failed to load bird location data.';
  } finally {
    loading.value = false;
  }
};

// Fetch the complete path history of the selected bird
const fetchBirdPath = async (birdId: number) => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await getBirdIdPath(birdId);
    const pathData = response.data;
    
    // Convert the path data to LatLng points for Leaflet
    if (Array.isArray(pathData) && pathData.length > 0) {
      // Sort the path by timestamp if available
      const sortedPath = [...pathData].sort((a, b) => {
        if (a.timestamp && b.timestamp) {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        }
        return 0;
      });
      
      // Convert to Leaflet LatLng objects
      birdPath.value = sortedPath
        .filter(point => point.latitude !== undefined && point.longitude !== undefined)
        .map(point => L.latLng(point.latitude!, point.longitude!));
      
      // Add the current location to the path
      if (birdLocation.value.latitude && birdLocation.value.longitude) {
        birdPath.value.push(L.latLng(birdLocation.value.latitude, birdLocation.value.longitude));
      }
      
      // Update the polyline on the map
      if (polyline.value) {
        polyline.value.setLatLngs(birdPath.value);
        
        // Fit the map to show the entire path
        if (map.value && birdPath.value.length > 1) {
          map.value.fitBounds(polyline.value.getBounds(), {
            padding: [50, 50],
            maxZoom: 13
          });
        }
      }
    }
  } catch (err) {
    console.error('Error fetching bird path:', err);
    error.value = 'Failed to load bird path data.';
  } finally {
    loading.value = false;
  }
};

// Initialize the map
onMounted(() => {
  map.value = L.map("map").setView([birdLocation.value.latitude, birdLocation.value.longitude], 13);

  // Add OpenStreetMap tiles
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map.value);

  // Add a marker at the initial location
  marker.value = L.marker([birdLocation.value.latitude, birdLocation.value.longitude], {icon: myIcon}).addTo(map.value);

  // Add a polyline to track the bird's path
  polyline.value = L.polyline(birdPath.value, { color: "blue", weight: 3 }).addTo(map.value);
});

// Watch for location changes and update the map and path
watch(
  () => birdLocation.value,
  (newLocation) => {
    if (map.value && marker.value) {
      // Update the marker position
      marker.value.setLatLng([newLocation.latitude, newLocation.longitude]);

      // Center the map on the new location
    map.value.setView([newLocation.latitude, newLocation.longitude], map.value.getZoom());


      
      // Add this point to the path if it's not empty
      if (birdPath.value.length > 0) {
        // Add current position to the path
        const newPoint = L.latLng(newLocation.latitude, newLocation.longitude);
        
        // Check if this point is different from the last one
        const lastPoint = birdPath.value[birdPath.value.length - 1];
        if (lastPoint.lat !== newPoint.lat || lastPoint.lng !== newPoint.lng) {
          birdPath.value.push(newPoint);
          
          // Update polyline
          if (polyline.value) {
            polyline.value.setLatLngs(birdPath.value);
          }
        }
      }
    }
  },
  { deep: true }
);

// Function to update location manually (for testing)
const updateLocation = (key: "latitude" | "longitude", value: string) => {
  const numericValue = parseFloat(value);
  if (!isNaN(numericValue)) {
    birdLocation.value[key] = numericValue;
  }
};

// Function to get the user's current location
const getUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        birdLocation.value.latitude = position.coords.latitude;
        birdLocation.value.longitude = position.coords.longitude;
      },
      (error) => {
        console.error("Error getting location:", error.message);
        alert("Unable to retrieve your location. Please check your browser settings.");
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
};

// Computed property for the title
const birdTitle = computed(() => {
  return selectedBird.value ? `${selectedBird.value.name}'s Location` : 'Bird Location Tracker';
});

// Computed property to check if a path is available
const hasPath = computed(() => {
  return birdPath.value.length > 1;
});

// Clean up interval when component unmounts
onUnmounted(() => {
  if (locationUpdateInterval.value) {
    clearInterval(locationUpdateInterval.value);
  }
});
</script>

<template>
  <div>
    <div class="menu">
      <BirdList @bird-selected="handleBirdSelected" />
    </div>

    
    <!-- Add a small indicator showing real-time updates -->
    <div v-if="selectedBird && locationUpdateInterval" class="update-indicator">
      <span class="update-dot"></span> Updating location every 10 seconds
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>


    <!-- Map container -->
    <div id="map" style="height: 400px; width: 100%; margin-top: 20px;"></div>
    
    <!-- Bird info display -->
    <div v-if="selectedBird" class="bird-details">
      <p><strong>ID de l'oiseau :</strong> {{ selectedBird.id }}</p>
      <p><strong>Nom :</strong> {{ selectedBird.name }}</p>
      <p><strong>ID GPS :</strong> {{ selectedBird.gps_id }}</p>
      <p><strong>Propriétaire :</strong> {{ selectedBird.owner }}</p>
      <p><strong>Position actuelle :</strong> {{ birdLocation.latitude.toFixed(6) }}, {{ birdLocation.longitude.toFixed(6) }}</p>
      <p v-if="hasPath"><strong>Nombre de points du trajet :</strong> {{ birdPath.length }}</p>
    </div>
    
    <!-- Manual controls (useful for testing) -->
    <div class="manual-controls">      
      <!-- Button to get user's current location -->
      <button @click="getUserLocation"> Ma Position</button>
    </div>
  </div>
  
</template>

<style scoped>
.loading-state, .error-message {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error-message {
  color: #d32f2f;
}

.bird-details {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.manual-controls {
  background-color: #eee;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.manual-controls h3 {
  margin-top: 0;
}

.manual-controls label {
  margin-right: 15px;
}

.manual-controls button {
  margin-top: 10px;
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.manual-controls button:hover {
  background-color: #45a049;
}

/* Style for the update indicator */
.update-indicator {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: #4caf50;
  margin-bottom: 10px;
}

.update-dot {
  height: 8px;
  width: 8px;
  background-color: #4caf50;
  border-radius: 50%;
  display: inline-block;
  margin-right: 5px;
  animation: pulse 2s infinite;
}

</style>