import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Linking, Modal, ScrollView } from 'react-native';
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
    
    // Reschedule States
    const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
    const [selectedApptId, setSelectedApptId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedTime, setSelectedTime] = useState('10:00 AM');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const timeSlots = ['10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '04:00 PM', '05:00 PM'];
    const next7Days = Array.from({ length: 7 }).map((_, i) => dayjs().add(i, 'day'));

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

    const handleReschedule = async () => {
        if (!selectedApptId) return;
        try {
            setIsSubmitting(true);
            const combinedDateTimeString = selectedDate.format('YYYY-MM-DD') + ' ' + selectedTime;
            const finalISOString = dayjs(combinedDateTimeString, 'YYYY-MM-DD hh:mm A').toISOString();

            await updateAppointmentStatus(selectedApptId, 'scheduled', finalISOString);
            
            Alert.alert('Success', 'Appointment formally rescheduled.');
            setRescheduleModalVisible(false);
            fetchAppointments();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to reschedule appointment.');
        } finally {
            setIsSubmitting(false);
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

                    {/* Show "Mark Completed" strictly if it is Today or in the Past */}
                    {isScheduled && (isToday || isPast) && (
                        <TouchableOpacity style={styles.completeBtn} onPress={() => handleUpdateStatus(item.id, 'completed')}>
                            <Text style={styles.actionBtnText}>Mark Completed</Text>
                        </TouchableOpacity>
                    )}

                    {/* Show "Reschedule" if scheduled */}
                    {isScheduled && (
                        <TouchableOpacity 
                            style={[styles.cancelBtn, { backgroundColor: '#FFF3E0' }]} 
                            onPress={() => {
                                setSelectedApptId(item.id);
                                setSelectedDate(dayjs(item.appointment_date));
                                setSelectedTime(dayjs(item.appointment_date).format('hh:mm A'));
                                setRescheduleModalVisible(true);
                            }}
                        >
                            <Text style={[styles.actionBtnText, { color: '#E65100' }]}>Reschedule</Text>
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

            {/* RESCHEDULE MODAL */}
            <Modal visible={rescheduleModalVisible} animationType="slide" transparent={true}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '80%' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>Reschedule Appointment</Text>
                            <TouchableOpacity onPress={() => setRescheduleModalVisible(false)} style={{ padding: 5 }}>
                                <FontAwesome5 name="times" size={20} color="#999" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#555', marginBottom: 12 }}>Select New Date</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 25 }}>
                                {next7Days.map((d, index) => {
                                    const isSelected = selectedDate.isSame(d, 'day');
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={{
                                                width: 70, height: 80, borderRadius: 16, justifyContent: 'center', alignItems: 'center',
                                                backgroundColor: isSelected ? '#00695C' : '#F5F7FA', marginRight: 12,
                                                borderWidth: 1, borderColor: isSelected ? '#00695C' : '#E0E0E0'
                                            }}
                                            onPress={() => setSelectedDate(d)}
                                        >
                                            <Text style={{ fontSize: 14, color: isSelected ? '#fff' : '#666', marginBottom: 4 }}>{d.format('MMM')}</Text>
                                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: isSelected ? '#fff' : '#333' }}>{d.format('DD')}</Text>
                                            <Text style={{ fontSize: 12, color: isSelected ? '#fff' : '#888', marginTop: 4 }}>{d.format('ddd')}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>

                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#555', marginBottom: 12 }}>Select New Time</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                {timeSlots.map((time, index) => {
                                    const isSelected = selectedTime === time;
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={{
                                                paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12,
                                                backgroundColor: isSelected ? '#00695C' : '#F5F7FA',
                                                borderWidth: 1, borderColor: isSelected ? '#00695C' : '#E0E0E0'
                                            }}
                                            onPress={() => setSelectedTime(time)}
                                        >
                                            <Text style={{ fontWeight: 'bold', color: isSelected ? '#fff' : '#555' }}>{time}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            style={{ backgroundColor: '#00695C', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 24 }}
                            onPress={handleReschedule}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Confirm Reschedule</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
