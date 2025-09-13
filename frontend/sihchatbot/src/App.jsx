import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Hero from "./components/hero";
import WeatherForecast from "./components/WeatherForecast";
import QuickActions from "./components/QuickActions";
import Footer from "./components/Footer";


import SoilAnalysisPage from "./pages/SoilAnalysispage";
import MandiPricesPage from "./pages/Mandipricespage";
import CropGuidesPage from "./pages/CropGuidespage";
import ChatbotPage from "./pages/Chatbotpage";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-950 text-gray-800 dark:text-gray-200">
      <Navbar />
      <Routes>
        {/* Landing page */}
        <Route
          path="/"
          element={
            <>
              <Hero />
              <WeatherForecast/>
              <QuickActions />
            </>
          }
        />
        
        <Route path="/soil-analysis" element={<SoilAnalysisPage />} />
        <Route path="/mandi-prices" element={<MandiPricesPage />} />
        <Route path="/crop-guides" element={<CropGuidesPage />} />
        <Route path="/chatbot" element={<ChatbotPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;

