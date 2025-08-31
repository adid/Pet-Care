import { Heart, MapPin, Info } from "lucide-react";

const ProfileHeader = ({ userProfile }) => {
  const username = userProfile.email
    ? `@${userProfile.email.split("@")[0]}`
    : "@username";

  return (
    <div className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden">
      <div className="relative bg-gradient-to-r from-purple-600 to-purple-200 p-6 text-white h-40 flex items-center justify-center">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Heart className="w-8 h-8" />
          PetCare User Profile
        </h1>
      </div>
      <div className="flex flex-col items-center -mt-16 p-4">
        {" "}
        {/* Adjusted margin-top */}
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
          {" "}
          {/* Added bg-gray-100 for placeholder */}
          <img
            src={
              userProfile.profileImage
                ? `http://localhost:3000${userProfile.profileImage}`
                : "https://via.placeholder.com/150"
            }
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/150";
            }}
          />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-800">
          {userProfile.name || "Name"}
        </h2>
        <p className="text-purple-600 text-lg">{username}</p>
        <div className="mt-4 text-gray-600 text-center max-w-2xl">
          <p className="flex items-center justify-center gap-2">
            <MapPin className="w-5 h-5 text-purple-500" />
            {userProfile.location || "Location not specified"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
