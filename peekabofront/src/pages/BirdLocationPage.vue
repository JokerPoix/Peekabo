<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import BirdList from "@/components/BirdList.vue";

// Reactive location data with default values
const birdLocation = ref({
  latitude: 48.8566, // Default: Latitude of Paris
  longitude: 2.3522, // Default: Longitude of Paris
});

// Array to store the bird's path
const birdPath = ref<L.LatLng[]>([
  L.latLng(48.8566, 2.3522), // Initial point (Paris)
]);

var myIcon = L.icon({
    iconUrl: 'src/assets/img/bird_icon_map.png',
    iconSize: [95, 95],
    iconAnchor: [50, 70],
    popupAnchor: [0, -76]
});

const map = ref<L.Map | null>(null);
const marker = ref<L.Marker | null>(null);
const polyline = ref<L.Polyline | null>(null);
const title = {
    title: "Bird Location",
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
  polyline.value = L.polyline(birdPath.value, { color: "blue" }).addTo(map.value);
});

// Watch for location changes and update the map and path
watch(
  () => birdLocation.value,
  (newLocation) => {
    if (map.value && marker.value && polyline.value) {
      // Update the marker position
      marker.value.setLatLng([newLocation.latitude, newLocation.longitude]);

      // Add the new location to the bird's path
      const newPoint = L.latLng(newLocation.latitude, newLocation.longitude);
      birdPath.value.push(newPoint);

      // Update the polyline with the new path
      polyline.value.setLatLngs(birdPath.value);

      // Center the map on the new location
      map.value.setView([newLocation.latitude, newLocation.longitude], 13);
    }
  },
  { deep: true }
);

// Function to update location
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
</script>

<template>
  <div>
    <div class="menu">
      <BirdList class="button" />
    </div>
    <h1>Bird Location Tracker</h1>

    <!-- Input fields for latitude and longitude -->
    <div>
      <label>
        Latitude:
        <input
          type="number"
          step="0.0001"
          :value="birdLocation.latitude"
          @input="updateLocation('latitude', $event.target.value)"
        />
      </label>
      <label>
        Longitude:
        <input
          type="number"
          step="0.0001"
          :value="birdLocation.longitude"
          @input="updateLocation('longitude', $event.target.value)"
        />
      </label>
    </div>

    <!-- Button to get user's current location -->
    <div style="margin-top: 20px;">
      <button @click="getUserLocation">📍 Use My Current Location</button>
    </div>

    <!-- Map container -->
    <div id="map" style="height: 400px; width: 100%; margin-top: 20px;"></div>
  </div>
</template>