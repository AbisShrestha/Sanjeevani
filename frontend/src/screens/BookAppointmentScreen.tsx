import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image, Platform, ScrollView, Modal } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { bookAppointment, checkAppointmentAvailability } from '../services/doctorService';
import { buildImageUri } from '../utils/image';
import { initiateEsewaPayment, generateEsewaFormHTML, verifyEsewaPayment } from '../services/esewaService';
import { WebView } from 'react-native-webview';

const BookAppointmentScreen = ({ navigation, route }: { navigation: any; route: any }) => {
    const { doctor } = route.params;

    const [selectedDate, setSelectedDate] = useState(dayjs().add(1, 'day'));
    const [selectedTime, setSelectedTime] = useState('10:00 AM');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1); // 1 = Pick Time, 2 = Payment
    const [esewaHtmlConfig, setEsewaHtmlConfig] = useState<string | null>(null);

    const timeSlots = ['10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '04:00 PM', '05:00 PM'];

    // Generate next 7 days for the date picker
    const next7Days = Array.from({ length: 7 }).map((_, i) => dayjs().add(i + 1, 'day'));

    const handleContinueToPayment = () => {
        setStep(2);
    };

    const handleConfirmPayment = async () => {
        try {
            setIsSubmitting(true);

            // 1. Double check availability before taking payment
            const dateStr = selectedDate.format('YYYY-MM-DD');
            const [timePart, modifier] = selectedTime.split(' ');
            const [hoursStr, minutesStr] = timePart.split(':');
            
            let hours = parseInt(hoursStr, 10);
            const minutes = parseInt(minutesStr, 10);
            
            if (modifier === 'PM' && hours !== 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
            
            const appointmentDateISO = dayjs(dateStr).hour(hours).minute(minutes).second(0).toISOString();

            try {
                await checkAppointmentAvailability(doctor.id, appointmentDateISO);
            } catch (checkError: any) {
                if (checkError.response?.status === 409) {
                    Alert.alert('Slot Unavailable', 'This time slot was just booked by someone else. Please select another time.');
                    setStep(1);
                    return;
                }
                throw checkError; // if 500 or network error, let main catch block handle it
            }

            // 2. Initiate eSewa Payment
            const purchaseId = `APT-${doctor.id}-${Date.now()}`;
            const fee = doctor.fee ? Number(doctor.fee) : 500;
            
            const esewaResponse = await initiateEsewaPayment(
                 fee,
                 purchaseId,
                 `Consultation with Dr. ${doctor.name}`
            );
                 
            // 3. Open eSewa Payment Gateway in WebView Modal
            if (esewaResponse && esewaResponse.paymentUrl) {
                 const formHTML = generateEsewaFormHTML(esewaResponse.paymentUrl, esewaResponse.paymentData);
                 setEsewaHtmlConfig(formHTML);
            }

        } catch (error) {
            console.error('eSewa Payment initiation failed or availability check failed:', error);
            Alert.alert('Error', 'Failed to initialize booking. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNavigationStateChange = async (navState: any) => {
        const { url } = navState;

        if (url.includes('sanjeevani-health.com/payment/success')) {
            setEsewaHtmlConfig(null);
            setIsSubmitting(true);
            
            try {
                const urlObj = new URL(url);
                const encodedData = urlObj.searchParams.get('data');
                
                if (encodedData) {
                    await verifyEsewaPayment(encodedData);
                    
                    // Parse Date safely
                    const dateStr = selectedDate.format('YYYY-MM-DD');
                    const [timePart, modifier] = selectedTime.split(' ');
                    const [hoursStr, minutesStr] = timePart.split(':');
                    
                    let hours = parseInt(hoursStr, 10);
                    const minutes = parseInt(minutesStr, 10);
                    
                    if (modifier === 'PM' && hours !== 12) hours += 12;
                    if (modifier === 'AM' && hours === 12) hours = 0;
                    
                    const appointmentDate = dayjs(dateStr).hour(hours).minute(minutes).second(0).toISOString();

                    await bookAppointment(doctor.id, appointmentDate, 'General Consultation');

                    Alert.alert(
                        'Booking Confirmed! 🎉',
                        'Your appointment has been booked. You can find the video call link in your Appointments tab.',
                        [
                            { text: 'View Appointments', onPress: () => navigation.navigate('UserAppointments') },
                            { text: 'Go Home', onPress: () => navigation.navigate('Home') }
                        ]
                    );

                } else {
                    throw new Error("Missing verification data");
                }
            } catch (error) {
                console.error('Booking failed:', error);
                Alert.alert('Payment Failed', 'We could not verify your payment or book the appointment.');
            } finally {
                setIsSubmitting(false);
            }
        } else if (url.includes('sanjeevani-health.com/payment/failure') || url.includes('/cancel')) {
            setEsewaHtmlConfig(null);
            Alert.alert('Payment Cancelled', 'Your eSewa payment was not completed.');
        }
    };

    const displayImage = buildImageUri(doctor?.image, 'https://via.placeholder.com/150');

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => step === 2 ? setStep(1) : navigation.goBack()} style={styles.backBtn}>
                    <FontAwesome5 name="arrow-left" size={20} color="#37474F" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{step === 1 ? 'Select Time' : 'Payment Details'}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* DOCTOR INFO CARD */}
                <View style={styles.doctorCard}>
                    <Image source={{ uri: displayImage! }} style={styles.doctorImg} />
                    <View style={styles.doctorInfo}>
                        <Text style={styles.doctorName}>{doctor.name}</Text>
                        <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                        <View style={styles.feeBadge}>
                            <Text style={styles.feeText}>Rs. {doctor.fee || '500'} / session</Text>
                        </View>
                    </View>
                </View>

                {step === 1 ? (
                    // STEP 1: DATE & TIME SELECTION
                    <View>
                        <Text style={styles.sectionTitle}>Select Date</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
                            {next7Days.map((d, index) => {
                                const isSelected = selectedDate.isSame(d, 'day');
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.dateCard, isSelected && styles.dateCardActive]}
                                        onPress={() => setSelectedDate(d)}
                                    >
                                        <Text style={[styles.dateMonth, isSelected && styles.textWhite]}>{d.format('MMM')}</Text>
                                        <Text style={[styles.dateDay, isSelected && styles.textWhite]}>{d.format('DD')}</Text>
                                        <Text style={[styles.dateWeek, isSelected && styles.textWhite]}>{d.format('ddd')}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Select Time</Text>
                        <View style={styles.timeGrid}>
                            {timeSlots.map((time, index) => {
                                const isSelected = selectedTime === time;
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.timeCard, isSelected && styles.timeCardActive]}
                                        onPress={() => setSelectedTime(time)}
                                    >
                                        <Text style={[styles.timeText, isSelected && styles.textWhite]}>{time}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                ) : (
                    // STEP 2: MOCK PAYMENT
                    <View style={styles.paymentSection}>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>Appointment Summary</Text>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Date</Text>
                                <Text style={styles.summaryValue}>{selectedDate.format('DD MMM YYYY')}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Time</Text>
                                <Text style={styles.summaryValue}>{selectedTime}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Consultation Fee</Text>
                                <Text style={styles.summaryValue}>Rs. {doctor.fee || '500'}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.summaryRow}>
                                <Text style={[styles.summaryLabel, { fontWeight: 'bold', color: '#333' }]}>Total Payable</Text>
                                <Text style={[styles.summaryValue, { fontWeight: 'bold', fontSize: 18, color: '#00695C' }]}>Rs. {doctor.fee || '500'}</Text>
                            </View>
                        </View>

                        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Payment Method</Text>
                        <View style={[styles.paymentMethod, styles.paymentMethodActive]}>
                            <FontAwesome5 name="wallet" size={24} color="#60BB46" />
                            <Text style={styles.paymentMethodText}>Pay via eSewa</Text>
                            <FontAwesome5 name="check-circle" size={20} color="#00695C" style={{ marginLeft: 'auto' }} />
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* FOOTER ACTION */}
            <View style={styles.footer}>
                {step === 1 ? (
                    <TouchableOpacity style={styles.primaryBtn} onPress={handleContinueToPayment}>
                        <Text style={styles.primaryBtnText}>Continue to Payment</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirmPayment} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.primaryBtnText}>Pay Rs. {doctor.fee || '500'} & Book</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Embedded eSewa WebView Modal */}
            <Modal visible={!!esewaHtmlConfig} animationType="slide" onRequestClose={() => setEsewaHtmlConfig(null)}>
                <View style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 40 : 0 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                        <TouchableOpacity onPress={() => setEsewaHtmlConfig(null)} style={{ padding: 8, marginLeft: -8, marginRight: 8 }}>
                            <FontAwesome5 name="times" size={20} color="#333" />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Secure eSewa Payment</Text>
                    </View>
                    {esewaHtmlConfig && (
                        <WebView
                            source={{ html: esewaHtmlConfig }}
                            onNavigationStateChange={handleNavigationStateChange}
                            style={{ flex: 1 }}
                            startInLoadingState={true}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            originWhitelist={['*']}
                            renderLoading={() => (
                                <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', zIndex: 10 }}>
                                    <ActivityIndicator size="large" color="#60BB46" />
                                </View>
                            )}
                        />
                    )}
                </View>
            </Modal>
        </View>
    );
};

export default BookAppointmentScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backBtn: {
        padding: 5,
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#37474F',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    doctorCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 15,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    doctorImg: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#E0F2F1',
    },
    doctorInfo: {
        marginLeft: 15,
        justifyContent: 'center',
        flex: 1,
    },
    doctorName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    doctorSpecialty: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    feeBadge: {
        backgroundColor: '#FFF8E1',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    feeText: {
        color: '#F57F17',
        fontSize: 12,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#37474F',
        marginBottom: 15,
    },
    dateScroll: {
        flexDirection: 'row',
    },
    dateCard: {
        width: 65,
        height: 80,
        backgroundColor: '#fff',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    dateCardActive: {
        backgroundColor: '#00695C',
        borderColor: '#00695C',
    },
    dateMonth: {
        fontSize: 12,
        color: '#90A4AE',
        textTransform: 'uppercase',
    },
    dateDay: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginVertical: 2,
    },
    dateWeek: {
        fontSize: 12,
        color: '#90A4AE',
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    timeCard: {
        width: '30%',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    timeCardActive: {
        backgroundColor: '#00695C',
        borderColor: '#00695C',
    },
    timeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
    },
    textWhite: {
        color: '#fff',
    },
    primaryBtn: {
        backgroundColor: '#00695C',
        borderRadius: 30,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#00695C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    primaryBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        elevation: 10,
    },
    paymentSection: {
        flex: 1,
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 10,
    },
    paymentMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    paymentMethodActive: {
        borderColor: '#00695C',
        backgroundColor: '#E0F2F1',
    },
    paymentMethodText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginLeft: 15,
    }
});
