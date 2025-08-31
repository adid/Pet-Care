import React, { useEffect, useState } from "react";

export default function BookingsHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/api/bookings/") // API we created
      .then((res) => res.json())
      .then((data) => {
        setBookings(data.bookings || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading bookings...</p>;
  if (bookings.length === 0) return <p>No bookings found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">My Bookings</h2>
      <div className="space-y-4">
        {bookings.map((b) => (
          <div
            key={b._id}
            className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold">{b.serviceId?.name}</h3>
            <p className="text-sm text-gray-600">{b.serviceId?.category}</p>
            <p className="text-sm text-gray-500">
              {b.serviceId?.location?.address}
            </p>
            {/* <p className="mt-1">
              📅 {b.date} at {b.time}
            </p> */}
            <p>
              🐾 Pet Name: {b.petName} ({b.petType})
            </p>
            <p>📞 {b.phone}</p>
            {b.notes && <p className="italic text-gray-500">"{b.notes}"</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
