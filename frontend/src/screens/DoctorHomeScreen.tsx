import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';

const DoctorHomeScreen = ({ navigation }: { navigation: any }) => {

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Doctor Dashboard</Text>
          <Text style={styles.headerSubtitle}>Manage your practice and patients</Text>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('DoctorAppointments')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#e3f2fd' }]}>
              <FontAwesome5 name="calendar-check" size={28} color="#1e88e5" />
            </View>
            <Text style={styles.cardTitle}>Appointments</Text>
            <Text style={styles.cardDesc}>View your schedule and start video calls</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('DoctorInsights')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#f3e5f5' }]}>
              <FontAwesome5 name="lightbulb" size={28} color="#8e24aa" />
            </View>
            <Text style={styles.cardTitle}>My Insights</Text>
            <Text style={styles.cardDesc}>Write medical blogs and articles</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('DoctorPatientsList')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#e8f5e9' }]}>
              <FontAwesome5 name="user-md" size={28} color="#43a047" />
            </View>
            <Text style={styles.cardTitle}>Patient Records</Text>
            <Text style={styles.cardDesc}>Add and view patient medical history</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <FontAwesome5 name="sign-out-alt" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DoctorHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
    backgroundColor: '#2E7D32',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#D2E8D4',
  },
  grid: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14,
    color: '#666',
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
    backgroundColor: '#F8FAF9',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#e53935',
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
