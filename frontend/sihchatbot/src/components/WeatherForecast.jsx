import React, { useEffect, useState } from "react";

const WeatherForecast = () => {
  const [weather, setWeather] = useState(null);

  
  useEffect(() => {
   
    const dummyData = {
      today: { temp: 28, condition: "Sunny", humidity: 65, wind: 12 },
      week: [
        { day: "Mon", temp: 30, condition: "Sunny" },
        { day: "Tue", temp: 29, condition: "Cloudy" },
        { day: "Wed", temp: 27, condition: "Rainy" },
        { day: "Thu", temp: 28, condition: "Sunny" },
        { day: "Fri", temp: 26, condition: "Thunderstorm" },
        { day: "Sat", temp: 31, condition: "Sunny" },
        { day: "Sun", temp: 29, condition: "Cloudy" },
      ],
    };
    setWeather(dummyData);
  }, []);

  if (!weather) return <p className="text-center">Loading weather...</p>;

  return (
    <section className=" p-6 rounded-2xl shadow-md bg-green-50 dark:bg-gray-900">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        🌤 Weather Forecast
      </h2>

      
      <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-200 to-orange-300 dark:from-yellow-600 dark:to-orange-700 text-gray-900 dark:text-white shadow-md">
        <h3 className="text-xl font-semibold mb-2">Today</h3>
        <p className="text-lg">
          {weather.today.condition}, {weather.today.temp}°C
        </p>
        <p>💧 {weather.today.humidity}% | 🌬 {weather.today.wind} km/h</p>
      </div>

      
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mt-6">
        {weather.week.map((day, index) => (
          <div
            key={index}
            className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-center shadow"
          >
            <h4 className="font-semibold text-gray-800 dark:text-gray-100">
              {day.day}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {day.condition}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {day.temp}°C
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WeatherForecast;
