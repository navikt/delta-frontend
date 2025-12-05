"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function WrappedLoading() {
    return (
        <div
            className="w-full min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #312e81, #6b21a8, #312e81)' }}
        >
            {/* Ambient Background Animation - simplified and subtle */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        opacity: [0.3, 0.5, 0.3],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[80px]"
                />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center p-8 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative mb-12"
                >
                    {/* Simplified Glowing Spinner */}
                    <div className="relative w-24 h-24">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full border-4 border-white/20 border-t-white"
                        />
                        <div className="absolute inset-4 bg-white/10 rounded-full backdrop-blur-sm" />
                    </div>
                </motion.div>

                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Klargjør din oppsummering...
                </h1>
                <p className="text-xl text-indigo-100">
                    Vent litt mens vi henter statistikken din ✨
                </p>

                {/* Progress Bar */}
                <div className="w-64 h-1.5 bg-black/20 rounded-full mt-8 overflow-hidden backdrop-blur-sm">
                    <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                        className="h-full bg-white/80"
                    />
                </div>
            </div>
        </div>
    );
}
