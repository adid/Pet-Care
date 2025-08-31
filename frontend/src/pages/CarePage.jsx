// import React, { useState, useEffect, useCallback } from "react";
// import { careApi } from "../lib/api";

// const CarePage = () => {
//   const [services, setServices] = useState([]);
//   const [appointments, setAppointments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedService, setSelectedService] = useState(null);
//   const [bookingModal, setBookingModal] = useState(false);
//   const [filter, setFilter] = useState('all');
//   const [bookingForm, setBookingForm] = useState({
//     serviceId: '',
//     date: '',
//     time: '',
//     petName: '',
//     petType: '',
//     notes: ''
//   });
//   const [message, setMessage] = useState({ type: '', text: '' });

//   const fetchServices = useCallback(async (filterCategory = filter) => {
//     try {
//       setLoading(true);
//       const response = await careApi.getServices(filterCategory !== 'all' ? { category: filterCategory } : {});
//       setServices(Array.isArray(response) ? response : response.data || []);
//     } catch (error) {
//       console.error('Failed to fetch services:', error);
//       setMessage({ type: 'error', text: 'Failed to fetch services' });
//       setServices([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [filter]);

//   const fetchAppointments = useCallback(async () => {
//     try {
//       const response = await careApi.getAppointments();
//       setAppointments(Array.isArray(response) ? response : response.data || []);
//     } catch (error) {
//       console.error('Failed to fetch appointments:', error);
//       setAppointments([]);
//     }
//   }, []);

//   useEffect(() => {
//     fetchServices();
//     fetchAppointments();
//   }, [fetchServices, fetchAppointments]);

//   const handleBookService = (service) => {
//     setSelectedService(service);
//     setBookingForm({ ...bookingForm, serviceId: service._id });
//     setBookingModal(true);
//   };

//   const handleBookingSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await careApi.bookAppointment(bookingForm);
//       setMessage({ type: 'success', text: 'Appointment booked successfully!' });
//       setBookingModal(false);
//       setBookingForm({
//         serviceId: '',
//         date: '',
//         time: '',
//         petName: '',
//         petType: '',
//         notes: ''
//       });
//       fetchAppointments();
//     } catch (error) {
//       setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to book appointment' });
//     }
//   };

//   const handleInputChange = (e) => {
//     setBookingForm({
//       ...bookingForm,
//       [e.target.name]: e.target.value
//     });
//   };

//   const filterServices = (category) => {
//     setFilter(category);
//     setLoading(true);
//     fetchServices(category);
//   };

//   const seedSampleServices = async () => {
//     try {
//       setLoading(true);
//       await careApi.seedServices();
//       setMessage({ type: 'success', text: 'Sample services added successfully!' });
//       fetchServices();
//     } catch {
//       setMessage({ type: 'error', text: 'Failed to seed services' });
//     }
//   };

//   const getServiceIcon = (category) => {
//     const icons = {
//       consultation: '🩺',
//       grooming: '✂️',
//       training: '🎓',
//       boarding: '🏠',
//       emergency: '🚨',
//       vaccination: '💉',
//       dental: '🦷',
//       nutrition: '🥗'
//     };
//     return icons[category] || '🐾';
//   };

//   const getPriorityColor = (priority) => {
//     const colors = {
//       low: 'bg-green-100 text-green-800',
//       medium: 'bg-purple-100 text-purple-800',
//       high: 'bg-pink-100 text-pink-800'
//     };
//     return colors[priority] || 'bg-gray-100 text-gray-800';
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading care services...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-16">
//       <div className="max-w-7xl mx-auto px-4">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold text-purple-700 mb-4">
//             Professional Pet Care Services
//           </h1>
//           <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
//             Comprehensive healthcare and wellness services for your beloved pets.
//             From routine checkups to specialized treatments, we're here for you.
//           </p>
//           {(services || []).length === 0 && !loading && (
//             <button
//               onClick={seedSampleServices}
//               className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-medium hover:scale-105 transition-all cursor-pointer"
//             >
//               Load Sample Services
//             </button>
//           )}
//         </div>

//         {/* Message */}
//         {message.text && (
//           <div className={`mb-6 p-4 rounded-lg ${
//             message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
//           }`}>
//             {message.text}
//             <button
//               onClick={() => setMessage({ type: '', text: '' })}
//               className="float-right text-lg font-bold cursor-pointer"
//             >
//               ×
//             </button>
//           </div>
//         )}

