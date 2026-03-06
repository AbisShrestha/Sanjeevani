import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { getAppointmentsAsDoctor } from '../../services/doctorService';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface Patient {
    id: number;
    name: string;
    email: string;
}

const DoctorPatientsListScreen = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<any>();

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            // Derive patient list from appointments
            const appointments = await getAppointmentsAsDoctor();

            const uniquePatientsMap = new Map<number, Patient>();
            appointments.forEach((appt: any) => {
                if (!uniquePatientsMap.has(appt.patient_id)) {
                    uniquePatientsMap.set(appt.patient_id, {
                        id: appt.patient_id,
                        name: appt.patient_name,
                        email: appt.patient_email,
                    });
                }
            });

            setPatients(Array.from(uniquePatientsMap.values()));
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch patients list');
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: Patient }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('PatientRecords', { patient: item })}
        >
            <View style={styles.iconContainer}>
                <FontAwesome5 name="user" size={20} color="#2E7D32" />
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={16} color="#ccc" />
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2E7D32" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {patients.length === 0 ? (
                <View style={styles.center}>
                    <FontAwesome5 name="users" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>You haven't seen any patients yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={patients}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                />
            )}
        </View>
    );
};

export default DoctorPatientsListScreen;

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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: '#666',
    },
});
