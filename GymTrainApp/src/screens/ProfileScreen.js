import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { RadarChart } from 'react-native-chart-kit';
import StatusPanel, { createStatusPanelStyles } from '../components/StatusPanel';




export const ProfileScreen = ({ styles, navigation }) => {
    const insets = useSafeAreaInsets();
    // --- Data for Chart (Example only, will come from your app state) ---
    // This is dummy data for a radar chart. You'll replace it with real skill data.

    //Dummy Data for Status Panel
    const statusData = {
        level: 0,
        title: "None",
        job: "None",
        hp: 100,
        mp: 100,
        fatigue: 0,
        str: 0,
        vit: 0,
        agi: 0,
        int: 0,
        per: 0,
        availablePoints: 0,
    };

    const radarChartData = {
        labels: ["Strength", "Endurance", "Speed", "Flexibility", "Balance"],
        datasets: [
            {
                data: [0, 0, 0, 0, 0], // Example skill levels (0-100)
                // Use your accent color for the line/fill
                color: (opacity = 1) => `rgba(106, 90, 205, ${opacity})`, // A purple accent
                // Add fill color for the pentagon area
                fill: true,
            }
        ]
    };

    const radarChartConfig = {
        // backgroundColor: styles.exerciseCard.backgroundColor, // Use your card background
        backgroundGradientFrom: styles.exerciseCardBackgroundFrom.backgroundColor,
        backgroundGradientTo: styles.exerciseCardBackgroundTo.backgroundColor,
        decimalPlaces: 0,
        color: (opacity = 1) => styles.accentColor1 || `rgba(255, 105, 180, ${opacity})`, // A pink accent for the labels
        labelColor: (opacity = 1) => styles.historyText.color || `rgba(187, 187, 187, ${opacity})`,
        propsForLabels: {
            fontSize: 10,
            fontWeight: 'bold',
        },
        propsForBackgroundLines: {
            stroke: styles.borderColor || '#333333', // Lines for the radar grid
            strokeDasharray: '', // Make solid lines
        },
        fillShadowGradient: styles.accentColor1 || '#FF69B4', // Fill color inside the polygon
        fillShadowGradientOpacity: 0.3, // Make fill semi-transparent
    };
    // ----------------------------------------------------------------------


    return (
        <View style={styles.container}> {/* This ensures the whole screen uses your dark background */}
            {/* Header Section */}
            <View style={[styles.profileHeaderContainer, { paddingTop: 15 + insets.top }]}>
                <TouchableOpacity style={styles.profileHeaderButton}>
                    <MaterialIcons name="menu" size={28} color={styles.profileHeaderTitle.color} />
                </TouchableOpacity>
            <Text style={styles.profileHeaderTitle}>Profile</Text>
                <TouchableOpacity style={styles.profileHeaderIcon}>
                    <MaterialIcons name="account-circle" size={32} color={styles.profileHeaderTitle.color} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContentContainer}>
                <StatusPanel
                    styles={styles.statusPanel} // Pass the status panel specific styles
                    {...statusData} // Pass all your status data as props
                />
            
                {/* Mid-Screen Cards Layout */}
                {/* Main Graph Section (Skills Overview - Pentagon Chart) */}
                <View style={styles.profileGraphCard}>
                    <Text style={styles.cardTitle}>Skills Overview</Text>
                    {/*
                        To render the Radar Chart:
                        1. Make sure you have 'react-native-chart-kit' and 'react-native-svg' installed:
                        npm install react-native-chart-kit react-native-svg
                        2. Uncomment the 'import { RadarChart }' line above.
                        3. Uncomment the RadarChart component below and replace the placeholder Text.
                    */}
                    {/* <RadarChart
                        data={radarChartData}
                        width={300} // Adjust width as needed, often use Dimensions.get('window').width
                        height={220}
                        chartConfig={radarChartConfig}
                        style={{ marginVertical: 10 }}
                    /> */}
                    <Text style={styles.emptyText}>
                        [Placeholder for Radar Chart: Install 'react-native-chart-kit' to use it]
                    </Text>
                </View>


                {/* The bottom navigation (Home / +) is handled by your Tab.Navigator in AppNavigator.js,
                    so you don't need to add it here directly. */}
                

                <View style={styles.profileGraphCard}>
                    <Text style={styles.cardTitle}>Skills Overview</Text>
                    {/*
                        To render the Radar Chart:
                        1. Make sure you have 'react-native-chart-kit' and 'react-native-svg' installed:
                        npm install react-native-chart-kit react-native-svg
                        2. Uncomment the 'import { RadarChart }' line above.
                        3. Uncomment the RadarChart component below and replace the placeholder Text.
                    */}
                    {/* <RadarChart
                        data={radarChartData}
                        width={300} // Adjust width as needed, often use Dimensions.get('window').width
                        height={220}
                        chartConfig={radarChartConfig}
                        style={{ marginVertical: 10 }}
                    /> */}
                    <Text style={styles.emptyText}>
                        [Placeholder for Radar Chart: Install 'react-native-chart-kit' to use it]
                    </Text>
                </View>
            </ScrollView>

        </View>
    );
};

export const createProfileScreenStyles = (themeStyles) => StyleSheet.create({
    ...themeStyles, // Inherit base styles like container, emptyText, cardTitle, historyText, etc.

    // --- Header Styles ---
    profileHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: themeStyles.outerContainer.backgroundColor,
    },
    profileHeaderButton: {
        padding: 5,
    },
    profileHeaderIcon: {
        // You can add border radius or background for the circular profile icon if needed
    },
    profileHeaderTitle: {
        color: themeStyles.exerciseName.color, // Assuming a light color for headers like #E0E0E0
        fontSize: 24,
        fontWeight: 'bold',
    },

    // --- Graph Card Styles ---
    profileGraphCard: {
        backgroundColor: themeStyles.exerciseCard.backgroundColor, // Re-use your dark card background
        marginVertical: 10,
        marginHorizontal: 16,
        borderRadius: themeStyles.exerciseCard.borderRadius,
        padding: 20,
        alignItems: 'center', // To center the chart horizontally if needed
    },

    // --- Mid-Screen Card Layouts ---
    profileTwoColumnRow: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Distributes space evenly
        marginHorizontal: 16,
        marginBottom: 10, // Space below this row
    },
    profileSmallCard: {
        flex: 1, // Makes each card take equal width within the row
        backgroundColor: themeStyles.exerciseCard.backgroundColor,
        borderRadius: themeStyles.exerciseCard.borderRadius,
        padding: 15,
        marginHorizontal: 5, // Small space between the two cards
        alignItems: 'center', // Center content within the small card
        // Consider adding a fixed height if charts/content are same size
        // height: 120,
    },
    profileLargeCard: {
        backgroundColor: themeStyles.exerciseCard.backgroundColor,
        marginVertical: 10,
        marginHorizontal: 16,
        borderRadius: themeStyles.exerciseCard.borderRadius,
        padding: 20,
    },
    // You might also need specific styles for text within these cards

    statusPanel: createStatusPanelStyles(themeStyles),
});