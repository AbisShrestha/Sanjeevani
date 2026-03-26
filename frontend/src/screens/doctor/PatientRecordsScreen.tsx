import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Linking, SectionList } from 'react-native';
import { getPatientRecordsAsDoctor, createPatientRecord } from '../../services/doctorService';
import { FontAwesome5 } from '@expo/vector-icons';
import dayjs from 'dayjs';
import api, { SERVER_URL } from '../../services/api';

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
    const [patientReports, setPatientReports] = useState<any[]>([]);
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
            // Also fetch uploaded medical reports
            try {
                const reportsRes = await api.get(`/reports/patient/${patient.id}`);
                setPatientReports(reportsRes.data);
            } catch (e) {
                // Reports endpoint may 403 for non-doctors, ignore gracefully
                setPatientReports([]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const handleViewReport = (filename: string) => {
        const url = `${SERVER_URL}/uploads/reports/${filename}`;
        Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open report.'));
    };

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
            ) : (
                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
                    {/* Patient Uploaded Medical Reports */}
                    {patientReports.length > 0 && (
                        <View style={styles.reportsSection}>
                            <Text style={styles.reportsSectionTitle}>
                                <FontAwesome5 name="file-medical-alt" size={16} color="#E65100" />  Uploaded Medical Reports
                            </Text>
                            {patientReports.map((report: any) => (
                                <TouchableOpacity
                                    key={report.reportid}
                                    style={styles.reportItem}
                                    onPress={() => handleViewReport(report.filename)}
                                >
                                    <View style={styles.reportIcon}>
                                        <FontAwesome5
                                            name={report.mimetype === 'application/pdf' ? 'file-pdf' : 'file-image'}
                                            size={20}
                                            color={report.mimetype === 'application/pdf' ? '#E53935' : '#1E88E5'}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.reportName} numberOfLines={1}>{report.originalname}</Text>
                                        <Text style={styles.reportMeta}>
                                            {(report.filesize / (1024 * 1024)).toFixed(1)} MB • {dayjs(report.uploadedat).format('DD MMM YYYY')}
                                        </Text>
                                    </View>
                                    <FontAwesome5 name="external-link-alt" size={14} color="#999" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Doctor Records */}
                    {records.length === 0 && patientReports.length === 0 ? (
                        <View style={styles.center}>
                            <FontAwesome5 name="file-medical" size={60} color="#ccc" />
                            <Text style={styles.emptyText}>No previous records found for {patient.name}.</Text>
                        </View>
                    ) : (
                        <>
                            {records.length > 0 && (
                                <Text style={styles.reportsSectionTitle}>
                                    <FontAwesome5 name="notes-medical" size={16} color="#2E7D32" />  Doctor Notes
                                </Text>
                            )}
                            {records.map((item) => (
                                <View key={item.id} style={styles.card}>
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
                            ))}
                        </>
                    )}
                </ScrollView>
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
    // Reports Section
    reportsSection: {
        marginBottom: 20,
    },
    reportsSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    reportItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    reportIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    reportName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    reportMeta: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
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
