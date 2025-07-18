import React, { useState, useEffect, useCallback } from 'react'; // <--- WICHTIG: useState, useEffect, useCallback hinzufügen!
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, TextInput, Alert } from 'react-native'; // <--- TextInput, Alert hinzufügen!
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Modal from 'react-native-modal'; 

const MemoizedTrainingDayItem = React.memo(function MemoizedTrainingDayItem({ item, styles, onPress, onDelete }) {
    const displayName = item.name || item.date; // Fallback, falls 'name' fehlt

    return (
        <TouchableOpacity style={styles.trainingDayCard} onPress={() => onPress(item.id, item.name)}>
            <Text style={styles.trainingDayText}>{displayName}</Text> 
            
            <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteButton}> 
                <MaterialIcons name="delete" size={20} color={styles.buttonText.color} />
            </TouchableOpacity>
        </TouchableOpacity>
    );
});


export const HomeScreen = ({ navigation, trainingDays, addTrainingDay, deleteTrainingDay, styles }) => {
    const [isAddDayModalVisible, setAddDayModalVisible] = useState(false);
    const [newDayName, setNewDayName] = useState('');

    const insets = useSafeAreaInsets(); 
    const toggleAddDayModal = useCallback(() => {
        setNewDayName(''); 
        setAddDayModalVisible(prev => !prev);
    }, []); 

    const handleAddTrainingDay = useCallback(() => {
        if (newDayName.trim() === '') {
            Alert.alert('Fehler', 'Bitte gib einen Namen für den Trainingstag ein.');
            return;
        }
        addTrainingDay(newDayName.trim());
        setNewDayName(''); 
        toggleAddDayModal();
        Alert.alert('Erfolg', 'Trainingstag hinzugefügt!');
    }, [newDayName, addTrainingDay, toggleAddDayModal]); 

    // Angenommene Funktion zum Navigieren zum TrainingDayScreen
    const navigateToTrainingDay = useCallback((id, name) => {
        navigation.navigate('TrainingDay', { trainingDayId: id, trainingDayName: name });
    }, [navigation]);

    // Angenommene Funktion zum Löschen eines Trainingstags
    const handleDeleteTrainingDay = useCallback((dayId) => {
        Alert.alert(
            "Trainingstag löschen",
            "Möchtest du diesen Trainingstag wirklich löschen?",
            [
                { text: "Abbrechen", style: "cancel" },
                { text: "Löschen", onPress: () => deleteTrainingDay(dayId), style: "destructive" }
            ],
            { cancelable: true } 
        );
    }, [deleteTrainingDay]);


    return (
        <View style={styles.container}> 

            {/* --- CUSTOM HEADER FOR HOMESCREEN --- */}
            <View style={[styles.homeHeaderContainer, { paddingTop: 15 + insets.top }]}>
                <Text style={styles.homeHeaderTitle}>Home</Text>
                <TouchableOpacity
                    style={styles.homeProfileIconContainer}
                    onPress={() => navigation.navigate('Profile')} 
                >
                    <MaterialIcons name="account-circle" size={32} color={styles.homeProfileIcon.color} />
                </TouchableOpacity>
            </View>

            {/* Scrollable Content for the rest of the Home Screen */}
            <ScrollView style={styles.homeScrollContentContainer}>
                {trainingDays.length === 0 ? (
                    <Text style={styles.emptyText}>No training days yet. Click the + button to add one!</Text>
                ) : (
                    <View style={styles.homeContent}>
                        <View style={styles.homeSummaryCard}>
                            <Text style={styles.cardTitle}>Welcome Back!</Text>
                            <Text style={styles.historyText}>You have {trainingDays.length} training days logged.</Text>
                            {/* Add other quick stats */}
                        </View>

                        <Text style={styles.homeSectionTitle}>Your Training Days:</Text> {/* Text angepasst */}
                        <View style={styles.homeListContainer}>
                            {trainingDays.map((day) => (
                                <MemoizedTrainingDayItem
                                    key={day.id}
                                    item={day}
                                    styles={styles}
                                    onPress={navigateToTrainingDay}
                                    onDelete={handleDeleteTrainingDay}
                                />
                            ))}
                        </View>
                    </View>
                )}

                {/* Add some bottom padding if needed for comfortable scrolling above the tab bar */}
                <View style={{ height: 20 + insets.bottom }} />

            </ScrollView>


            {/* Floating Action Button (FAB) */}
            
            <TouchableOpacity
                style={[styles.fab,{ bottom: -10 + insets.bottom }]}
                onPress={toggleAddDayModal}
                accessibilityRole="button"
                accessibilityLabel="Neuen Trainingstag hinzufügen"
            >
                <MaterialIcons name="add" size={30} color="#fff" />
            </TouchableOpacity>
            

            {/* Deaktiviere das auskommentierte Modal und rücke es in den Code ein */}
            <Modal
                isVisible={isAddDayModalVisible}
                onBackdropPress={toggleAddDayModal}
                onSwipeComplete={toggleAddDayModal}
                swipeDirection={['down']}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropOpacity={0.7}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Neuen Trainingstag hinzufügen</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Name des Trainingstags"
                        placeholderTextColor={styles.inputPlaceholder.color}
                        value={newDayName}
                        onChangeText={setNewDayName}
                        accessibilityLabel="Name des Trainingstags eingeben"
                        autoFocus={true}
                    />
                    <View style={styles.modalButtonContainer}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={toggleAddDayModal} accessibilityRole="button" accessibilityLabel="Abbrechen">
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleAddTrainingDay} accessibilityRole="button" accessibilityLabel="Trainingstag hinzufügen">
                            <Text style={styles.buttonText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// Styles for HomeScreen
export const createHomeScreenStyles = (themeStyles) => StyleSheet.create({
    ...themeStyles, // Inherit all the base styles from Themes.js

    homeContent: {
        paddingHorizontal: 0,
        paddingBottom: 20,
    },
    homeListContainer: {
        marginTop: 10,
    },
    trainingDayCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        marginVertical: 4,
        marginHorizontal: 16,
        backgroundColor: themeStyles.exerciseCard.backgroundColor, // Use theme style
        borderRadius: themeStyles.exerciseCard.borderRadius, // Use theme style
    },
    trainingDayText: {
        color: themeStyles.exerciseName.color, // Use theme style
        fontSize: 16,
    },
    trainingDayActions: {
        flexDirection: 'row',
    },
    homeHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: themeStyles.outerContainer.backgroundColor,
        borderBottomWidth: 1,
        borderBottomColor: '#282828',
    },
    homeHeaderTitle: {
        color: themeStyles.exerciseName.color,
        fontSize: 24,
        fontWeight: 'bold',
    },
    homeProfileIconContainer: {
        padding: 5,
    },
    homeProfileIcon: {
        color: themeStyles.homeProfileIcon.color, // Use theme style
    },
    homeScrollContentContainer: {
        flex: 1,
    },
    homeSummaryCard: {
        backgroundColor: themeStyles.exerciseCard.backgroundColor, // Use theme style
        marginVertical: 10,
        marginHorizontal: 16,
        borderRadius: themeStyles.exerciseCard.borderRadius, // Use theme style
        padding: 20,
        alignItems: 'center',
    },
    homeSectionTitle: {
        color: themeStyles.textColor.color, // Use theme style
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        marginHorizontal: 16,
    },
    fab: {
        position: 'absolute',

        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        right: 30,
        backgroundColor: themeStyles.accentColor1 || '#6A5ACD',
        borderRadius: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        zIndex: 10,
    },
});