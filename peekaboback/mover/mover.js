const axios = require("axios");

const apiUrl = process.env.API_URL || "http://app";
const gpsId = process.env.GPS_ID || "abc123";

function generateRandomLocation(baseLat, baseLong, radius = 0.0003) {
  const latOffset = (Math.random() - 0.5) * radius * 2;
  const longOffset = (Math.random() - 0.5) * radius * 2;
  return {
    latitude: baseLat + latOffset,
    longitude: baseLong + longOffset,
  };
}


const baseLat = 43.624365;
const baseLong = 3.923660;


async function moveBird() {
  const newLoc = generateRandomLocation(baseLat, baseLong);
  const url = `${apiUrl}/bird/${gpsId}/locations`;

  try {
    const response = await axios.post(url, {
      locations: [newLoc],
    });
    console.log(`[${new Date().toISOString()}] Sent location:`, newLoc);
  } catch (error) {
    console.error("Error sending location:", error.message);
  }
}

setInterval(moveBird, 20000);
