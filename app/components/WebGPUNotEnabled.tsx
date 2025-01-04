"use client";
import React from "react";

const WebGPUNotEnabled: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-emerald-900 to-emerald-700 p-4 text-emerald-50">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl sm:text-6xl font-extrabold mb-6">
          WebGPU Not Enabled
        </h1>
        <p className="text-xl sm:text-2xl mb-8">
          Unfortunately, your browser doesn&apos;t support WebGPU or it&apos;s
          not enabled.
        </p>
        <p className="text-lg mb-8">
          WebGPU is required to run the Qwen Code Interpreter efficiently in
          your browser.
        </p>
        <p className="text-lg">
          Please update your browser to the latest version and ensure WebGPU is
          enabled to use this feature.
        </p>
      </div>
    </div>
  );
};

export default WebGPUNotEnabled;
