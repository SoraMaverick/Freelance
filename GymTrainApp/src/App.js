import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar'; 
import { View, Text } from 'react-native'; 

import AppNavigator from './AppNavigator';
import { darkThemeStyles } from './themes/themes'; 

import {
    loadTrainingDays,
    saveTrainingDays,
    addTrainingDay as dmAddTrainingDay,
    deleteTrainingDay as dmDeleteTrainingDay,
    addExerciseToTrainingDay as dmAddExerciseToTrainingDay,
    deleteExercise as dmDeleteExercise, // Assuming you have this function
    addHistoryEntry as dmAddHistoryEntry,
    updateHistoryEntry as dmUpdateHistoryEntry,
    deleteHistoryEntry as dmDeleteHistoryEntry,
} from './utils/dataManager';

export default function App() {
    // console.log("Full themeStyles object:", darkThemeStyles); 

    const [trainingDays, setTrainingDays] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true); // Manages loading state

    // --- Data Management Callbacks (ESSENTIAL FOR YOUR APP'S FUNCTIONALITY) ---
    const addTrainingDay = useCallback((dayName) => {
        setTrainingDays(prevDays => {
            const updatedDays = dmAddTrainingDay(prevDays, dayName);
            saveTrainingDays(updatedDays);
            return updatedDays;
        });
    }, []);

    const deleteTrainingDay = useCallback((dayId) => {
        setTrainingDays(prevDays => {
            const updatedDays = dmDeleteTrainingDay(prevDays, dayId);
            saveTrainingDays(updatedDays);
            return updatedDays;
        });
    }, []);

    const addExerciseToTrainingDay = useCallback((trainingDayId, exerciseName) => {
        setTrainingDays(prevDays => {
            const updatedDays = dmAddExerciseToTrainingDay(prevDays, trainingDayId, exerciseName);
            saveTrainingDays(updatedDays);
            return updatedDays;
        });
    }, []);

    // Assuming you have a deleteExercise function in your dataManager
    const deleteExercise = useCallback((trainingDayId, exerciseId) => {
        setTrainingDays(prevDays => {
            const updatedDays = dmDeleteExercise(prevDays, trainingDayId, exerciseId);
            saveTrainingDays(updatedDays);
            return updatedDays;
        });
    }, []);

    const addHistoryEntry = useCallback((trainingDayId, exerciseId, newEntryData) => {
        setTrainingDays(prevDays => {
            const updatedDays = dmAddHistoryEntry(prevDays, trainingDayId, exerciseId, newEntryData);
            saveTrainingDays(updatedDays);
            return updatedDays;
        });
    }, []);

    const updateExerciseHistoryEntry = useCallback((trainingDayId, exerciseId, entryId, updatedEntryData) => {
        setTrainingDays(prevDays => {
            const updatedDays = dmUpdateHistoryEntry(prevDays, trainingDayId, exerciseId, entryId, updatedEntryData);
            saveTrainingDays(updatedDays);
            return updatedDays;
        });
    }, []);

    const deleteExerciseHistoryEntry = useCallback((trainingDayId, exerciseId, historyEntryId) => {
        setTrainingDays(prevDays => {
            const updatedDays = dmDeleteHistoryEntry(prevDays, trainingDayId, exerciseId, historyEntryId);
            saveTrainingDays(updatedDays);
            return updatedDays;
        });
    }, []);

    // --- Data Loading Effect ---
    useEffect(() => {
        const loadAllData = async () => {
            try {
                const loadedDays = await loadTrainingDays();
                setTrainingDays(loadedDays);
            } catch (error) {
                console.error("Failed to load training days:", error);
            } finally {
                setIsLoadingData(false);
            }
        };
        loadAllData();
    }, []);

    // --- Loading Screen ---
    if (isLoadingData) {
        return (
            <View style={darkThemeStyles.outerContainer}>
                <Text style={darkThemeStyles.emptyText}>Loading app data...</Text>
            </View>
        );
    }

    // --- Main App Render ---
    return (
        <SafeAreaProvider>
            <AppNavigator
                trainingDays={trainingDays}
                setTrainingDays={setTrainingDays}
                addTrainingDay={addTrainingDay}
                deleteTrainingDay={deleteTrainingDay}
                addExerciseToTrainingDay={addExerciseToTrainingDay}
                deleteExercise={deleteExercise} // Pass this prop
                addHistoryEntry={addHistoryEntry}
                updateExerciseHistoryEntry={updateExerciseHistoryEntry}
                deleteExerciseHistoryEntry={deleteExerciseHistoryEntry}
                themeStyles={darkThemeStyles} 
            />
            <StatusBar style="light" /> 
        </SafeAreaProvider>
    );
}