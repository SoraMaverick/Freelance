import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values'; // Needed for uuid on some platforms
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY_TRAINING_DAYS = 'trainingDaysData';
const STORAGE_KEY_USER_PROFILE = 'userProfileData';

// --- Training Day Data Management ---
export const loadTrainingDays = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY_TRAINING_DAYS);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error("Error loading training days:", e);
        return [];
    }
};

export const saveTrainingDays = async (trainingDays) => {
    try {
        const jsonValue = JSON.stringify(trainingDays);
        await AsyncStorage.setItem(STORAGE_KEY_TRAINING_DAYS, jsonValue);
    } catch (e) {
        console.error("Error saving training days:", e);
    }
};

export const addTrainingDay = (currentTrainingDays, dayName) => {
    const newDay = {
        id: uuidv4(),
        name: dayName,
        exercises: []
    };
    return [...currentTrainingDays, newDay];
};

export const deleteTrainingDay = (currentTrainingDays, dayId) => {
    return currentTrainingDays.filter(day => day.id !== dayId);
};

export const addExerciseToTrainingDay = (currentTrainingDays, trainingDayId, exerciseName) => {
    return currentTrainingDays.map(day => {
        if (day.id === trainingDayId) {
            const newExercise = {
                id: uuidv4(),
                name: exerciseName,
                history: []
            };
            return { ...day, exercises: [...day.exercises, newExercise] };
        }
        return day;
    });
};

export const deleteExercise = (currentTrainingDays, trainingDayId, exerciseId) => {
    return currentTrainingDays.map(day => {
        if (day.id === trainingDayId) {
            return {
                ...day,
                exercises: day.exercises.filter(ex => ex.id !== exerciseId)
            };
        }
        return day;
    });
};

export const addHistoryEntry = (currentTrainingDays, trainingDayId, exerciseId, newEntryData) => {
    return currentTrainingDays.map(day => {
        if (day.id === trainingDayId) {
            return {
                ...day,
                exercises: day.exercises.map(ex => {
                    if (ex.id === exerciseId) {
                        const newEntry = {
                            id: uuidv4(),
                            date: new Date().toISOString().slice(0, 10),
                            sets: parseInt(newEntryData.sets),
                            reps: newEntryData.reps.toLowerCase() === 'bw' ? 'BW' : parseFloat(newEntryData.reps),
                            weight: newEntryData.weight.toLowerCase() === 'bw' ? 'BW' : parseFloat(newEntryData.weight),
                        };
                        return { ...ex, history: [...ex.history, newEntry] };
                    }
                    return ex;
                }),
            };
        }
        return day;
    });
};

export const updateHistoryEntry = (currentTrainingDays, trainingDayId, exerciseId, entryId, updatedEntryData) => {
    return currentTrainingDays.map(day => {
        if (day.id === trainingDayId) {
            return {
                ...day,
                exercises: day.exercises.map(ex => {
                    if (ex.id === exerciseId) {
                        return {
                            ...ex,
                            history: ex.history.map(entry => {
                                if (entry.id === entryId) {
                                    return {
                                        ...entry,
                                        date: updatedEntryData.date,
                                        sets: parseInt(updatedEntryData.sets),
                                        reps: updatedEntryData.reps.toLowerCase() === 'bw' ? 'BW' : parseFloat(updatedEntryData.reps),
                                        weight: updatedEntryData.weight.toLowerCase() === 'bw' ? 'BW' : parseFloat(updatedEntryData.weight),
                                    };
                                }
                                return entry;
                            })
                        };
                    }
                    return ex;
                }),
            };
        }
        return day;
    });
};

export const deleteHistoryEntry = (currentTrainingDays, trainingDayId, exerciseId, historyEntryId) => {
    return currentTrainingDays.map(day => {
        if (day.id === trainingDayId) {
            return {
                ...day,
                exercises: day.exercises.map(ex => {
                    if (ex.id === exerciseId) {
                        return {
                            ...ex,
                            history: ex.history.filter(entry => entry.id !== historyEntryId)
                        };
                    }
                    return ex;
                }),
            };
        }
        return day;
    });
};


// --- User Profile Data Management ---
const DEFAULT_USER_PROFILE = {
    name: '',
    gender: '',
    weight: '',
    height: '',
};

export const loadUserProfile = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY_USER_PROFILE);
        return jsonValue != null ? JSON.parse(jsonValue) : DEFAULT_USER_PROFILE;
    } catch (e) {
        console.error("Error loading user profile:", e);
        return DEFAULT_USER_PROFILE;
    }
};

export const saveUserProfile = async (userProfile) => {
    try {
        const jsonValue = JSON.stringify(userProfile);
        await AsyncStorage.setItem(STORAGE_KEY_USER_PROFILE, jsonValue);
    } catch (e) {
        console.error("Error saving user profile:", e);
    }
};