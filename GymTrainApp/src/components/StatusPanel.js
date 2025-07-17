// src/components/StatusPanel.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
// If you want sophisticated progress bars, consider:
// npm install react-native-progress
// import * as Progress from 'react-native-progress';

const StatusPanel = ({ styles, level, title, job, hp, mp, fatigue, str, vit, agi, int, per, availablePoints }) => {
    // Helper function for simple View-based progress bars (if not using a library)
    const renderProgressBar = (current, max, color) => (
        <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${(current / max) * 100}%`, backgroundColor: color }]} />
        </View>
    );

    return (
        <View style={styles.statusPanelContainer}>
            {/* Header: STATUS */}
            <View style={styles.statusPanelHeader}>
                <Text style={styles.statusPanelHeaderText}>STATUS</Text>
            </View>

            {/* Level & Title/Job */}
            <View style={styles.statusPanelLevelInfo}>
                <View style={styles.levelContainer}>
                    <Text style={styles.levelNumber}>{level}</Text>
                    <Text style={styles.levelLabel}>LEVEL</Text>
                </View>
                <View style={styles.jobTitleContainer}>
                    <Text style={styles.jobLabel}>JOB: {job}</Text>
                    <Text style={styles.titleLabel}>TITLE: {title}</Text>
                </View>
            </View>

            {/* HP, MP, FATIGUE Progress Bars */}
            <View style={styles.progressRow}>
                <View style={styles.progressItem}>
                    <MaterialIcons name="local-hospital" size={24} color={styles.progressIcon.color} />
                    <Text style={styles.progressValue}>{hp}</Text>
                    {/* Option 1: Simple custom progress bar */}
                    {renderProgressBar(hp, 2500, '#00BFFF')} {/* Max HP example */}
                    {/* Option 2: react-native-progress library */}
                    {/* <Progress.Bar progress={hp / 2500} width={null} height={8} color={'#00BFFF'} unfilledColor={'#333'} borderRadius={4} style={styles.libraryProgressBar} /> */}
                    <Text style={styles.progressLabel}>HP</Text>
                </View>
                <View style={styles.progressItem}>
                    <MaterialIcons name="flash-on" size={24} color={styles.progressIcon.color} />
                    <Text style={styles.progressValue}>{mp}</Text>
                    {renderProgressBar(mp, 500, '#6A5ACD')} {/* Max MP example */}
                    {/* <Progress.Bar progress={mp / 500} width={null} height={8} color={'#6A5ACD'} unfilledColor={'#333'} borderRadius={4} style={styles.libraryProgressBar} /> */}
                    <Text style={styles.progressLabel}>MP</Text>
                </View>
                <View style={styles.progressItem}>
                    <MaterialIcons name="whatshot" size={24} color={styles.progressIcon.color} />
                    <Text style={styles.progressValue}>{fatigue}</Text>
                    <Text style={styles.progressLabel}>FATIGUE</Text>
                </View>
            </View>

            {/* Stats (STR, VIT, AGI, INT, PER) */}
            <View style={styles.statsGrid}>
                {/* Row 1 */}
                <View style={styles.statRow}>
                    <MaterialIcons name="accessibility" size={20} color={styles.statIcon.color} />
                    <Text style={styles.statLabel}>STR: {str}</Text>
                    <MaterialIcons name="favorite" size={20} color={styles.statIcon.color} />
                    <Text style={styles.statLabel}>VIT: {vit}</Text>
                </View>
                {/* Row 2 */}
                <View style={styles.statRow}>
                    <MaterialIcons name="directions-run" size={20} color={styles.statIcon.color} />
                    <Text style={styles.statLabel}>AGI: {agi}</Text>
                    <MaterialIcons name="lightbulb-outline" size={20} color={styles.statIcon.color} />
                    <Text style={styles.statLabel}>INT: {int}</Text>
                </View>
                {/* Row 3 with Available Points */}
                <View style={styles.statRow}>
                    <MaterialIcons name="visibility" size={20} color={styles.statIcon.color} />
                    <Text style={styles.statLabel}>PER: {per}</Text>
                    <View style={styles.availablePointsContainer}>
                        <Text style={styles.availablePointsNumber}>{availablePoints}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

// --- Styles for StatusPanel ---
export const createStatusPanelStyles = (themeStyles) => StyleSheet.create({
    statusPanelContainer: {
        backgroundColor: themeStyles.exerciseCard.backgroundColor, // Re-use your dark card background
        marginVertical: 10,
        marginHorizontal: 16,
        borderRadius: themeStyles.exerciseCard.borderRadius,
        padding: 20,
        borderWidth: 1,
        borderColor: '#00BFFF', // Light blue border for a futuristic feel
        // Add subtle shadow/glow effect
        shadowColor: '#00BFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3, // Make shadow semi-transparent
        shadowRadius: 8, // Spread of the glow
        elevation: 6, // Android shadow
    },
    statusPanelHeader: {
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#00BFFF', // Blue accent line
        paddingBottom: 10,
    },
    statusPanelHeaderText: {
        color: '#FFFFFF', // Bright white for "STATUS"
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: 2, // Space out letters for effect
    },
    statusPanelLevelInfo: {
        flexDirection: 'row',
        justifyContent: 'space-around', // Space between Level and Job/Title
        alignItems: 'center',
        marginBottom: 20,
    },
    levelContainer: {
        alignItems: 'center',
        marginRight: 20,
    },
    levelNumber: {
        color: '#00BFFF', // Blue accent for the level number
        fontSize: 48,
        fontWeight: 'bold',
    },
    levelLabel: {
        color: themeStyles.historyText.color, // Lighter gray for "LEVEL" text
        fontSize: 14,
        letterSpacing: 1,
    },
    jobTitleContainer: {
        alignItems: 'flex-start',
    },
    jobLabel: {
        color: themeStyles.historyText.color, // Lighter gray for "JOB"
        fontSize: 14,
    },
    titleLabel: {
        color: '#FF69B4', // Pink accent for the title
        fontSize: 18,
        fontWeight: 'bold',
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-around', // Space around HP/MP/FATIGUE items
        marginBottom: 20,
    },
    progressItem: {
        alignItems: 'center',
        flex: 1, // Make each item take equal space
    },
    progressIcon: {
        color: '#BBBBBB', // Neutral color for icons
    },
    progressValue: {
        color: '#E0E0E0',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 5,
    },
    progressLabel: {
        color: themeStyles.historyText.color,
        fontSize: 12,
        marginTop: 2,
    },
    // Styles for custom (View-based) progress bar
    progressBarBackground: {
        height: 6,
        width: 80, // Fixed width for the bar
        backgroundColor: '#333333', // Unfilled part of the bar
        borderRadius: 3,
        overflow: 'hidden', // Ensures the fill stays within bounds
        marginTop: 5,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    // Styles for react-native-progress library bar (if you use it)
    libraryProgressBar: {
        marginTop: 5,
        width: 80, // Adjust width as needed
    },
    statsGrid: {
        // No flex-direction: 'row' here directly, as each statRow handles its own row
        paddingHorizontal: 10,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Distribute space between stat pairs
        alignItems: 'center',
        marginBottom: 10,
    },
    statIcon: {
        color: '#BBBBBB', // Neutral color for stat icons
        marginRight: 8,
    },
    statLabel: {
        color: '#FFFFFF', // Bright white for stat labels and values
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1, // Allows label to take up available space in the row
    },
    availablePointsContainer: {
        backgroundColor: '#6A5ACD', // Purple background for available points bubble
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginLeft: 20, // Space from the last stat
    },
    availablePointsNumber: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default StatusPanel;