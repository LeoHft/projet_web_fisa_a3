import React from "react";
import { motion } from "framer-motion";
import { windyBg, buttonStyle } from '../styles/WindyStyle';

export default function NotFoundPage() {
    return (
        <div style={windyBg} className="min-h-screen flex items-center justify-center px-2 sm:px-0">
            <div className="bg-white bg-opacity-50 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-12 flex flex-col items-center max-w-full sm:max-w-lg w-full">
                {/* Breezy title with a "windy" wavy animation */}
                <motion.h1
                    className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#66a6ff] relative z-10 mb-2"
                >
                    <motion.span
                        animate={{
                            y: [0, -8, 8, -8, 0],
                            transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                        }}
                        style={{ display: "inline-block" }}
                    >
                        B
                    </motion.span>
                    <motion.span
                        animate={{
                            y: [0, 8, -8, 8, 0],
                            transition: { repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.2 }
                        }}
                        style={{ display: "inline-block" }}
                    >
                        r
                    </motion.span>
                    <motion.span
                        animate={{
                            y: [0, -8, 8, -8, 0],
                            transition: { repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.4 }
                        }}
                        style={{ display: "inline-block" }}
                    >
                        e
                    </motion.span>
                    <motion.span
                        animate={{
                            y: [0, 8, -8, 8, 0],
                            transition: { repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.6 }
                        }}
                        style={{ display: "inline-block" }}
                    >
                        e
                    </motion.span>
                    <motion.span
                        animate={{
                            y: [0, -8, 8, -8, 0],
                            transition: { repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.8 }
                        }}
                        style={{ display: "inline-block" }}
                    >
                        z
                    </motion.span>
                    <motion.span
                        animate={{
                            y: [0, 8, -8, 8, 0],
                            transition: { repeat: Infinity, duration: 2, ease: "easeInOut", delay: 1.0 }
                        }}
                        style={{ display: "inline-block" }}
                    >
                        y
                    </motion.span>
                </motion.h1>
                <h1 className="text-5xl sm:text-6xl font-extrabold text-[#66a6ff] drop-shadow-lg mb-2 sm:mb-4">
                    404
                </h1>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#66a6ff] mb-1 sm:mb-2 text-center">
                    Page Non Trouvée
                </h2>
                <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8 text-center">
                    Oups ! La page que vous recherchez n'existe pas ou a été déplacée.
                </p>
                <a
                    href="/"
                    className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-[#89f7fe] to-[#66a6ff] text-white rounded-full shadow-lg hover:scale-105 transition-transform font-semibold text-base sm:text-lg"
                >
                    Retour à l'accueil
                </a>
            </div>
        </div>
    );
}
