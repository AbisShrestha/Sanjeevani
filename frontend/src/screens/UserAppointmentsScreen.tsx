import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Linking, RefreshControl, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { getAppointmentsAsPatient } from '../services/doctorService';

export default function UserAppointmentsScreen({ navigation }: { navigation: any }) {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAppointments = async () => {
        try {
            const data = await getAppointmentsAsPatient();
            setAppointments(data);
        } catch (error) {
            console.error('Failed to fetch patient appointments', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAppointments();
    };

    const handleJoinCall = (url: string) => {
        if (url) {
            Linking.openURL(url).catch(() => {
                alert('Could not open the video call link.');
            });
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const aptDate = dayjs(item.appointment_date);
        const isUpcoming = aptDate.isAfter(dayjs());
        const isToday = aptDate.isSame(dayjs(), 'day');

        // Define status styles
        let statusColor = '#F57F17'; // Pending orange
        let statusBg = '#FFF8E1';
        let statusText = 'Pending';

        if (item.status === 'scheduled' || item.status === 'confirmed') {
            statusColor = '#00695C';
            statusBg = '#E0F2F1';
            statusText = 'Confirmed';
        } else if (item.status === 'completed') {
            statusColor = '#4CAF50';
            statusBg = '#E8F5E9';
            statusText = 'Completed';
        } else if (item.status === 'cancelled') {
            statusColor = '#F44336';
            statusBg = '#FFEBEE';
            statusText = 'Cancelled';
        }

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.date}>{aptDate.format('DD MMM YYYY')}</Text>
                        <Text style={styles.time}>{aptDate.format('hh:mm A')}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.doctorInfo}>
                    <View style={styles.doctorIcon}>
                        <FontAwesome5 name="user-md" size={20} color="#00695C" />
                    </View>
                    <View style={{ marginLeft: 15, flex: 1 }}>
                        <Text style={styles.doctorName}>Dr. {item.doctor_name || 'Doctor'}</Text>
                        <Text style={styles.reason}>Digital Consultation</Text>
                    </View>
                </View>

                {/* Only show join button if it's confirmed/scheduled and not in the past (allow today) */}
                {(statusText === 'Confirmed' && (isUpcoming || isToday)) && (
                    <TouchableOpacity
                        style={styles.joinBtn}
                        onPress={() => handleJoinCall(item.jitsi_link)}
                    >
                        <FontAwesome5 name="video" size={16} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.joinBtnText}>Join Video Call</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <FontAwesome5 name="arrow-left" size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Appointments</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#00695C" />
                </View>
            ) : appointments.length === 0 ? (
                <View style={styles.center}>
                    <View style={styles.emptyCircle}>
                        <FontAwesome5 name="calendar-times" size={40} color="#00695C" />
                    </View>
                    <Text style={styles.emptyText}>No appointments booked yet.</Text>
                    <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Consult')}>
                        <Text style={styles.emptyBtnText}>Find a Doctor</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={appointments}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00695C']} />}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 30,
        backgroundColor: '#00695C',
    },
    backBtn: {
        padding: 5,
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E0F2F1',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#37474F',
        fontWeight: 'bold',
        marginBottom: 20,
    },
    emptyBtn: {
        backgroundColor: '#00695C',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    emptyBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    listContainer: {
        padding: 15,
        paddingBottom: 50,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    date: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    time: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 15,
    },
    doctorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    doctorIcon: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#E0F2F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    doctorName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    reason: {
        fontSize: 13,
        color: '#78909C',
    },
    joinBtn: {
        backgroundColor: '#00695C',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 20,
    },
    joinBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    }
});
