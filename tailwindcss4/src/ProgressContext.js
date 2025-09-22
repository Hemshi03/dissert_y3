import { createContext, useContext, useState } from "react";

// Create context
const ProgressContext = createContext();

// Hook to use context easily
export const useProgress = () => useContext(ProgressContext);

// Provider component to wrap your app
export const ProgressProvider = ({ children }) => {
    const [progress, setProgress] = useState(null); // initially null

    return (
        <ProgressContext.Provider value={{ progress, setProgress }}>
            {children}
        </ProgressContext.Provider>
    );
};
