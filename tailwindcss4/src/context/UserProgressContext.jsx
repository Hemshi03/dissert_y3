// src/context/UserProgressContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { db, auth } from "../firebase.config";
import { doc, getDoc } from "firebase/firestore";

const UserProgressContext = createContext();

export const UserProgressProvider = ({ children }) => {
    const [userProgress, setUserProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProgress = async () => {
            if (!auth.currentUser) return;

            try {
                const docRef = doc(db, "user_progress", auth.currentUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setUserProgress(docSnap.data());
                } else {
                    setUserProgress({
                        currentChapter: 1,
                        completedLevels: [],
                        total_xp: 0,
                        rank: "Novice",
                        hintsUsed: 0,
                    });
                }
            } catch (err) {
                console.error("Error fetching user progress:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProgress();
    }, []);

    return (
        <UserProgressContext.Provider value={{ userProgress, setUserProgress, loading }}>
            {children}
        </UserProgressContext.Provider>
    );
};

export const useUserProgress = () => useContext(UserProgressContext);
