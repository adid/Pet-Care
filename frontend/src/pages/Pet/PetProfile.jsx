import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const PetProfile = () => {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPetProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:3000/pet/profile/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch pet profile");
        const data = await res.json();
        setPet(data.pet);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPetProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Loading pet profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <p className="text-lg text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Pet not found.</p>
      </div>
    );
  }

  const getAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center">
            <img
              src={`http://localhost:3000${pet.profilePhoto}`}
              alt={pet.name}
              className="w-32 h-32 rounded-full object-cover"
            />
            <div className="sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
              <p className="text-md text-gray-600">{pet.breed}</p>
              <p className="text-sm text-gray-500">{pet.status}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">About</h2>
          <p className="text-gray-700">
            {pet.description || "No description available."}
          </p>
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Details</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <li>
              <strong>Species:</strong> {pet.species}
            </li>
            <li>
              <strong>Age:</strong> {getAge(pet.dateOfBirth)} years
            </li>
            <li>
              <strong>Color:</strong> {pet.color}
            </li>
          </ul>
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Traits</h2>
          <div className="flex flex-wrap gap-2">
            {pet.traits && pet.traits.length > 0 ? (
              pet.traits.map((trait, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full"
                >
                  {trait}
                </span>
              ))
            ) : (
              <p className="text-gray-500">No traits listed.</p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Health Records
          </h2>
          <ul className="list-disc list-inside">
            {pet.healthRecords && pet.healthRecords.length > 0 ? (
              pet.healthRecords.map((record, index) => (
                <li key={index}>{record}</li>
              ))
            ) : (
              <p className="text-gray-500">No health records available.</p>
            )}
          </ul>
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Photos</h2>
          {pet.photos && pet.photos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {pet.photos.map((photo, index) => (
                <img
                  key={index}
                  src={`http://localhost:3000${photo}`}
                  alt={`${pet.name} ${index + 1}`}
                  className="w-full h-40 object-cover rounded-lg"
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No additional photos available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetProfile;
