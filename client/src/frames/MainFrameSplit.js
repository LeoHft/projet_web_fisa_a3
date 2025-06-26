import "../App.css";
import LeftFrame from "./LeftFrame";
import MiddleFrame from "./MiddleFrame";
import RightFrame from "./RightFrame";
import { windyBg } from "../styles/WindyStyle";
import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

function MainFrameSplit() {
  const [showRight, setShowRight] = useState(false);

  return (
    <div style={windyBg} className="relative">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-white bg-opacity-50 backdrop-blur-md z-50 flex items-center justify-between px-4">
        <div className="flex items-center">
          <img
            src="/logo192.png"
            alt="Logo Breezy"
            className="h-10 w-10 mr-2"
          />
          <h1 className="text-xl font-bold text-gray-800">Breezy</h1>
        </div>
        <button onClick={() => setShowRight(true)}>
          <Bars3Icon className="h-6 w-6 text-gray-700" />
        </button>
      </div>

      <div className="md:hidden">
        <LeftFrame />
      </div>

      {/* Overlay for Right Frame on mobile */}
      {showRight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div
            className={`w-4/5 bg-white bg-opacity-80 backdrop-blur-md h-full p-4 overflow-y-auto transform transition-transform duration-300 ${
              showRight ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <img
                src="/logo192.png"
                alt="Logo Breezy"
                className="h-10 w-10"
              />
              <button onClick={() => setShowRight(false)}>
                <XMarkIcon className="h-6 w-6 text-gray-700" />
              </button>
            </div>
            <RightFrame />
          </div>
          <div className="flex-1" onClick={() => setShowRight(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="h-screen w-full flex justify-center items-center App pt-16 md:pt-0">
        <div className="flex h-[98%] w-[95%] max-w-[1800px] mx-auto">
          <aside className="hidden md:block w-full md:w-[15%] mr-2.5 rounded-lg overflow-hidden">
            <LeftFrame />
          </aside>

          <div className="w-full md:w-[70%] max-h-[calc(100vh-9rem)] md:max-h-full lg:mx-2.5 mx-0 rounded-lg overflow-y-auto">
            <MiddleFrame />
          </div>

          <aside className="hidden md:block w-full md:w-[15%] ml-2.5 rounded-lg overflow-hidden">
            <RightFrame />
          </aside>
        </div>
      </div>
    </div>
  );
}

export default MainFrameSplit;
