import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { getPatientRecordsAsDoctor, createPatientRecord } from '../../services/doctorService';
import { FontAwesome5 } from '@expo/vector-icons';
import dayjs from 'dayjs';

interface Record {
    id: number;
    diagnosis: string;
    prescription: string;
    notes: string;
    created_at: string;
}

const PatientRecordsScreen = ({ route }: any) => {
    const { patient } = route.params; // Passed from DoctorPatientsListScreen
    const [records, setRecords] = useState<Record[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAdding, setIsAdding] = useState(false);
    const [diagnosis, setDiagnosis] = useState('');
    const [prescription, setPrescription] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const data = await getPatientRecordsAsDoctor(patient.id);
            setRecords(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const handleSubmit = async () => {
        if (!diagnosis) {
            Alert.alert('Error', 'Diagnosis is required.');
            return;
        }

        try {
            setSubmitting(true);
            await createPatientRecord(patient.id, diagnosis, prescription, notes, '');
            Alert.alert('Success', 'Patient record added successfully.');
            setIsAdding(false);
            setDiagnosis('');
            setPrescription('');
            setNotes('');
            fetchRecords(); // Refresh list
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to add record.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderItem = ({ item }: { item: Record }) => (
        <View style={styles.card}>
            <Text style={styles.date}>{dayjs(item.created_at).format('MMMM D, YYYY')}</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Diagnosis:</Text>
                <Text style={styles.sectionText}>{item.diagnosis}</Text>
            </View>

            {item.prescription ? (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Prescription:</Text>
                    <Text style={styles.sectionText}>{item.prescription}</Text>
                </View>
            ) : null}

            {item.notes ? (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notes:</Text>
                    <Text style={styles.sectionText}>{item.notes}</Text>
                </View>
            ) : null}
        </View>
    );

    if (isAdding) {
        return (
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView style={styles.formContainer} keyboardShouldPersistTaps="handled">
                    <Text style={styles.formHeader}>New Record for {patient.name}</Text>

                    <Text style={styles.label}>Diagnosis *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Viral Fever, Hypertension"
                        value={diagnosis}
                        onChangeText={setDiagnosis}
                    />

                    <Text style={styles.label}>Prescription</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Medicines and Dosage..."
                        value={prescription}
                        onChangeText={setPrescription}
                        multiline
                        textAlignVertical="top"
                    />

                    <Text style={styles.label}>Additional Notes / Advice</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Rest for 3 days, drink warm water..."
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        textAlignVertical="top"
                    />

                    <View style={styles.formActions}>
                        <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => setIsAdding(false)}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.btn, styles.submitBtn]} onPress={handleSubmit} disabled={submitting}>
                            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Save Record</Text>}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#2E7D32" /></View>
            ) : records.length === 0 ? (
                <View style={styles.center}>
                    <FontAwesome5 name="file-medical" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>No previous records found for {patient.name}.</Text>
                </View>
            ) : (
                <FlatList
                    data={records}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                />
            )}

            <TouchableOpacity style={styles.fab} onPress={() => setIsAdding(true)}>
                <FontAwesome5 name="plus" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

export default PatientRecordsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAF9',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    date: {
        fontSize: 14,
        color: '#888',
        marginBottom: 12,
        fontWeight: 'bold',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 8,
    },
    section: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    sectionText: {
        fontSize: 15,
        color: '#555',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#2E7D32',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
    },
    // Form Styles
    formContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F8FAF9',
    },
    formHeader: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        marginBottom: 20,
    },
    textArea: {
        height: 120,
    },
    formActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 40,
    },
    btn: {
        flex: 1,
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelBtn: {
        backgroundColor: '#e0e0e0',
        marginRight: 10,
    },
    cancelBtnText: {
        color: '#333',
        fontWeight: 'bold',
        fontSize: 16,
    },
    submitBtn: {
        backgroundColor: '#2E7D32',
        marginLeft: 10,
    },
    submitBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
