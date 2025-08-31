import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfo from "@/components/profile/ProfileInfo";
const Profile = () => {
  const [editingProfile, setEditingProfile] = useState(false);

  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    profileImage: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/profile/userInfo", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch user profile");
        const data = await res.json();

        setUserProfile({
          name: data.name,
          email: data.email,
          phone: data.phone,
          location: data.location || "", // Changed default to empty string
          bio: data.bio || "", // Changed default to empty string
          profileImage: data.photoURL || "",
        });
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchUserProfile();
  }, []);

  const handleProfileUpdate = () => {
    setEditingProfile(false);
  };

  return (
    <div className="min-h-screen mt-15 bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <ProfileHeader userProfile={userProfile} />
        <ProfileInfo
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          editingProfile={editingProfile}
          setEditingProfile={setEditingProfile}
          handleProfileUpdate={handleProfileUpdate}
        />
      </div>
    </div>
  );
};

export default Profile;