//         {/* Filter Buttons */}
//         <div className="flex flex-wrap justify-center gap-3 mb-8">
//           {['all', 'consultation', 'grooming', 'training', 'boarding', 'emergency'].map((category) => (
//             <button
//               key={category}
//               onClick={() => filterServices(category)}
//               className={`px-6 py-2 rounded-full font-medium transition-all cursor-pointer ${
//                 filter === category
//                   ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
//                   : 'bg-white text-gray-700 hover:bg-purple-50 shadow-md border border-purple-100'
//               }`}
//             >
//               {category.charAt(0).toUpperCase() + category.slice(1)}
//             </button>
//           ))}
//         </div>

//         {/* Services Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
//           {(services || []).map((service) => (
//             <div
//               key={service._id}
//               className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
//             >
//               <div className="p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <span className="text-4xl">{getServiceIcon(service.category)}</span>
//                   <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(service.priority)}`}>
//                     {service.priority}
//                   </span>
//                 </div>

//                 <h3 className="text-xl font-bold text-purple-600 mb-2">{service.name}</h3>
//                 <p className="text-gray-600 mb-4 line-clamp-3">{service.description}</p>

//                 <div className="flex items-center justify-between mb-4">
//                   <span className="text-2xl font-bold text-pink-600">${service.price}</span>
//                   <span className="text-sm text-gray-500">{service.duration} mins</span>
//                 </div>

//                 {service.features && service.features.length > 0 && (
//                   <div className="mb-4">
//                     <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
//                     <ul className="text-sm text-gray-600 space-y-1">
//                       {service.features.slice(0, 3).map((feature, idx) => (
//                         <li key={idx} className="flex items-center">
//                           <span className="text-purple-500 mr-2">✓</span>
//                           {feature}
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}

//                 <button
//                   onClick={() => handleBookService(service)}
//                   className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 text-white py-3 px-4 rounded-lg font-medium transition-all cursor-pointer"
//                 >
//                   Book Now
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Appointments Section */}
//         {appointments.length > 0 && (
//           <div className="bg-white rounded-xl shadow-lg p-6">
//             <h2 className="text-2xl font-bold text-purple-700 mb-6">Your Appointments</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {appointments.slice(0, 6).map((appointment) => (
//                 <div key={appointment._id} className="border rounded-lg p-4">
//                   <div className="flex items-center justify-between mb-2">
//                     <h4 className="font-semibold text-gray-800">{appointment.petName}</h4>
//                     <span className={`px-2 py-1 rounded text-xs font-medium ${
//                       appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
//                       appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
//                       'bg-gray-100 text-gray-800'
//                     }`}>
//                       {appointment.status}
//                     </span>
//                   </div>
//                   <p className="text-sm text-gray-600 mb-1">
//                     📅 {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
//                   </p>
//                   <p className="text-sm text-gray-600">
//                     🐾 {appointment.petType}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Booking Modal */}
//       {bookingModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <h3 className="text-xl font-bold text-purple-700">
//                   Book {selectedService?.name}
//                 </h3>
//                 <button
//                   onClick={() => setBookingModal(false)}
//                   className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
//                 >
//                   ×
//                 </button>
//               </div>

//               <form onSubmit={handleBookingSubmit} className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Pet Name *
//                   </label>
//                   <input
//                     type="text"
//                     name="petName"
//                     value={bookingForm.petName}
//                     onChange={handleInputChange}
//                     required
//                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
//                     placeholder="Enter your pet's name"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Pet Type *
//                   </label>
//                   <select
//                     name="petType"
//                     value={bookingForm.petType}
//                     onChange={handleInputChange}
//                     required
//                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   >
//                     <option value="">Select pet type</option>
//                     <option value="dog">Dog</option>
//                     <option value="cat">Cat</option>
//                     <option value="bird">Bird</option>
//                     <option value="rabbit">Rabbit</option>
//                     <option value="other">Other</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Preferred Date *
//                   </label>
//                   <input
//                     type="date"
//                     name="date"
//                     value={bookingForm.date}
//                     onChange={handleInputChange}
//                     required
//                     min={new Date().toISOString().split('T')[0]}
//                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Preferred Time *
//                   </label>
//                   <select
//                     name="time"
//                     value={bookingForm.time}
//                     onChange={handleInputChange}
//                     required
//                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   >
//                     <option value="">Select time</option>
//                     <option value="09:00">9:00 AM</option>
//                     <option value="10:00">10:00 AM</option>
//                     <option value="11:00">11:00 AM</option>
//                     <option value="12:00">12:00 PM</option>
//                     <option value="14:00">2:00 PM</option>
//                     <option value="15:00">3:00 PM</option>
//                     <option value="16:00">4:00 PM</option>
//                     <option value="17:00">5:00 PM</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Additional Notes
//                   </label>
//                   <textarea
//                     name="notes"
//                     value={bookingForm.notes}
//                     onChange={handleInputChange}
//                     rows={3}
//                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
//                     placeholder="Any special requirements or notes..."
//                   />
//                 </div>

