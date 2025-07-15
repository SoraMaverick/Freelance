import React, { useState, useEffect, memo, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Button, Alert, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import Modal from 'react-native-modal';

// MemoizedHistoryItem muss ZUERST definiert werden, da MemoizedExerciseItem es verwendet
const MemoizedHistoryItem = memo(function MemoizedHistoryItem({
    item,
    expandedExerciseId,
    toggleEditEntryModal,
    handleDeleteHistoryEntry,
    styles // Stelle sicher, dass styles übergeben wird
}) {
    // Optional, aber empfohlen: Füge diese Prüfung HIER hinzu, um den 'TypeError: Cannot read property 'date' of undefined' zu vermeiden
    if (!item) {
        return null; // Rendere nichts, wenn das Item undefiniert ist
    }

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
                    <Text style={styles.historyLabel}>Weight:</Text><Text> {item.weight} kg/</Text><Text>{Math.round(item.weight * 2.2)} lbs</Text>
                </Text>
            </View>
            <View style={styles.historyItemActions}>
                <TouchableOpacity
                    style={styles.editButton}
                    // WICHTIG: toggleEditEntryModal ist eine Prop
                    onPress={() => toggleEditEntryModal({ ...item, parentId: expandedExerciseId })}
                    accessibilityRole="button"
                    accessibilityLabel={`Eintrag vom ${item.date} bearbeiten`}
                >
                    {/* HIER IST DIE WICHTIGE ÄNDERUNG: MaterialIcons in Text gewickelt */}
                    <Text><MaterialIcons name="edit" size={20} color={styles.editButtonIcon.color} /></Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteHistoryButton}
                    // WICHTIG: handleDeleteHistoryEntry ist eine Prop
                    onPress={() => handleDeleteHistoryEntry(item.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Eintrag vom ${item.date} löschen`}
                >
                    {/* HIER IST DIE WICHTIGE ÄNDERUNG: MaterialIcons in Text gewickelt */}
                    <Text><MaterialIcons name="delete" size={20} color={styles.deleteHistoryButtonIcon.color} /></Text>
                </TouchableOpacity>
            </View>
        </View>
    );
});


const MemoizedExerciseItem = memo(function MemoizedExerciseItem({
    item: exercise,
    toggleExpand, // Prop
    expandedExerciseId, // Prop
    deleteExercise, // Prop
    trainingDayData, // Prop
    toggleAddEntryModal, // Prop
    styles, // Prop
    onDeleteHistoryEntry, // Dies ist der umbenannte Prop von TrainingDayScreen
    updateExerciseHistoryEntry // Dies ist der Prop für das Bearbeitungs-Modal, der auch an HistoryItem geht
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
                            style={styles.deleteExerciseButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                deleteExercise(trainingDayData.id, exercise.id);
                            }}
                            accessibilityRole="button"
                            accessibilityLabel={`Lösche Übung ${exercise.name}`}
                        >
                            <Text><MaterialIcons name="delete" size={24} color={styles.deleteExerciseButtonIcon.color} /></Text>
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
                        <Text><MaterialIcons name="add" size={22} color="#fff" /></Text>
                        <Text style={styles.addEntryButtonText}>Eintrag hinzufügen</Text>
                    </TouchableOpacity>

                    <FlatList
                        data={exercise.history}
                        renderItem={({ item }) => (
                            <MemoizedHistoryItem
                                item={item}
                                expandedExerciseId={expandedExerciseId}
                                // Richtig: 'updateExerciseHistoryEntry' wird an 'toggleEditEntryModal' von HistoryItem übergeben
                                toggleEditEntryModal={updateExerciseHistoryEntry}
                                // Richtig: 'onDeleteHistoryEntry' (aus MemoizedExerciseItem) wird an 'handleDeleteHistoryEntry' von HistoryItem übergeben
                                handleDeleteHistoryEntry={onDeleteHistoryEntry}
                                styles={styles} // Styles weiterhin als Prop übergeben
                            />
                        )}
                        keyExtractor={(histItem, index) => histItem.id || `temp-${index}`}
                        ListEmptyComponent={<Text style={styles.emptyHistoryText}>Noch keine Einträge für diese Übung.</Text>}
                        scrollEnabled={false}
                    />

                    {/*
                        Der vorherige FAB für das Hinzufügen von Einträgen am unteren Rand
                        ist jetzt auskommentiert, da der obige Button seine Funktion übernimmt.
                        Entferne die Kommentare, wenn du ihn doch behalten möchtest.
                    */}
                    {/*
                    <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 10 }}>
                        <TouchableOpacity
                            style={styles.addEntryFab}
                            onPress={() => toggleAddEntryModal(exercise.id)}
                            accessibilityRole="button"
                            accessibilityLabel={`Neuen Historie-Eintrag für ${exercise.name} hinzufügen`}
                        >
                            <MaterialIcons name="add" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    */}
                </View>
            )}
        </View>
    );
});


// ====================================================================
// TrainingDayScreen Komponente
// ====================================================================
const TrainingDayScreen = ({ route, setTrainingDays, addExerciseToTrainingDay, updateExerciseHistoryEntry, deleteExerciseHistoryEntry, trainingDayData: propTrainingDayData, deleteExercise }) => {
    const [trainingDayData, setTrainingDayDataState] = useState(propTrainingDayData);
    const [expandedExerciseId, setExpandedExerciseId] = useState(null);

    // States für das Hinzufügen neuer Einträge zur Historie (im Modal)
    const [addSets, setAddSets] = useState('');
    const [addReps, setAddReps] = useState('');
    const [addWeight, setAddWeight] = useState('');
    const [isAddEntryModalVisible, setAddEntryModalVisible] = useState(false);
    const [currentExerciseIdForAdd, setCurrentExerciseIdForAdd] = useState(null);

    // States für das Bearbeiten von Historie-Einträgen (im Modal)
    const [isEditEntryModalVisible, setEditEntryModalVisible] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [editSets, setEditSets] = useState('');
    const [editReps, setEditReps] = useState('');
    const [editWeight, setEditWeight] = useState('');
    const [editDate, setEditDate] = useState('');

    // States für das Modal zum Hinzufügen einer neuen Übung
    const [newExerciseName, setNewExerciseName] = useState('');
    const [isExerciseModalVisible, setExerciseModalVisible] = useState(false);


    useEffect(() => {
        if (propTrainingDayData && JSON.stringify(propTrainingDayData) !== JSON.stringify(trainingDayData)) {
            setTrainingDayDataState(propTrainingDayData);
        }
    }, [propTrainingDayData, trainingDayData]);


    // WICHTIG: Funktionen, die an memo-Komponenten übergeben werden,
    // sollten mit useCallback umschlossen werden, um unnötige Re-Renders zu verhindern.
    const toggleExerciseModal = useCallback(() => {
        setExerciseModalVisible(prev => !prev);
        if (!isExerciseModalVisible) { // This check should be based on the updated state, not prev
            setNewExerciseName('');
        }
    }, [isExerciseModalVisible]); // Abhängigkeit hinzufügen


    const toggleAddEntryModal = useCallback((exerciseId = null) => {
        setCurrentExerciseIdForAdd(exerciseId);
        setAddEntryModalVisible(prev => !prev);
        if (!isAddEntryModalVisible) { // This check should be based on the updated state
            setAddSets('');
            setAddReps('');
            setAddWeight('');
        }
    }, [isAddEntryModalVisible]); // Abhängigkeit hinzufügen

    const toggleEditEntryModal = useCallback((entry = null) => {
        setEditingEntry(entry);
        setEditEntryModalVisible(prev => !prev);
        if (entry) {
            setEditSets(String(entry.sets));
            setEditReps(String(entry.reps));
            setEditWeight(String(entry.weight));
            setEditDate(entry.date);
        } else {
            setEditSets('');
            setEditReps('');
            setEditWeight('');
            setEditDate('');
        }
    }, []); // Keine Abhängigkeiten, da es nur den State manipuliert

    const toggleExpand = useCallback((exerciseId) => {
        setExpandedExerciseId(prevId => prevId === exerciseId ? null : exerciseId);
        // Die Logik für das Zurücksetzen der Eingabefelder sollte nicht hier sein,
        // da sie nur bei 'add entry' relevant ist.
    }, []);

    const addEntry = useCallback(() => {
        if (!addSets || !addReps || !addWeight || !currentExerciseIdForAdd) {
            Alert.alert('Fehler', 'Bitte alle Felder ausfüllen.');
            return;
        }

        const newEntry = {
            id: uuidv4(),
            date: new Date().toISOString().slice(0, 10),
            sets: parseInt(addSets),
            reps: addReps.toLowerCase() === 'bw' ? 'BW' : parseFloat(addReps),
            weight: addWeight.toLowerCase() === 'bw' ? 'BW' : parseFloat(addWeight),
        };

        setTrainingDays(prevDays => {
            return prevDays.map(day => {
                if (day.id === trainingDayData.id) {
                    return {
                        ...day,
                        exercises: day.exercises.map(ex => {
                            if (ex.id === currentExerciseIdForAdd) {
                                return { ...ex, history: [...ex.history, newEntry] };
                            }
                            return ex;
                        }),
                    };
                }
                return day;
            });
        });

        setAddSets('');
        setAddReps('');
        setAddWeight('');
        setCurrentExerciseIdForAdd(null);
        toggleAddEntryModal();
        Alert.alert('Erfolg', 'Eintrag hinzugefügt!');
    }, [addSets, addReps, addWeight, currentExerciseIdForAdd, setTrainingDays, trainingDayData.id, toggleAddEntryModal]);


    const handleUpdateEntry = useCallback(() => {
        if (!editingEntry || !editSets || !editReps || !editWeight || !editDate) {
            Alert.alert('Fehler', 'Bitte alle Felder ausfüllen.');
            return;
        }

        const updatedEntry = {
            ...editingEntry,
            date: editDate,
            sets: parseInt(editSets),
            reps: editReps.toLowerCase() === 'bw' ? 'BW' : parseFloat(editReps),
            weight: editWeight.toLowerCase() === 'bw' ? 'BW' : parseFloat(editWeight),
        };

        updateExerciseHistoryEntry(trainingDayData.id, editingEntry.parentId, editingEntry.id, updatedEntry);

        toggleEditEntryModal();
    }, [editingEntry, editSets, editReps, editWeight, editDate, updateExerciseHistoryEntry, trainingDayData.id, toggleEditEntryModal]);

    const handleAddExercise = useCallback(() => {
        if (newExerciseName.trim() === '') {
            Alert.alert('Fehler', 'Bitte gib einen Namen für die Übung ein.');
            return;
        }
        addExerciseToTrainingDay(trainingDayData.id, newExerciseName.trim());
        setNewExerciseName('');
        toggleExerciseModal();
    }, [newExerciseName, addExerciseToTrainingDay, trainingDayData.id, toggleExerciseModal]);

    const handleDeleteHistoryEntry = useCallback((historyEntryId) => {
        const currentExercise = trainingDayData.exercises.find(ex => ex.id === expandedExerciseId);
        if (currentExercise) {
            deleteExerciseHistoryEntry(trainingDayData.id, currentExercise.id, historyEntryId);
        }
    }, [trainingDayData.exercises, expandedExerciseId, deleteExerciseHistoryEntry, trainingDayData.id]);


    return (
        <View style={styles.outerContainer}>
            <ScrollView style={styles.scrollViewContent}>

                <FlatList
                    data={trainingDayData.exercises}
                    renderItem={({ item }) => (
                        <MemoizedExerciseItem
                            item={item}
                            toggleExpand={toggleExpand}
                            expandedExerciseId={expandedExerciseId}
                            deleteExercise={deleteExercise}
                            trainingDayData={trainingDayData}
                            toggleAddEntryModal={toggleAddEntryModal}
                            styles={styles} // Passiere die Styles als Prop
                            onDeleteHistoryEntry={handleDeleteHistoryEntry} // New prop name for clarity
                            updateExerciseHistoryEntry={toggleEditEntryModal} // Passiere die Handler weiter
                        />
                    )}
                    keyExtractor={item => item.id}
                    ListEmptyComponent={<Text style={styles.emptyText}>Noch keine Übungen für diesen Tag.</Text>}
                    scrollEnabled={false}
                />
            </ScrollView>

            <TouchableOpacity
                style={styles.fab}
                onPress={toggleExerciseModal}
                accessibilityRole="button"
                accessibilityLabel="Neue Übung hinzufügen"
            >
                <Text><MaterialIcons name="add" size={30} color="#fff" /></Text>
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
                        {/* FIX: Removed whitespace around Text */}
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={toggleExerciseModal} accessibilityRole="button" accessibilityLabel="Abbrechen">
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        {/* FIX: Removed whitespace around Text */}
                        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleAddExercise} accessibilityRole="button" accessibilityLabel="Übung hinzufügen">
                            <Text style={styles.buttonText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                isVisible={isAddEntryModalVisible}
                onBackdropPress={() => toggleAddEntryModal()}
                onSwipeComplete={() => toggleAddEntryModal()}
                swipeDirection={['down']}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropOpacity={0.7}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Neuen Eintrag hinzufügen</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Anzahl Sätze"
                        placeholderTextColor={styles.inputPlaceholder.color}
                        keyboardType="numeric"
                        value={addSets}
                        onChangeText={setAddSets}
                        accessibilityLabel="Anzahl der Sätze eingeben"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Anzahl Wiederholungen"
                        placeholderTextColor={styles.inputPlaceholder.color}
                        keyboardType="numeric"
                        value={addReps}
                        onChangeText={setAddReps}
                        accessibilityLabel="Anzahl der Wiederholungen eingeben"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Gewicht (kg oder BW)"
                        placeholderTextColor={styles.inputPlaceholder.color}
                        keyboardType="default"
                        value={addWeight}
                        onChangeText={setAddWeight}
                        accessibilityLabel="Gewicht eingeben"
                    />
                    <View style={styles.modalButtonContainer}>
                        {/* FIX: Removed whitespace around Text */}
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => toggleAddEntryModal()} accessibilityRole="button" accessibilityLabel="Abbrechen">
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        {/* FIX: Removed whitespace around Text */}
                        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={addEntry} accessibilityRole="button" accessibilityLabel="Eintrag hinzufügen">
                            <Text style={styles.buttonText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                isVisible={isEditEntryModalVisible}
                onBackdropPress={() => toggleEditEntryModal()}
                onSwipeComplete={() => toggleEditEntryModal()}
                swipeDirection={['down']}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropOpacity={0.7}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Eintrag bearbeiten</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Datum (YYYY-MM-DD)"
                        placeholderTextColor={styles.inputPlaceholder.color}
                        value={editDate}
                        onChangeText={setEditDate}
                        accessibilityLabel="Datum des Eintrags bearbeiten"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Anzahl Sätze"
                        placeholderTextColor={styles.inputPlaceholder.color}
                        keyboardType="numeric"
                        value={editSets}
                        onChangeText={setEditSets}
                        accessibilityLabel="Anzahl der Sätze bearbeiten"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Anzahl Wiederholungen"
                        placeholderTextColor={styles.inputPlaceholder.color}
                        keyboardType="numeric"
                        value={editReps}
                        onChangeText={setEditReps}
                        accessibilityLabel="Anzahl der Wiederholungen bearbeiten"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Gewicht (kg oder BW)"
                        placeholderTextColor={styles.inputPlaceholder.color}
                        keyboardType="default"
                        value={editWeight}
                        onChangeText={setEditWeight}
                        accessibilityLabel="Gewicht bearbeiten"
                    />
                    <View style={styles.modalButtonContainer}>
                        {/* FIX: Removed whitespace around Text */}
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => toggleEditEntryModal()} accessibilityRole="button" accessibilityLabel="Abbrechen">
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        {/* FIX: Removed whitespace around Text */}
                        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleUpdateEntry} accessibilityRole="button" accessibilityLabel="Änderungen speichern">
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: '#121212',
    },
    scrollViewContent: {
        flex: 1,
        paddingTop: 10,
        paddingBottom: 80,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 15,
        color: '#E0E0E0',
    },
    exerciseCard: {
        backgroundColor: '#1E1E1E',
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
        overflow: 'hidden',
    },
    exerciseHeader: {
        flexDirection: 'row', // Wichtig: Diese bleiben hier, damit der TouchableOpacity selbst layoutet
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
    },
    exerciseActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    deleteExerciseButton: {
        padding: 5,
        borderRadius: 5,
        backgroundColor: '#5C0000',
    },
    deleteExerciseButtonIcon: {
        color: '#FF6F61',
    },
    exerciseName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#E0E0E0',
    },
    exerciseDetails: {
        padding: 18,
        paddingTop: 0,
        borderTopWidth: 1,
        borderTopColor: '#333333',
        paddingBottom: 70,
    },
    historySectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        marginTop: 10,
        color: '#F0F0F0',
    },
    historyItem: {
        backgroundColor: '#282828',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#444444',
    },
    historyTextContainer: {
        flex: 1,
        marginRight: 15,
    },
    historyItemActions: {
        flexDirection: 'row',
        gap: 10,
    },
    historyText: {
        fontSize: 15,
        color: '#BBBBBB',
        lineHeight: 22,
    },
    historyLabel: {
        fontWeight: 'bold',
        color: '#E0E0E0',
    },
    editButton: {
        padding: 8,
        borderRadius: 5,
        backgroundColor: '#6A5ACD',
    },
    editButtonIcon: {
        color: '#FFFFFF',
    },
    deleteHistoryButton: {
        padding: 8,
        borderRadius: 5,
        backgroundColor: '#5C0000',
    },
    deleteHistoryButtonIcon: {
        color: '#FF6F61',
    },
    emptyHistoryText: {
        textAlign: 'center',
        paddingVertical: 20,
        fontSize: 16,
        color: '#AAAAAA',
    },
    fab: {
        position: 'absolute',
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        right: 20, // Bleibt rechts
        bottom: 80, // HIER GEÄNDERT: Höherer Wert für mehr Abstand nach unten
        backgroundColor: '#6A5ACD',
        borderRadius: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        zIndex: 10,
    },
    addEntryFab: {
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#28A745',
        borderRadius: 25,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    modalContent: {
        backgroundColor: '#282828',
        padding: 25,
        borderRadius: 15,
        borderColor: '#444444',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#F0F0F0',
    },
    input: {
        width: '100%',
        backgroundColor: '#333333',
        borderWidth: 1,
        borderColor: '#555555',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
        color: '#E0E0E0',
    },
    inputPlaceholder: {
        color: '#BBBBBB',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 10,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 120,
    },
    primaryButton: {
        backgroundColor: '#6A5ACD',
        marginLeft: 10,
    },
    cancelButton: {
        backgroundColor: '#FF6F61',
        marginRight: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    addEntryHeaderButton: { // NEUER STIL FÜR DEN RECHTECKIGEN BUTTON
        backgroundColor: '#6A5ACD', // Grüne Farbe für "Hinzufügen"
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15, // Abstand zur FlatList
        marginTop: 10, // Abstand zum oberen Rand der ExerciseDetails
        flexDirection: 'row', // Für Icon und Text nebeneinander
        gap: 8, // Abstand zwischen Icon und Text
    },
    addEntryButtonText: { // Text-Stil für den neuen Button
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default TrainingDayScreen;