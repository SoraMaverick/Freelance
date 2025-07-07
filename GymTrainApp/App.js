// App.js
import React, { useState, useEffect, useCallback } from 'react'; // useCallback hinzugefügt
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet, FlatList, TouchableOpacity, TextInput, Button, Alert, ActivityIndicator } from 'react-native'; // ActivityIndicator für Ladezustand
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage importieren
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import Modal from 'react-native-modal';
import { MaterialIcons } from '@expo/vector-icons';

// Import der Screen-Komponenten
import TrainingDayScreen from './TrainingDayScreen';

// Initialdaten - Wird nur verwendet, wenn keine Daten in AsyncStorage gefunden werden
const initialDUMMY_DATA = [
  {
    id: 'td1',
    title: 'Push Day',
    exercises: [
      { id: 'ex1', name: 'Bankdrücken', history: [
          { id: uuidv4(), date: '2025-05-26', sets: 3, reps: 8, weight: 60 },
          { id: uuidv4(), date: '2025-06-02', sets: 3, reps: 9, weight: 62.5 },
      ]},
      { id: 'ex2', name: 'Schulterdrücken', history: [
          { id: uuidv4(), date: '2025-05-26', sets: 4, reps: 10, weight: 30 },
      ]},
      { id: 'ex3', name: 'Trizepsdrücken', history: [
          { id: uuidv4(), date: '2025-05-26', sets: 3, reps: 12, weight: 20 },
      ]},
    ],
  },
  {
    id: 'td2',
    title: 'Pull Day',
    exercises: [
      { id: 'ex4', name: 'Kreuzheben', history: [
          { id: uuidv4(), date: '2025-05-27', sets: 3, reps: 5, weight: 100 },
      ]},
      { id: 'ex5', name: 'Klimmzüge', history: [
          { id: uuidv4(), date: '2025-05-27', sets: 3, reps: 8, weight: 'BW' },
      ]},
    ],
  },
  {
    id: 'td3',
    title: 'Leg Day',
    exercises: [
      { id: 'ex6', name: 'Kniebeugen', history: [
          { id: uuidv4(), date: '2025-05-28', sets: 4, reps: 8, weight: 80 },
      ]},
      { id: 'ex7', name: 'Beinpresse', history: [
          { id: uuidv4(), date: '2025-05-28', sets: 3, reps: 12, weight: 150 },
      ]},
    ],
  },
];

const STORAGE_KEY = '@training_app_data'; // Eindeutiger Schlüssel für AsyncStorage

