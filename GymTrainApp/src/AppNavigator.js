import React, { useMemo,useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native'; 
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import your screens and their style creation functions
import { HomeScreen, createHomeScreenStyles } from './screens/HomeScreen'; // <--- Ensure path is correct
import { TrainingDayScreen, createTrainingDayScreenStyles } from './screens/TrainingDayScreen'; // <--- Ensure path is correct
import { ProfileScreen, createProfileScreenStyles } from './screens/ProfileScreen'; // <--- Ensure path is correct

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


// --- Define your app-wide styles here (appStyles should NOT use 'insets' here) ---
const appStyles = StyleSheet.create({
});

// --- TrainingStack component (moved outside AppNavigator for clarity) ---
function TrainingStack({
    trainingDays,
    setTrainingDays,
    addTrainingDay,
    deleteTrainingDay,
    addExerciseToTrainingDay,
    addHistoryEntry,
    updateExerciseHistoryEntry,
    deleteExerciseHistoryEntry,
    deleteExercise,
    styles // This 'styles' prop now contains screen-specific styles
}) {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false, // Hide default header for Stack screens
            }}
        >
            <Stack.Screen name="Home" options={{ title: 'Home' }}>
                {props => (
                    <HomeScreen
                        {...props}
                        trainingDays={trainingDays}
                        addTrainingDay={addTrainingDay}
                        deleteTrainingDay={deleteTrainingDay}
                        styles={styles.homeScreen} // Pass specific home screen styles
                    />
                )}
            </Stack.Screen>
            <Stack.Screen name="TrainingDay" options={{title: 'Training Day Details' }}>
                {props => (
                    <TrainingDayScreen
                        {...props}
                        trainingDays={trainingDays}
                        setTrainingDays={setTrainingDays}
                        addExerciseToTrainingDay={addExerciseToTrainingDay}
                        addHistoryEntry={addHistoryEntry}
                        updateExerciseHistoryEntry={updateExerciseHistoryEntry}
                        deleteExerciseHistoryEntry={deleteExerciseHistoryEntry}
                        deleteExercise={deleteExercise}
                        styles={styles.trainingDayScreen} // Pass specific training day styles
                    />
                )}
            </Stack.Screen>
        </Stack.Navigator>
    );
}

// --- Main AppNavigator component ---
function AppNavigator({
    trainingDays,
    setTrainingDays,
    addTrainingDay,
    deleteTrainingDay,
    addExerciseToTrainingDay,
    addHistoryEntry,
    updateExerciseHistoryEntry,
    deleteExerciseHistoryEntry,
    deleteExercise, // <--- ADD this prop
    themeStyles // <--- RECEIVE themeStyles as a prop
}) {
    const insets = useSafeAreaInsets();

    // Create screen-specific styles instances here, using the received themeStyles
    const homeScreenStyles = useMemo(() => createHomeScreenStyles({ ...themeStyles, insets }), [themeStyles, insets]);
    const trainingDayScreenStyles = useMemo(() => createTrainingDayScreenStyles(themeStyles), [themeStyles]); // These don't need insets in their style creation
    const profileScreenStyles = useMemo(() => createProfileScreenStyles(themeStyles), [themeStyles]);

    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarActiveTintColor: themeStyles.accentColor1,
                    tabBarInactiveTintColor: themeStyles.historyText.color,
                    tabBarStyle: {
                        backgroundColor: themeStyles.exerciseCard.backgroundColor,
                        borderTopWidth: 0,
                        paddingBottom: insets.bottom,
                        height: 60 + insets.bottom,
                        paddingTop: 10,
                    },
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: 'bold',
                    },
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;
                        if (route.name === 'Training') {
                            iconName = focused ? 'fitness-center' : 'fitness-center'; // Changed from 'home' to something more relevant to 'Training'
                        } else if (route.name === 'Profile') {
                            iconName = focused ? 'person' : 'person-outline';
                        }
                        return <MaterialIcons name={iconName} size={size} color={color} />;
                    },
                })}
            >
                <Tab.Screen name="Training">
                    {props => (
                        <TrainingStack
                            {...props}
                            trainingDays={trainingDays}
                            setTrainingDays={setTrainingDays}
                            addTrainingDay={addTrainingDay}
                            deleteTrainingDay={deleteTrainingDay}
                            addExerciseToTrainingDay={addExerciseToTrainingDay}
                            addHistoryEntry={addHistoryEntry}
                            updateExerciseHistoryEntry={updateExerciseHistoryEntry}
                            deleteExerciseHistoryEntry={deleteExerciseHistoryEntry}
                            deleteExercise={deleteExercise}
                            styles={{ // Pass a styles object with specific screen styles
                                homeScreen: homeScreenStyles,
                                trainingDayScreen: trainingDayScreenStyles,
                            }}
                        />
                    )}
                </Tab.Screen>
                <Tab.Screen name="Profile">
                    {props => (
                        <ProfileScreen
                            {...props}
                            styles={profileScreenStyles} // Pass specific profile screen styles
                        />
                    )}
                </Tab.Screen>
            </Tab.Navigator>
        </NavigationContainer>
    );
}

export default AppNavigator;