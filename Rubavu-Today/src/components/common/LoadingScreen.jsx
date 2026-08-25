import React from "react";
import logo from "../../Rubavu.jpeg";

const LoadingScreen = ({ message = "Birimo gutegurwa..." }) => (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 px-4">
        <div className="flex w-full max-w-sm flex-col items-center text-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-red-600 border-t-transparent p-1 shadow-2xl sm:h-28 sm:w-28">
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-red-400" />
                <img
                    src={logo}
                    alt="Rubavu Today"
                    className="h-full w-full rounded-full object-cover"
                />
            </div>
            <h1 className="mt-5 text-xl font-black text-white sm:text-2xl">
                Rubavu Today
            </h1>
            <p className="mt-2 text-sm text-slate-400">{message}</p>
        </div>
    </div>
);

export default LoadingScreen;