function HomeScreen({ navigation, trainingDays, addTrainingDay, deleteTrainingDay }) {
    const [newDayTitle, setNewDayTitle] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const handleAddDay = () => {
        if (newDayTitle.trim() === '') {
            Alert.alert('Fehler', 'Bitte gib einen Titel für den Trainingstag ein.');
            return;
        }
        addTrainingDay(newDayTitle.trim());
        setNewDayTitle('');
        toggleModal();
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('TrainingDay', { trainingDay: item })}
            accessibilityRole="button"
            accessibilityLabel={`Öffne Trainingstag ${item.title}`}
        >
            <Text style={styles.itemTitle}>{item.title}</Text>
            <View style={styles.itemActions}>
              <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteTrainingDay(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Lösche Trainingstag ${item.title}`}
              >
                  <MaterialIcons name="delete" size={24} color={styles.deleteButtonIcon.color} />
              </TouchableOpacity>
              <Text> {/* MaterialIcons in einem <Text>-Tag, um die Warnung zu beheben */}
                <MaterialIcons name="chevron-right" size={24} color={styles.itemTitle.color} />
              </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Deine Trainingstage</Text>

            <FlatList
                data={trainingDays}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                ListEmptyComponent={<Text style={styles.emptyText}>Noch keine Trainingstage hinzugefügt.</Text>}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={toggleModal}
                accessibilityRole="button"
                accessibilityLabel="Neuen Trainingstag hinzufügen"
            >
                <MaterialIcons name="add" size={30} color="#fff" />
            </TouchableOpacity>

            <Modal
                isVisible={isModalVisible}
                onBackdropPress={toggleModal}
                onSwipeComplete={toggleModal}
                swipeDirection={['down']}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropOpacity={0.7}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Neuen Trainingstag hinzufügen</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Titel des Trainingstags"
                        placeholderTextColor={styles.inputPlaceholder.color}
                        value={newDayTitle}
                        onChangeText={setNewDayTitle}
                        accessibilityLabel="Titel des Trainingstags eingeben"
                    />
                    <View style={styles.modalButtonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={toggleModal}
                            accessibilityRole="button"
                            accessibilityLabel="Abbrechen"
                        >
                            <Text style={styles.buttonText}>Abbrechen</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton]}
                            onPress={handleAddDay}
                            accessibilityRole="button"
                            accessibilityLabel="Trainingstag hinzufügen"
                        >
                            <Text style={styles.buttonText}>Hinzufügen</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const Stack = createNativeStackNavigator();

export default function App() {
  const [trainingDays, setTrainingDays] = useState(null); // Initial null, um Ladezustand anzuzeigen
  const [isLoading, setIsLoading] = useState(true); // Ladezustand

  // Funktion zum Speichern der Daten
  const saveData = useCallback(async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      // console.log('Daten erfolgreich gespeichert.'); // Debug-Ausgabe
    } catch (error) {
      console.error('Fehler beim Speichern der Daten:', error);
      Alert.alert('Fehler', 'Daten konnten nicht gespeichert werden.');
    }
  }, []);

  // Funktion zum Laden der Daten
  const loadData = useCallback(async () => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData !== null) {
        setTrainingDays(JSON.parse(storedData));
        // console.log('Daten erfolgreich geladen.'); // Debug-Ausgabe
      } else {
        setTrainingDays(initialDUMMY_DATA); // Wenn keine Daten vorhanden sind, initialisiere mit Dummy-Daten
        // console.log('Keine gespeicherten Daten gefunden, initialisiere mit Dummy-Daten.'); // Debug-Ausgabe
      }
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
      Alert.alert('Fehler', 'Daten konnten nicht geladen werden. Initialisiere mit Standarddaten.');
      setTrainingDays(initialDUMMY_DATA); // Fallback auf Dummy-Daten bei Fehler
    } finally {
      setIsLoading(false); // Ladevorgang beendet
    }
  }, []);

  // Effekt zum Laden der Daten beim ersten Rendern der App
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Effekt zum Speichern der Daten, wenn sich trainingDays ändert
  useEffect(() => {
    if (trainingDays !== null) { // Nur speichern, wenn trainingDays geladen wurde
      saveData(trainingDays);
    }
  }, [trainingDays, saveData]);


  const addTrainingDay = (title) => {
    const newTrainingDay = {
      id: uuidv4(),
      title: title,
      exercises: [],
    };
    setTrainingDays(prevDays => [...prevDays, newTrainingDay]);
  };

  const deleteTrainingDay = (trainingDayId) => {
      Alert.alert(
          "Trainingstag löschen",
          "Bist du sicher, dass du diesen Trainingstag löschen möchtest? Alle zugehörigen Daten gehen verloren.",
          [
              {
                  text: "Abbrechen",
                  style: "cancel"
              },
              {
                  text: "Löschen",
                  onPress: () => {
                      setTrainingDays(prevDays => prevDays.filter(day => day.id !== trainingDayId));
                      Alert.alert('Erfolg', 'Trainingstag gelöscht!');
                  },
                  style: "destructive"
              }
          ]
      );
  };

  const addExerciseToTrainingDay = (trainingDayId, exerciseName) => {
    setTrainingDays(prevDays => {
      return prevDays.map(day => {
        if (day.id === trainingDayId) {
          return {
            ...day,
            exercises: [
              ...day.exercises,
              {
                id: uuidv4(),
                name: exerciseName,
                history: [],
              },
            ],
          };
        }
        return day;
      });
    });
  };

  const deleteExercise = (trainingDayId, exerciseId) => {
      Alert.alert(
          "Übung löschen",
          "Bist du sicher, dass du diese Übung löschen möchtest? Alle zugehörigen Daten gehen verloren.",
          [
              {
                  text: "Abbrechen",
                  style: "cancel"
              },
              {
                  text: "Löschen",
                  onPress: () => {
                      setTrainingDays(prevDays => {
                          return prevDays.map(day => {
                              if (day.id === trainingDayId) {
                                  return {
                                      ...day,
                                      exercises: day.exercises.filter(ex => ex.id !== exerciseId),
                                  };
                              }
                              return day;
                          });
                      });
                      Alert.alert('Erfolg', 'Übung gelöscht!');
                  },
                  style: "destructive"
              }
          ]
      );
  };

  const updateExerciseHistoryEntry = (trainingDayId, exerciseId, entryId, updatedEntry) => {
    setTrainingDays(prevDays => {
      return prevDays.map(day => {
        if (day.id === trainingDayId) {
          return {
            ...day,
            exercises: day.exercises.map(ex => {
              if (ex.id === exerciseId) {
                return {
                  ...ex,
                  history: ex.history.map(entry =>
                    entry.id === entryId ? { ...entry, ...updatedEntry } : entry
                  ),
                };
              }
              return ex;
            }),
          };
        }
        return day;
      });
    });
    Alert.alert('Erfolg', 'Eintrag aktualisiert!');
  };

  const deleteExerciseHistoryEntry = (trainingDayId, exerciseId, entryId) => {
    Alert.alert(
        "Eintrag löschen",
        "Bist du sicher, dass du diesen Eintrag löschen möchtest?",
        [
            {
                text: "Abbrechen",
                style: "cancel"
            },
            {
                text: "Löschen",
                onPress: () => {
                    setTrainingDays(prevDays => {
                        return prevDays.map(day => {
                            if (day.id === trainingDayId) {
                                return {
                                    ...day,
                                    exercises: day.exercises.map(ex => {
                                        if (ex.id === exerciseId) {
                                            return {
                                                ...ex,
                                                history: ex.history.filter(entry => entry.id !== entryId),
                                            };
                                        }
                                        return ex;
                                    }),
                                };
                            }
                            return day;
                        });
                    });
                    Alert.alert('Erfolg', 'Eintrag gelöscht!');
                },
                style: "destructive"
            }
        ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Daten werden geladen...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: { backgroundColor: '#4285F4' },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen
            name="Home"
            options={{ title: 'Home' }}
          >
            {props => (
              <HomeScreen
                {...props}
                trainingDays={trainingDays}
                addTrainingDay={addTrainingDay}
                deleteTrainingDay={deleteTrainingDay}
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="TrainingDay"
            options={({ route }) => ({ title: route.params.trainingDay.title })}
          >
            {props => {
              const selectedTrainingDay = Array.isArray(trainingDays)
                ? trainingDays.find(day => day.id === props.route.params.trainingDay.id)
                : null;

              if (!selectedTrainingDay) {
                  return (
                      <View style={styles.loadingContainer}>
                          <Text style={styles.loadingText}>Trainingstag wird geladen oder nicht gefunden...</Text>
                      </View>
                  );
              }

              return (
                <TrainingDayScreen
                  {...props}
                  trainingDayData={selectedTrainingDay}
                  setTrainingDays={setTrainingDays}
                  addExerciseToTrainingDay={addExerciseToTrainingDay}
                  updateExerciseHistoryEntry={updateExerciseHistoryEntry}
                  deleteExerciseHistoryEntry={deleteExerciseHistoryEntry}
                  deleteExercise={deleteExercise}
                />
              );
            }}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 18,
    color: '#616161',
    marginTop: 10,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#212121',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
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
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#FFEBEE',
  },
  deleteButtonIcon: {
    color: '#EA4335',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#616161',
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