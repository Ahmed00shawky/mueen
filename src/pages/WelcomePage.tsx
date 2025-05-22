import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const WelcomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading assets
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    navigate("/login");
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-blue-500 to-purple-600 animate-gradient-x">
      <div className="animate-fade-in text-center backdrop-blur-sm bg-white/10 p-12 rounded-3xl shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 border-t-4 border-white rounded-full animate-spin"></div>
            <p className="text-white text-xl">Loading...</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="h-32 w-32 bg-white rounded-full mx-auto mb-6 flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="mueen logo" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">mueen</h1>
              <h2 className="text-2xl font-medium text-blue-100 mb-6">مُعين</h2>
              <p className="text-lg text-blue-100 mb-8">Your Personal Work Assistant</p>
            </div>
            <Button 
              onClick={handleStart}
              size="lg" 
              className="px-12 py-6 text-lg bg-white hover:bg-blue-50 text-blue-700"
            >
              Start
            </Button>
          </>
        )}
      </div>
      <footer className="absolute bottom-6 text-center text-blue-100">
        <p>© {new Date().getFullYear()} Ahmed Shawky Youssef</p>
      </footer>
    </div>
  );
};

export default WelcomePage;
