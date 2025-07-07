// TrainingDayScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Button, Alert, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import Modal from 'react-native-modal';

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


  // WICHTIG: Dieser useEffect synchronisiert den lokalen State mit den Props von App.js
  useEffect(() => {
    if (propTrainingDayData && JSON.stringify(propTrainingDayData) !== JSON.stringify(trainingDayData)) {
      setTrainingDayDataState(propTrainingDayData);
    }
  }, [propTrainingDayData, trainingDayData]);


  const toggleExerciseModal = () => {
    setExerciseModalVisible(!isExerciseModalVisible);
    if (!isExerciseModalVisible) {
      setNewExerciseName('');
    }
  };

  const toggleAddEntryModal = (exerciseId = null) => {
    setCurrentExerciseIdForAdd(exerciseId);
    setAddEntryModalVisible(!isAddEntryModalVisible);
    if (!isAddEntryModalVisible) {
      setAddSets('');
      setAddReps('');
      setAddWeight('');
    }
  };

  const toggleEditEntryModal = (entry = null, exerciseId = null) => {
    setEditingEntry(entry);
    setEditEntryModalVisible(!isEditEntryModalVisible);
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
  };

  const toggleExpand = (exerciseId) => {
    setExpandedExerciseId(expandedExerciseId === exerciseId ? null : exerciseId);
    if (expandedExerciseId === exerciseId) {
      setAddSets('');
      setAddReps('');
      setAddWeight('');
      setCurrentExerciseIdForAdd(null);
    }
  };

  const addEntry = () => {
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
  };

  const handleUpdateEntry = () => {
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
  };

  const handleAddExercise = () => {
    if (newExerciseName.trim() === '') {
      Alert.alert('Fehler', 'Bitte gib einen Namen für die Übung ein.');
      return;
    }
    addExerciseToTrainingDay(trainingDayData.id, newExerciseName.trim());
    setNewExerciseName('');
    toggleExerciseModal();
  };

  const handleDeleteHistoryEntry = (historyEntryId) => {
      const currentExercise = trainingDayData.exercises.find(ex => ex.id === expandedExerciseId);
      if (currentExercise) {
          deleteExerciseHistoryEntry(trainingDayData.id, currentExercise.id, historyEntryId);
      }
  };

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <View>
        <Text style={styles.historyText}><Text style={styles.historyLabel}>Datum:</Text> {item.date}</Text>
        <Text style={styles.historyText}><Text style={styles.historyLabel}>Sätze:</Text> {item.sets}</Text>
        <Text style={styles.historyText}><Text style={styles.historyLabel}>Wiederholungen:</Text> {item.reps}</Text>
        <Text style={styles.historyText}><Text style={styles.historyLabel}>Gewicht:</Text> {item.weight} kg</Text>
      </View>
      <View style={styles.historyItemActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => toggleEditEntryModal({ ...item, parentId: expandedExerciseId })}
          accessibilityRole="button"
          accessibilityLabel={`Eintrag vom ${item.date} bearbeiten`}
        >
          <MaterialIcons name="edit" size={20} color={styles.editButtonIcon.color} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteHistoryButton}
          onPress={() => handleDeleteHistoryEntry(item.id)}
          accessibilityRole="button"
          accessibilityLabel={`Eintrag vom ${item.date} löschen`}
        >
          <MaterialIcons name="delete" size={20} color={styles.deleteHistoryButtonIcon.color} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderExerciseItem = ({ item: exercise }) => (
    <View style={styles.exerciseCard}>
      <TouchableOpacity
        onPress={() => toggleExpand(exercise.id)}
        style={styles.exerciseHeader}
        accessibilityRole="button"
        accessibilityLabel={expandedExerciseId === exercise.id ? `Übung ${exercise.name} einklappen` : `Übung ${exercise.name} ausklappen`}
      >
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
            <MaterialIcons name="delete" size={24} color={styles.deleteExerciseButtonIcon.color} />
          </TouchableOpacity>
          {/* MaterialIcons in einem <Text>-Tag, um die Warnung zu beheben */}
          <Text>
            <MaterialIcons
              name={expandedExerciseId === exercise.id ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={24}
              color={styles.exerciseName.color}
            />
          </Text>
        </View>
      </TouchableOpacity>

      {expandedExerciseId === exercise.id && (
        <View style={styles.exerciseDetails}>
          <Text style={styles.historySectionTitle}>Trainingshistorie:</Text>
          <FlatList
            data={exercise.history}
            renderItem={renderHistoryItem}
            keyExtractor={(histItem, index) => histItem.id || `temp-${index}`}
            ListEmptyComponent={<Text style={styles.emptyHistoryText}>Noch keine Einträge für diese Übung.</Text>}
            scrollEnabled={false}
          />
          
          <TouchableOpacity
            style={styles.addEntryFab}
            onPress={() => toggleAddEntryModal(exercise.id)}
            accessibilityRole="button"
            accessibilityLabel={`Neuen Historie-Eintrag für ${exercise.name} hinzufügen`}
          >
            <MaterialIcons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.outerContainer}>
      <ScrollView style={styles.scrollViewContent}>
        <Text style={styles.description}>Tippe auf eine Übung, um die Historie anzuzeigen:</Text>
        
        <FlatList
          data={trainingDayData.exercises}
          renderItem={renderExerciseItem}
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
        <MaterialIcons name="add" size={30} color="#fff" />
      </TouchableOpacity>

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
            <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={toggleExerciseModal}
                accessibilityRole="button"
                accessibilityLabel="Abbrechen"
            >
                <Text style={styles.buttonText}>Abbrechen</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleAddExercise}
                accessibilityRole="button"
                accessibilityLabel="Übung hinzufügen"
            >
                <Text style={styles.buttonText}>Hinzufügen</Text>
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
            <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => toggleAddEntryModal()}
                accessibilityRole="button"
                accessibilityLabel="Abbrechen"
            >
                <Text style={styles.buttonText}>Abbrechen</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={addEntry}
                accessibilityRole="button"
                accessibilityLabel="Eintrag hinzufügen"
            >
                <Text style={styles.buttonText}>Eintrag hinzufügen</Text>
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
            <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => toggleEditEntryModal()}
                accessibilityRole="button"
                accessibilityLabel="Abbrechen"
            >
                <Text style={styles.buttonText}>Abbrechen</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleUpdateEntry}
                accessibilityRole="button"
                accessibilityLabel="Änderungen speichern"
            >
                <Text style={styles.buttonText}>Speichern</Text>
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
    backgroundColor: '#F5F5F5',
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
    color: '#616161',
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  exerciseHeader: {
    flexDirection: 'row',
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
    backgroundColor: '#FFEBEE',
  },
  deleteExerciseButtonIcon: {
    color: '#EA4335',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  exerciseDetails: {
    padding: 18,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingBottom: 70,
  },
  historySectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 10,
    color: '#212121',
  },
  historyItem: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  historyText: {
    fontSize: 15,
    color: '#616161',
    lineHeight: 22,
  },
  historyLabel: {
    fontWeight: 'bold',
    color: '#212121',
  },
  historyItemActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#E8EAF6',
  },
  editButtonIcon: {
    color: '#4285F4',
  },
  deleteHistoryButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#FFEBEE',
  },
  deleteHistoryButtonIcon: {
    color: '#EA4335',
  },
  emptyHistoryText: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 16,
    color: '#9E9E9E',
  },
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#4285F4',
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 10,
  },
  addEntryFab: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    right: 15,
    bottom: 15,
    backgroundColor: '#34A853',
    borderRadius: 25,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 15,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#212121',
  },
  input: {
    width: '100%',
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#212121',
  },
  inputPlaceholder: {
    color: '#9E9E9E',
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
    backgroundColor: '#4285F4',
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#EA4335',
    marginRight: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TrainingDayScreen;