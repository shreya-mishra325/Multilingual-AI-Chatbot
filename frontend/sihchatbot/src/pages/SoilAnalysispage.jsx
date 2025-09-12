import { Camera, Upload } from "lucide-react";
import { Link } from "react-router-dom";

export default function SoilAnalysisPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link to="/" className="text-green-600 dark:text-green-400 mb-4 block">
        ← Back
      </Link>
      <h2 className="text-3xl font-bold mb-2">Soil Analysis</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Get instant soil analysis with AI-powered recommendations
      </p>

      <div className="space-y-6">
        <div className="p-6 rounded-xl bg-green-100 dark:bg-green-800 text-center">
          <Camera className="w-12 h-12 mx-auto text-green-600" />
          <h3 className="text-xl font-semibold mt-2">Take Photo</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
            Use your camera to capture soil sample
          </p>
          <ul className="mt-3 text-left list-disc list-inside text-green-700 dark:text-green-300">
            <li>Hold camera 1–2 feet above soil</li>
            <li>Ensure good lighting</li>
            <li>Include multiple soil areas</li>
          </ul>
        </div>

        <div className="p-6 rounded-xl bg-blue-100 dark:bg-blue-800 text-center">
          <Upload className="w-12 h-12 mx-auto text-blue-600" />
          <h3 className="text-xl font-semibold mt-2">Upload Photo</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
            Select an existing soil photo from your device
          </p>
          <ul className="mt-3 text-left list-disc list-inside text-blue-700 dark:text-blue-300">
            <li>JPG, PNG formats supported</li>
            <li>Clear, well-lit photos work best</li>
            <li>Max file size: 10MB</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