//                 <div className="flex gap-3 pt-4">
//                   <button
//                     type="button"
//                     onClick={() => setBookingModal(false)}
//                     className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 text-white py-2 px-4 rounded-lg transition-all cursor-pointer"
//                   >
//                     Book Appointment
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CarePage;

import React, { useEffect, useState } from "react";
import { MapPin, RefreshCw, Phone, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NearbyServices() {
  const [status, setStatus] = useState("idle"); // idle | getting | loading | ready | error
  const [error, setError] = useState("");
  const [services, setServices] = useState([]);
  const [radius, setRadius] = useState(5000); // meters
  const navigate = useNavigate();

  useEffect(() => {
    getNearby();
  }, []);

  function getNearby(customCoords) {
    setStatus("getting");
    const onSuccess = async (pos) => {
      const lat = customCoords?.lat ?? pos.coords.latitude;
      const lng = customCoords?.lng ?? pos.coords.longitude;

      try {
        setStatus("loading");
        const url = `http://localhost:3000/api/care/services/nearby?lat=${lat}&lng=${lng}&radius=${radius}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch services");
        setServices(data.services);
        setStatus("ready");
      } catch (e) {
        setError(e.message);
        setStatus("error");
      }
    };

    const onError = (err) => {
      setError(err.message || "Could not get location.");
      setStatus("error");
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        timeout: 10000,
      });
    } else {
      setError("Geolocation is not supported by this browser.");
      setStatus("error");
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-4">
        <MapPin className="text-purple-600" /> Nearby Pet Care Services
      </h2>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          Search radius (m):
          <input
            type="number"
            min={500}
            step={500}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="border rounded px-2 py-1 w-24 focus:ring focus:ring-purple-300 outline-none"
          />
        </label>
        <button
          onClick={() => getNearby()}
          disabled={status === "getting" || status === "loading"}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Status Messages */}
      {status === "getting" && (
        <p className="text-gray-500">Requesting your location…</p>
      )}
      {status === "loading" && (
        <p className="text-gray-500">Loading nearby services…</p>
      )}
      {status === "error" && (
        <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg mb-4">
          <p className="flex items-center gap-2 font-semibold">
            <AlertCircle size={16} /> Error: {error}
          </p>
          <p className="text-sm mt-1">
            Allow location access in your browser and click “Refresh”. Or use
            fallback:{" "}
            <button
              className="underline text-purple-600 ml-1"
              onClick={() => getNearby({ lat: 23.777176, lng: 90.399452 })}
            >
              Dhaka Center
            </button>
          </p>
        </div>
      )}

      {/* Results */}
      {status === "ready" && services.length === 0 && (
        <p className="text-gray-600">No services found within this radius.</p>
      )}

      <div className="grid gap-4 mt-4">
        {services.map((s) => (
          <div
            key={s._id}
            onClick={() => navigate(`services/${s._id}`)}
            className="bg-white shadow-md rounded-xl p-4 border hover:shadow-lg transition cursor-pointer"
          >
            {/* Name + Distance */}
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-gray-800">
                {s.name}
                {console.log(s)}
              </h3>
              {s.distance && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  {(s.distance / 1000).toFixed(1)} km away
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 capitalize">{s.category}</p>
            {s.location?.address && (
              <p className="text-sm text-gray-500 mt-1">{s.location.address}</p>
            )}
            {s.phone && (
              <p className="text-sm text-gray-700 mt-2 flex items-center gap-2">
                <Phone size={14} className="text-purple-600" /> {s.phone}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
