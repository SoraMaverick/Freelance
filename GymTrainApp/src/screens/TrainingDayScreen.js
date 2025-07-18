import React, { useState, useEffect, memo, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Button, Alert, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


// MemoizedHistoryItem muss ZUERST definiert werden, da MemoizedExerciseItem es verwendet
const MemoizedHistoryItem = memo(function MemoizedHistoryItem({
    item,
    parentExerciseId, // Renamed for clarity: This is the exercise.id
    onEditHistoryEntry, // Renamed prop for consistency
    onDeleteHistoryEntry, // Renamed prop for consistency
    styles // Stelle sicher, dass styles übergeben wird
}) {
    // Optional, aber empfohlen: Füge diese Prüfung HIER hinzu, um den 'TypeError: Cannot read property 'date' of undefined' zu vermeiden
    if (!item) {
        return null; // Rendere nichts, wenn das Item undefiniert ist
    }

    // Convert weight to number for calculation, handle 'BW'
    const weightInKg = parseFloat(item.weight);
    const weightInLbs = isNaN(weightInKg) ? 'N/A' : Math.round(weightInKg * 2.2);

    return (
        <View style={styles.historyItem}>
            <View style={styles.historyTextContainer}>
                <Text style={styles.historyText}>
                    <Text style={styles.historyLabel}>Date:</Text><Text> {item.date}</Text>
                </Text>
                <Text style={styles.historyText}>
                    <Text style={styles.historyLabel}>Sets:</Text><Text> {item.sets}</Text>
                </Text>
                <Text style={styles.historyText}>
                    <Text style={styles.historyLabel}>Reps:</Text><Text> {item.reps}</Text>
                </Text>
                <Text style={styles.historyText}>
                    <Text style={styles.historyLabel}>Weight:</Text><Text> {item.weight} kg/</Text><Text>{weightInLbs} lbs</Text>
                </Text>
            </View>
            <View style={styles.historyItemActions}>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => onEditHistoryEntry({ ...item, parentId: parentExerciseId })} // Use parentExerciseId
                    accessibilityRole="button"
                    accessibilityLabel={`Eintrag vom ${item.date} bearbeiten`}
                >
                    <MaterialIcons name="edit" size={20} color={styles.editButtonIcon.color} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteHistoryButton}
                    onPress={() => onDeleteHistoryEntry(item.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Eintrag vom ${item.date} löschen`}
                >
                    <MaterialIcons name="delete" size={20} color={styles.buttonText.color} />
                </TouchableOpacity>
            </View>
        </View>
    );
});


const MemoizedExerciseItem = memo(function MemoizedExerciseItem({
    item: exercise,
    toggleExpand,
    expandedExerciseId,
    deleteExercise,
    trainingDayId,
    toggleAddEntryModal,
    styles,
    onDeleteHistoryEntry, // Passed down to MemoizedHistoryItem
    onEditHistoryEntry // Renamed prop, passed down to MemoizedHistoryItem
}) {
    return (
        <View style={styles.exerciseCard}>

            <TouchableOpacity
                onPress={() => toggleExpand(exercise.id)}
                style={styles.exerciseHeader}
                accessibilityRole="button"
                accessibilityLabel={expandedExerciseId === exercise.id ? `Übung ${exercise.name} einklappen` : `Übung ${exercise.name} ausklappen`}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <View style={styles.exerciseActions}>
                        <TouchableOpacity
                            // style={styles.deleteExerciseButton}
                            style={styles.deleteHistoryButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                deleteExercise(trainingDayId, exercise.id);
                            }}
                            accessibilityRole="button"
                            accessibilityLabel={`Lösche Übung ${exercise.name}`}
                        >
                            <MaterialIcons name="delete" size={24} color={styles.buttonText.color} />
                        </TouchableOpacity>
                        <MaterialIcons
                            name={expandedExerciseId === exercise.id ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                            size={24}
                            color={styles.exerciseName.color}
                        />
                    </View>
                </View>
            </TouchableOpacity>

            {expandedExerciseId === exercise.id && (
                <View style={styles.exerciseDetails}>
                        <TouchableOpacity
                            style={styles.addEntryHeaderButton}
                            onPress={() => toggleAddEntryModal(exercise.id)}
                            accessibilityRole="button"
                            accessibilityLabel={`Neuen Historie-Eintrag für ${exercise.name} hinzufügen`}
                        >
                            <MaterialIcons name="add" size={22} color="#fff" />
                            <Text style={styles.addEntryButtonText}>Eintrag hinzufügen</Text>
                        </TouchableOpacity>
                    <FlatList
                        data={exercise.history}
                        renderItem={({ item }) => (
                            <MemoizedHistoryItem
                                item={item}
                                parentExerciseId={exercise.id} // Correctly pass exercise.id as parentId
                                onEditHistoryEntry={onEditHistoryEntry} // Pass the handler
                                onDeleteHistoryEntry={onDeleteHistoryEntry} // Pass the handler
                                styles={styles} // Styles weiterhin als Prop übergeben
                            />
                        )}
                        keyExtractor={(histItem, index) => histItem.id || `temp-${index}`} // Ensure unique IDs
                        ListEmptyComponent={<Text style={styles.emptyHistoryText}>Noch keine Einträge für diese Übung.</Text>}
                        scrollEnabled={false}
                    />
                </View>
            )}
        </View>
    );
});


// ====================================================================
// TrainingDayScreen Komponente
// ====================================================================
const TrainingDayScreen = ({ route, // Access navigation params
                            trainingDays, // Full trainingDays array from App.js
                            setTrainingDays, // The setter to update global state
                            addExerciseToTrainingDay,
                            addHistoryEntry, // New prop for adding history
                            updateExerciseHistoryEntry, // Renamed from toggleEditEntryModal for clarity
                            deleteExerciseHistoryEntry,
                            deleteExercise,
                            styles // Pass styles from AppNavigator
                        }) => {
    // Get the specific training day data from the route params
    const { trainingDayId } = route.params;
    const currentTrainingDay = trainingDays.find(day => day.id === trainingDayId);
    // Ensure we have data
    if (!currentTrainingDay) {
        return <View style={styles.outerContainer}><Text style={styles.emptyText}>Training Day not found.</Text></View>;
    }

    const insets = useSafeAreaInsets();
    const [expandedExerciseId, setExpandedExerciseId] = useState(null);

    // States für das Hinzufügen neuer Einträge zur Historie (im Modal)
    const [addSets, setAddSets] = useState('');
    const [addReps, setAddReps] = useState('');
    const [addWeight, setAddWeight] = useState('');
    const [isAddEntryModalVisible, setAddEntryModalVisible] = useState(false);
    const [currentExerciseIdForAdd, setCurrentExerciseIdForAdd] = useState(null);

    // States für das Bearbeiten von Historie-Einträgen (im Modal)
    const [isEditEntryModalVisible, setEditEntryModalVisible] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null); // includes parentId from MemoizedHistoryItem
    const [editSets, setEditSets] = useState('');
    const [editReps, setEditReps] = useState('');
    const [editWeight, setEditWeight] = useState('');
    const [editDate, setEditDate] = useState('');

    // States für das Modal zum Hinzufügen einer neuen Übung
    const [newExerciseName, setNewExerciseName] = useState('');
    const [isExerciseModalVisible, setExerciseModalVisible] = useState(false);


    // WICHTIG: Funktionen, die an memo-Komponenten übergeben werden,
    // sollten mit useCallback umschlossen werden, um unnötige Re-Renders zu verhindern.
    const toggleExerciseModal = useCallback(() => {
        setNewExerciseName(''); // Reset input when opening/closing
        setExerciseModalVisible(prev => !prev);
    }, []);


    const toggleAddEntryModal = useCallback((exerciseId = null) => {
        setCurrentExerciseIdForAdd(exerciseId);
        setAddSets(''); // Reset inputs when opening/closing
        setAddReps('');
        setAddWeight('');
        setAddEntryModalVisible(prev => !prev);
    }, []);

    // This function will be passed to MemoizedHistoryItem
    const handleEditHistoryEntry = useCallback((entry = null) => { // Renamed handler
        setEditingEntry(entry); // This entry object now correctly includes parentId (which is exercise.id)
        setEditEntryModalVisible(prev => !prev);
        if (entry) {
            setEditSets(String(entry.sets));
            setEditReps(String(entry.reps));
            setEditWeight(String(entry.weight));
            setEditDate(entry.date);
        } else {
            // No need to reset here, as toggle will reset it before opening
        }
    }, []);


    const toggleExpand = useCallback((exerciseId) => {
        setExpandedExerciseId(prevId => prevId === exerciseId ? null : exerciseId);
    }, []);

    const handleAddEntry = useCallback(() => {
        // Parse numerical inputs, handle 'BW' for weight
        const parsedSets = parseInt(addSets);
        const parsedReps = parseInt(addReps);
        const parsedWeight = parseFloat(addWeight); // Use parseFloat for weight

        if (!addSets || !addReps || !addWeight || !currentExerciseIdForAdd) {
            Alert.alert('Fehler', 'Bitte alle Felder ausfüllen.');
            return;
        }

        if (isNaN(parsedSets) || isNaN(parsedReps) || (isNaN(parsedWeight) && addWeight.toUpperCase() !== 'BW')) {
            Alert.alert('Fehler', 'Sätze, Wiederholungen und Gewicht müssen gültige Zahlen sein oder Gewicht muss "BW" sein.');
            return;
        }

        // Call the global addHistoryEntry function
        addHistoryEntry(trainingDayId, currentExerciseIdForAdd, {
            sets: addSets, // Keep as string for display if 'BW'
            reps: addReps,
            weight: addWeight // Keep as string for 'BW'
        });

        // Reset inputs and close modal
        setAddSets('');
        setAddReps('');
        setAddWeight('');
        setCurrentExerciseIdForAdd(null);
        toggleAddEntryModal(); // Use the existing toggle function to reset and close
        Alert.alert('Erfolg', 'Eintrag hinzugefügt!');
    }, [addSets, addReps, addWeight, currentExerciseIdForAdd, addHistoryEntry, trainingDayId, toggleAddEntryModal]);


    const handleUpdateEntry = useCallback(() => {
        // Parse numerical inputs, handle 'BW' for weight
        const parsedEditSets = parseInt(editSets);
        const parsedEditReps = parseInt(editReps);
        const parsedEditWeight = parseFloat(editWeight); // Use parseFloat for weight

        if (!editingEntry || !editSets || !editReps || !editWeight || !editDate) {
            Alert.alert('Fehler', 'Bitte alle Felder ausfüllen.');
            return;
        }

        if (isNaN(parsedEditSets) || isNaN(parsedEditReps) || (isNaN(parsedEditWeight) && editWeight.toUpperCase() !== 'BW')) {
            Alert.alert('Fehler', 'Sätze, Wiederholungen und Gewicht müssen gültige Zahlen sein oder Gewicht muss "BW" sein.');
            return;
        }

        const updatedEntry = {
            id: editingEntry.id, // Keep the original ID
            date: editDate,
            sets: editSets,
            reps: editReps,
            weight: editWeight,
        };

        // Call the global updateExerciseHistoryEntry function
        updateExerciseHistoryEntry(trainingDayId, editingEntry.parentId, editingEntry.id, updatedEntry); // Use parentId correctly

        handleEditHistoryEntry(); // Close the modal, using the renamed handler
        Alert.alert('Erfolg', 'Eintrag aktualisiert!');
    }, [editingEntry, editSets, editReps, editWeight, editDate, updateExerciseHistoryEntry, trainingDayId, handleEditHistoryEntry]);

    const handleAddExercise = useCallback(() => {
        if (newExerciseName.trim() === '') {
            Alert.alert('Fehler', 'Bitte gib einen Namen für die Übung ein.');
            return;
        }
        addExerciseToTrainingDay(trainingDayId, newExerciseName.trim());
        setNewExerciseName(''); // Reset input
        toggleExerciseModal(); // Close modal
    }, [newExerciseName, addExerciseToTrainingDay, trainingDayId, toggleExerciseModal]);

    const handleDeleteHistoryEntry = useCallback((historyEntryId) => {
        Alert.alert(
            "Delete History Entry",
            "Are you sure you want to delete this history entry?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", onPress: () => {
                    const currentExercise = currentTrainingDay.exercises.find(ex => ex.id === expandedExerciseId);
                    if (currentExercise) {
                        deleteExerciseHistoryEntry(trainingDayId, currentExercise.id, historyEntryId);
                        Alert.alert('Success', 'Entry deleted!');
                    }
                }, style: "destructive" }
            ],
            { cancelable: true }
        );
    }, [currentTrainingDay, expandedExerciseId, deleteExerciseHistoryEntry, trainingDayId]);


    return (
        <View style={styles.outerContainer}>
            <View style={[styles.homeHeaderContainer, { paddingTop: 15 + insets.top }]}>
                <Text></Text>
            </View>

            <ScrollView style={styles.scrollViewContent}>

                <FlatList
                    data={currentTrainingDay.exercises}
                    renderItem={({ item }) => (
                        <MemoizedExerciseItem
                            item={item}
                            toggleExpand={toggleExpand}
                            expandedExerciseId={expandedExerciseId}
                            deleteExercise={deleteExercise}
                            trainingDayId={trainingDayId} // Pass trainingDayId
                            toggleAddEntryModal={toggleAddEntryModal}
                            styles={styles} // Passiere die Styles als Prop
                            onDeleteHistoryEntry={handleDeleteHistoryEntry} // New prop name for clarity
                            onEditHistoryEntry={handleEditHistoryEntry} // Pass the handler
                        />
                    )}
                    keyExtractor={item => item.id}
                    ListEmptyComponent={<Text style={styles.emptyText}>Noch keine Übungen für diesen Tag.</Text>}
                    scrollEnabled={false}
                />
            </ScrollView>
            
            <TouchableOpacity
                style={[styles.fab,{ bottom: -10 + insets.bottom }]}
                onPress={toggleExerciseModal}
                accessibilityRole="button"
                accessibilityLabel="Neue Übung hinzufügen"
            >
                <MaterialIcons name="add" size={30} color="#fff" />
            </TouchableOpacity>

            {/* Deine Modals */}
            <Modal
                isVisible={isExerciseModalVisible}
                onBackdropPress={toggleExerciseModal}
                onSwipeComplete={toggleExerciseModal}
                swipeDirection={['down']}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropOpacity={0.7}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Neue Übung hinzufügen</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Name der Übung"
                        placeholderTextColor={styles.inputPlaceholder.color}
                        value={newExerciseName}
                        onChangeText={setNewExerciseName}
                        accessibilityLabel="Name der Übung eingeben"
                    />
                    <View style={styles.modalButtonContainer}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={toggleExerciseModal} accessibilityRole="button" accessibilityLabel="Abbrechen">
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleAddExercise} accessibilityRole="button" accessibilityLabel="Übung hinzufügen">
                            <Text style={styles.buttonText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                isVisible={isAddEntryModalVisible}
                onBackdropPress={() => toggleAddEntryModal()} // Call without arg to just toggle
                onSwipeComplete={() => toggleAddEntryModal()} // Call without arg to just toggle
                swipeDirection={['down']}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropOpacity={0.7}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Neuen Eintrag hinzufügen</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Sets"
                        placeholderTextColor={styles.inputPlaceholder.color}
                        keyboardType="numeric"
                        value={addSets}
                        onChangeText={setAddSets} // onChangeText handles string
                        accessibilityLabel="Anzahl der Sätze eingeben"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Reps"
                        placeholderTextColor={styles.inputPlaceholder.color}
                        keyboardType="numeric"
                        value={addReps}
                        onChangeText={setAddReps} // onChangeText handles string
                        accessibilityLabel="Anzahl der Wiederholungen eingeben"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Wheight(kg oder BW)"
                        placeholderTextColor={styles.inputPlaceholder.color}
                        keyboardType="default" // Allow 'BW'
                        value={addWeight}
                        onChangeText={setAddWeight} // onChangeText handles string
                        accessibilityLabel="Gewicht eingeben"
                    />
                    <View style={styles.modalButtonContainer}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => toggleAddEntryModal()} accessibilityRole="button" accessibilityLabel="Abbrechen">
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleAddEntry} accessibilityRole="button" accessibilityLabel="Eintrag hinzufügen">
                            <Text style={styles.buttonText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                isVisible={isEditEntryModalVisible}
                onBackdropPress={() => handleEditHistoryEntry()} // Call without arg to just toggle
                onSwipeComplete={() => handleEditHistoryEntry()} // Call without arg to just toggle
                swipeDirection={['down']}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropOpacity={0.7}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Eintrag bearbeiten</Text>
                    {/* Consider a date picker for better UX */}
                    <TextInput
                        style={styles.input}
                        placeholder="Date(YYYY-MM-DD)"
                        placeholderTextColor={styles.inputPlaceholder.color}
                        value={editDate}
                        onChangeText={setEditDate}
                        accessibilityLabel="Datum des Eintrags bearbeiten"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Sets"
                        placeholderTextColor={styles.inputPlaceholder.color}
                        keyboardType="numeric"
                        value={editSets}
                        onChangeText={setEditSets}
                        accessibilityLabel="Anzahl der Sätze bearbeiten"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Reps"
                        placeholderTextColor={styles.inputPlaceholder.color}
                        keyboardType="numeric"
                        value={editReps}
                        onChangeText={setEditReps}
                        accessibilityLabel="Anzahl der Wiederholungen bearbeiten"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Wheight(kg oder BW)"
                        placeholderTextColor={styles.inputPlaceholder.color}
                        keyboardType="default"
                        value={editWeight}
                        onChangeText={setEditWeight}
                        accessibilityLabel="Gewicht bearbeiten"
                    />
                    <View style={styles.modalButtonContainer}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => handleEditHistoryEntry()} accessibilityRole="button" accessibilityLabel="Abbrechen">
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleUpdateEntry} accessibilityRole="button" accessibilityLabel="Änderungen speichern">
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// Styles for TrainingDayScreen
const createTrainingDayScreenStyles = (themeStyles) => StyleSheet.create({
    ...themeStyles, // Inherit all base styles from Themes.js

    outerContainer: themeStyles.outerContainer,
    scrollViewContent: {
        flex: 1,
        paddingHorizontal: 0,
        paddingBottom: 20,
    },
    description: {
        color: themeStyles.textColor.color,
        fontSize: 16,
        marginHorizontal: 16,
        marginBottom: 10,
    },
    exerciseCard: themeStyles.exerciseCard,
    exerciseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
    },
    exerciseActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deleteExerciseButton: {
        padding: 5,
        marginLeft: 10,
    },
    deleteExerciseButtonIcon: themeStyles.deleteButtonIcon, // Use inherited icon color
    exerciseName: themeStyles.exerciseName,
    exerciseDetails: {
        paddingHorizontal: 15,
        paddingBottom: 15,
        borderTopWidth: 1,
        borderTopColor: '#333333',
        marginTop: 5,
    },
    historySectionTitle: {
        color: themeStyles.textColor.color,
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#282828', // Slightly darker than card, lighter than background
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
    },
    historyTextContainer: {
        flex: 1,
    },
    historyItemActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    historyText: themeStyles.historyText,
    historyLabel: {
        fontWeight: 'bold',
        color: themeStyles.textColor.color,
    },
    editButton: themeStyles.editButton,
    editButtonIcon: { // Specific fix for icon color
        color: themeStyles.buttonText.color, // Assuming you want edit icon to be button text color
    },
    deleteHistoryButton: themeStyles.deleteButton,
    deleteHistoryButtonIcon: themeStyles.deleteButtonIcon, // Use inherited icon color
    emptyHistoryText: themeStyles.emptyText,
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
    addEntryFab: {
        // Define if different from main FAB
    },
    modalContent: themeStyles.modalContent,
    modalTitle: themeStyles.modalTitle,
    input: themeStyles.input,
    inputPlaceholder: themeStyles.inputPlaceholder,
    modalButtonContainer: themeStyles.modalButtonContainer,
    button: themeStyles.button,
    primaryButton: themeStyles.primaryButton,
    cancelButton: themeStyles.cancelButton,
    buttonText: themeStyles.buttonText,
    addEntryHeaderButton: {
        flexDirection: 'row',
        backgroundColor: themeStyles.primaryButton.backgroundColor,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    addEntryButtonText: {
        color: themeStyles.buttonText.color,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    emptyText: themeStyles.emptyText,
});

export { TrainingDayScreen, createTrainingDayScreenStyles };