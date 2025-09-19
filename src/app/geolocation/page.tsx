"use client";

import React, { useState } from "react";
import { haversine } from "./action";

const GeoLocation = () => {
  const [isInside, setIsInside] = useState<boolean | null>(null);

  const handleGeolocationOnClick = () => {
    console.log("Checking position...");
    const target = { lat: -8.549767, lon: 115.309687 }; // Example target location
    const radiusKm = 10; // allowed radius in km

    if (!navigator.geolocation) return;

    console.log("Requesting geolocation...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("Geolocation obtained:", pos);
        const userLat = pos.coords.latitude;
        const userLon = pos.coords.longitude;

        console.log("User Position:", userLat, userLon);
        console.log("Target Position:", target.lat, target.lon);

        const dist = haversine(userLat, userLon, target.lat, target.lon);
        setIsInside(dist <= radiusKm);
      },
      (err) => {
        console.error("❌ Geolocation error:", err);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            console.error("User denied permission.");
            break;
          case err.POSITION_UNAVAILABLE:
            console.error("Position unavailable.");
            break;
          case err.TIMEOUT:
            console.error("Request timed out.");
            break;
          default:
            console.error("Unknown error.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // fail after 10s
        maximumAge: 0,
      }
    );
  };

  return (
    <>
      <div>GeoLocation</div>

      <button onClick={handleGeolocationOnClick} className="my-2">
        Click to check your position
      </button>

      {isInside !== null ? (
        isInside ? (
          <p className="text-green-300">You are allowed to enter the building.</p>
        ) : (
          <p className="text-red-400">
            You are not allowed to enter the building. Please head to the nearest location.
          </p>
        )
      ) : null}
    </>
  );
};

export default GeoLocation;
