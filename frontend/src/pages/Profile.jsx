const Profile = () => {
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    image: 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff&size=200',
    bio: 'Web developer passionate about creating amazing user experiences.',
    joined: 'January 2024'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-32"></div>
          
          {/* Profile Info */}
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 mb-6">
              <img
                src={user.image}
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />
              <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            {/* Bio Section */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">About</h2>
              <p className="text-gray-700">{user.bio}</p>
            </div>

            {/* Info Grid */}
            <div className="grid md:grid-cols-2 gap-6 mt-6 border-t pt-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Member Since
                </h3>
                <p className="text-gray-800">{user.joined}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Email
                </h3>
                <p className="text-gray-800">{user.email}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-4">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Edit Profile
              </button>
              <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
