import { StyleSheet } from 'react-native';

export const darkThemeStyles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: '#121212', // Very dark gray, almost black
    },
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    emptyText: {
        color: '#BBBBBB',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
    // Common text colors
    textColor: {
        color: '#E0E0E0',
    },
    // Styles for exercise name (used in multiple places)
    exerciseName: {
        color: '#E0E0E0',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Card styles (used for exercises, summary cards etc.)
    exerciseCardBackgroundFrom: {
        backgroundColor: '#8900acff',
    },
    exerciseCardBackgroundTo: {
        backgroundColor: '#0b00acff',
    },
    exerciseCard: {
        backgroundColor: '#1E1E1E', // Slightly lighter dark gray for cards
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#333333',
        padding: 20,
    },
    cardTitle: { // Specific style for titles within cards
        color: '#E0E0E0',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    historyText: { // For smaller detail text
        color: '#BBBBBB',
        fontSize: 14,
    },

    // Button Base Styles (for reusable buttons)
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 100,
        marginHorizontal: 5,
    },
    primaryButton: { // Primary action button style
        backgroundColor: '#6A5ACD', // Purple accent
    },
    cancelButton: { // Secondary/cancel button style
        backgroundColor: '#444444', // Dark gray
    },
    buttonText: { // Text style for buttons
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // Specific button appearances (if different from generic button)
    editButton: {
        backgroundColor: '#6A5ACD',
        padding: 8,
        borderRadius: 5,
        marginLeft: 10,
    },
    deleteButton: {
        backgroundColor: '#DC3545',
        padding: 8,
        borderRadius: 5,
        marginLeft: 10,
    },

    // --- Styles for the Modals and TextInput ---
    modalContent: {
        backgroundColor: '#1E1E1E', // Match exerciseCard background
        padding: 22,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#E0E0E0',
        marginBottom: 15,
    },
    input: {
        backgroundColor: '#2C2C2C', // Slightly lighter than background, darker than cards
        color: '#E0E0E0', // Text color for input
        padding: 12,
        borderRadius: 8,
        marginBottom: 15, // More space below input
        width: '100%', // Take full width of modal
        borderWidth: 1,
        borderColor: '#444444',
    },
    inputPlaceholder: {
        color: '#888888', // Lighter gray for placeholder
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 10,
    },

    // --- Styles for Icons ---
    deleteButtonIcon: { // Specific red for delete icons
        color: '#DC3545', // Match deleteButton background for consistency
    },
    homeProfileIcon: { // Matching general text color for now
        color: '#E0E0E0',
    },

    // --- Accent Colors (direct color properties) ---
    accentColor1: '#6A5ACD', // For FAB background etc.
});