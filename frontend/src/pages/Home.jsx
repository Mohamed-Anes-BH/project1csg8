const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Welcome to Our Platform
          </h1>
          <p className="text-xl text-gray-600">
            Your journey starts here
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-blue-600 text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Fast & Reliable
            </h3>
            <p className="text-gray-600">
              Experience lightning-fast performance with our optimized platform.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-blue-600 text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Secure
            </h3>
            <p className="text-gray-600">
              Your data is protected with industry-leading security measures.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-blue-600 text-4xl mb-4">💡</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Innovative
            </h3>
            <p className="text-gray-600">
              Stay ahead with cutting-edge features and regular updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
