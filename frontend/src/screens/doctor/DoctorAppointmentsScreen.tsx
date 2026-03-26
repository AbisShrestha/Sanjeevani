import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { getAppointmentsAsDoctor, updateAppointmentStatus } from '../../services/doctorService';
import { FontAwesome5 } from '@expo/vector-icons';
import dayjs from 'dayjs';

interface Appointment {
    id: number;
    patient_name: string;
    patient_email: string;
    appointment_date: string;
    status: string;
    jitsi_link: string;
    reason: string;
}

const DoctorAppointmentsScreen = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const data = await getAppointmentsAsDoctor();
            setAppointments(data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await updateAppointmentStatus(id, status);
            fetchAppointments();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const handleJoinCall = (link: string) => {
        if (!link) {
            Alert.alert('Error', 'Video call link is missing.');
            return;
        }
        Linking.openURL(link);
    };

    const renderItem = ({ item }: { item: Appointment }) => {
        const isPast = dayjs(item.appointment_date).isBefore(dayjs());
        const isToday = dayjs(item.appointment_date).isSame(dayjs(), 'day');
        // Backend uses: 'scheduled' (default/confirmed), 'completed', 'cancelled'
        const isScheduled = item.status === 'scheduled' || item.status === 'confirmed';
        const isCompleted = item.status === 'completed';
        const isCancelled = item.status === 'cancelled';

        // Determine display status
        let displayStatus = item.status.toUpperCase();
        let statusStyle = styles.statusPending;
        if (isScheduled) {
            displayStatus = 'CONFIRMED';
            statusStyle = styles.statusConfirmed;
        } else if (isCompleted) {
            displayStatus = 'COMPLETED';
            statusStyle = styles.statusConfirmed;
        } else if (isCancelled) {
            displayStatus = 'CANCELLED';
            statusStyle = styles.statusPending;
        }

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.patientName}>{item.patient_name}</Text>
                    <View style={[styles.statusBadge, statusStyle]}>
                        <Text style={styles.statusText}>{displayStatus}</Text>
                    </View>
                </View>

                <Text style={styles.dateText}>
                    <FontAwesome5 name="calendar-alt" size={14} color="#666" /> {dayjs(item.appointment_date).format('MMM D, YYYY h:mm A')}
                </Text>

                {item.reason ? (
                    <Text style={styles.reasonText}>
                        <Text style={{ fontWeight: 'bold' }}>Reason:</Text> {item.reason}
                    </Text>
                ) : null}

                <View style={styles.actionRow}>
                    {/* Show "Join Call" if confirmed/scheduled and appointment is today or upcoming */}
                    {isScheduled && (!isPast || isToday) && (
                        <TouchableOpacity style={styles.joinBtn} onPress={() => handleJoinCall(item.jitsi_link)}>
                            <FontAwesome5 name="video" size={14} color="#fff" />
                            <Text style={[styles.actionBtnText, { marginLeft: 6 }]}>Join Call</Text>
                        </TouchableOpacity>
                    )}

                    {/* Show "Mark Completed" if it's past and still scheduled */}
                    {isScheduled && isPast && (
                        <TouchableOpacity style={styles.completeBtn} onPress={() => handleUpdateStatus(item.id, 'completed')}>
                            <Text style={styles.actionBtnText}>Mark Completed</Text>
                        </TouchableOpacity>
                    )}

                    {/* Show "Cancel" if scheduled (not completed or already cancelled) */}
                    {isScheduled && (
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => handleUpdateStatus(item.id, 'cancelled')}>
                            <Text style={[styles.actionBtnText, { color: '#d32f2f' }]}>Cancel</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2E7D32" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {appointments.length === 0 ? (
                <View style={styles.center}>
                    <FontAwesome5 name="calendar-times" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>No appointments found.</Text>
                </View>
            ) : (
                <FlatList
                    data={appointments}
                    keyExtractor={(item: any) => (item.id || Math.random()).toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                />
            )}
        </View>
    );
};

export default DoctorAppointmentsScreen;

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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    patientName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusPending: {
        backgroundColor: '#fff3e0',
    },
    statusConfirmed: {
        backgroundColor: '#e8f5e9',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
    },
    dateText: {
        fontSize: 15,
        color: '#555',
        marginBottom: 8,
    },
    reasonText: {
        fontSize: 14,
        color: '#444',
        marginBottom: 16,
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 8,
    },
    actionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 10,
    },
    confirmBtn: {
        backgroundColor: '#43a047',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    joinBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e88e5',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    completeBtn: {
        backgroundColor: '#8e24aa',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    cancelBtn: {
        backgroundColor: '#ffebee',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    actionBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
