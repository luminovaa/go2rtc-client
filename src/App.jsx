
import React, { useState } from "react";

import Go2RTCPlayer from "./stream-card";



export default function App() {

  const [selected, setSelected] = useState("cctv_1");



  const cameras = ["cctv_1", "cctv_2"];



  return (

    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center space-y-6 p-6">

      <h1 className="text-3xl font-bold text-cyan-400">

        🎥 Live CCTV Monitor
      </h1>
      <div className="flex space-x-4">

        {cameras.map((cam) => (
          <button
            key={cam}
            onClick={() => setSelected(cam)}
            className={`px-4 py-2 rounded-lg transition ${
              selected === cam
                ? "bg-cyan-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {cam.toUpperCase()}
          </button>
        ))}
      </div>
      <Go2RTCPlayer src={selected} />
    </div>
  );
}