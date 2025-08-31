import React, { useEffect, useState } from "react";
import { Calendar, MapPin, Heart, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const QuickActions = () => {
  const [nearbyHomes, setNearbyHomes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const upcomingEvents = [
    { title: "Pet Adoption Fair", date: "Dec 15", location: "Central Park" },
    { title: "Vet Health Checkup", date: "Dec 18", location: "PetCare Clinic" },
    {
      title: "Training Workshop",
      date: "Dec 22",
      location: "Community Center",
    },
  ];

  useEffect(() => {
    // Request user's location and fetch data from backend
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          try {
            const res = await fetch(
              `http://localhost:3000/api/care/services/nearby?lat=${lat}&lng=${lng}&radius=10000`
            );
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to fetch");

            // Map backend data into the format UI expects
            const mapped = data.services.map((s) => ({
              name: s.name,
              distance: s.distance
                ? `${(s.distance / 1000).toFixed(1)} km`
                : "Nearby",
              rating: s.rating || 4.5, // You can replace with actual rating field if you store it
              slots: s.slots || Math.floor(Math.random() * 5) + 1, // Random until real data available
            }));

            setNearbyHomes(mapped);
          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          setError("Location access denied.");
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setError("Geolocation not supported in this browser.");
    }
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Nearby Adoption Homes */}
      <Card className="shadow-md bg-white/80 backdrop-blur-sm">
        <div className="flex items-center border-b border-gray-200 px-4 py-2">
          <MapPin size={20} className="text-purple-600 mr-2" />
          <h2 className="text-base font-semibold">Nearby Adoption Homes</h2>
        </div>
        <CardContent className="space-y-3">
          {loading && (
            <p className="text-sm text-gray-500">Fetching nearby homes…</p>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          {!loading && !error && nearbyHomes.length === 0 && (
            <p className="text-sm text-gray-500">No homes found nearby.</p>
          )}
          {nearbyHomes.map((home, index) => (
            <div
              key={index}
              className="rounded-lg p-3 space-y-2"
              style={{
                background: "linear-gradient(to right, #f5f3ff, #ffe4e6)",
              }}
            >
              <div className="flex justify-between items-start">
                <span className="font-medium text-sm">{home.name}</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  ⭐ {home.rating}
                </span>
              </div>
              <p className="text-xs text-gray-600">{home.distance} away</p>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-600">
                  {home.slots} slots available
                </p>
                <Button variant="outline" className="h-7 px-3 text-xs">
                  Book
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

     

    </div>
  );
};

export default QuickActions;
