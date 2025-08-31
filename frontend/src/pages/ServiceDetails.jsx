import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// Booking Form
function BookingForm({ serviceId, servicesList }) {
  const [form, setForm] = useState({
    services: [],
    name: "",
    email: "",
    phone: "",
    petName: "",
    petType: "Dog",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    notes: "",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleServiceToggle(service) {
    setForm((prev) => {
      const alreadySelected = prev.services.includes(service);
      return {
        ...prev,
        services: alreadySelected
          ? prev.services.filter((s) => s !== service)
          : [...prev.services, service],
      };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccess(""); // reset old messages
    setError("");

    try {
      const res = await fetch("http://localhost:3000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: serviceId, // pass down from parent ServiceDetails
          ...form,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to book");

      //alert("✅ Booking created successfully!");
      toast.success("Booking created successfully!");

      setForm({
        services: [],
        name: "",
        email: "",
        phone: "",
        petName: "",
        petType: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        zip: "",
        notes: "",
      });
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div>
      {success && (
        <div className="bg-green-100 text-green-800 p-2 rounded">{success}</div>
      )}
      {error && (
        <div className="bg-red-100 text-red-800 p-2 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        {/* Services */}
        <div>
          <p className="font-medium mb-2">Select Services</p>
          <div className="grid grid-cols-2 gap-2">
            {servicesList.map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.services.includes(s)}
                  onChange={() => handleServiceToggle(s)}
                />
                {s}
              </label>
            ))}
          </div>
        </div>

        {/* Personal Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            name="name"
            placeholder="Your Name (Required)"
            value={form.name}
            onChange={handleChange}
            required
            className="border px-3 py-2 rounded"
          />
          <input
            name="email"
            type="email"
            placeholder="Email (Required)"
            value={form.email}
            onChange={handleChange}
            required
            className="border px-3 py-2 rounded"
          />
          <input
            name="phone"
            type="tel"
            placeholder="Phone (Required)"
            value={form.phone}
            onChange={handleChange}
            required
            className="border px-3 py-2 rounded"
          />
        </div>

        {/* Pet Info */}
        <div className="grid grid-cols-2 gap-4">
          <input
            name="petName"
            placeholder="Pet Name(s) (Required)"
            value={form.petName}
            onChange={handleChange}
            required
            className="border px-3 py-2 rounded"
          />
          <input
            name="petType"
            value={form.petType}
            onChange={handleChange}
            className="border px-3 py-2 rounded"
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <input
            name="address1"
            placeholder="Street Address"
            value={form.address1}
            onChange={handleChange}
            className="border px-3 py-2 rounded w-full"
          />
          <input
            name="address2"
            placeholder="Address Line 2"
            value={form.address2}
            onChange={handleChange}
            className="border px-3 py-2 rounded w-full"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              className="border px-3 py-2 rounded"
            />
            <input
              name="state"
              placeholder="State / Province / Region"
              value={form.state}
              onChange={handleChange}
              className="border px-3 py-2 rounded"
            />
          </div>
          <input
            name="zip"
            placeholder="ZIP / Postal Code"
            value={form.zip}
            onChange={handleChange}
            className="border px-3 py-2 rounded w-full"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block font-medium mb-2">
            Please Describe Your Pet Service Needs & When They are Needed
          </label>
          <textarea
            name="notes"
            rows="4"
            value={form.notes}
            onChange={handleChange}
            className="border px-3 py-2 rounded w-full"
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
}

// Service Details Page
export default function ServiceDetails() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3000/api/care/services/${id}`)
      .then((res) => res.json())
      .then((data) => {
        // backend must return { service: {...} }
        setService(data.service || data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading service details...</p>;
  if (!service) return <p>Service not found.</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 pt-20">
      <h2 className="text-3xl text-center font-bold">{service.name}</h2>
      {/* <p className="text-gray-600">{service.category}</p> */}
      <p className="text-gray-500 text-center">{service.location?.address}</p>
      {service.phone && <p className="mt-1 text-center">📞 {service.phone}</p>}

      {/* Dynamic Booking Form */}
      <BookingForm
        serviceId={service._id}
        servicesList={service.servicesOffered || []}
      />
    </div>
  );
}
