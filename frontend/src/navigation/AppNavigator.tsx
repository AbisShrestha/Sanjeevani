import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DoctorHomeScreen from '../screens/DoctorHomeScreen';
import AdminHomeScreen from '../screens/AdminHomeScreen';
import AdminMedicinesScreen from '../screens/AdminMedicinesScreen';
import AdminAddMedicineScreen from '../screens/AdminAddMedicineScreen';
import AdminEditMedicineScreen from '../screens/AdminEditMedicineScreen';
import AdminStockAlertsScreen from '../screens/AdminStockAlertsScreen';
import AdminDoctorListScreen from '../screens/AdminDoctorListScreen';
import AdminAddDoctorScreen from '../screens/AdminAddDoctorScreen';
import AdminEditDoctorScreen from '../screens/AdminEditDoctorScreen';
import AdminUserListScreen from '../screens/AdminUserListScreen';
import AdminManageOrdersScreen from '../screens/AdminManageOrdersScreen';
import AdminManageInsightsScreen from '../screens/AdminManageInsightsScreen';
import MedicineDetailsScreen from '../screens/MedicineDetailsScreen';
import DoctorDetailsScreen from '../screens/DoctorDetailsScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoadingScreen from '../screens/LoadingScreen';
import UserTabNavigator from './UserTabNavigator';
import BookAppointmentScreen from '../screens/BookAppointmentScreen';
import UserAppointmentsScreen from '../screens/UserAppointmentsScreen';
import MyMedicinesScreen from '../screens/MyMedicinesScreen';
import AddMedicineTrackerScreen from '../screens/AddMedicineTrackerScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import MyOrdersScreen from '../screens/MyOrdersScreen';
import MyMedicalReportsScreen from '../screens/MyMedicalReportsScreen';

// Doctor Screens
import DoctorInsightsScreen from '../screens/doctor/DoctorInsightsScreen';
import DoctorAppointmentsScreen from '../screens/doctor/DoctorAppointmentsScreen';
import DoctorPatientsListScreen from '../screens/doctor/DoctorPatientsListScreen';
import PatientRecordsScreen from '../screens/doctor/PatientRecordsScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {

  return (
    <Stack.Navigator initialRouteName="Loading" id="RootStack">
      <Stack.Screen name="Loading" component={LoadingScreen} options={{ headerShown: false }} />
      {/* Auth */}
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />

      {/* Main */}
      <Stack.Screen name="User" component={UserTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Doctor" component={DoctorHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Admin" component={AdminHomeScreen} options={{ headerShown: false }} />

      {/* Admin → Medicines */}
      <Stack.Screen
        name="AdminMedicines"
        component={AdminMedicinesScreen}
        options={{ title: 'Manage Medicines' }}
      />
      
      <Stack.Screen
        name="AdminStockAlerts"
        component={AdminStockAlertsScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="AdminAddMedicine"
        component={AdminAddMedicineScreen}
        options={{ title: 'Add Medicine' }}
      />

      <Stack.Screen
        name="AdminEditMedicine"
        component={AdminEditMedicineScreen}
        options={{ title: 'Edit Medicine' }}
      />

      {/* Admin → Doctors */}
      <Stack.Screen
        name="AdminDoctors"
        component={AdminDoctorListScreen}
        options={{ title: 'Manage Doctors' }}
      />
      <Stack.Screen
        name="AdminAddDoctor"
        component={AdminAddDoctorScreen}
        options={{ title: 'Add Doctor' }}
      />
      <Stack.Screen
        name="AdminEditDoctor"
        component={AdminEditDoctorScreen}
        options={{ title: 'Edit Doctor' }}
      />

      {/* Admin → Users & Orders */}
      <Stack.Screen
        name="AdminUsers"
        component={AdminUserListScreen}
        options={{ title: 'User Management' }}
      />
      <Stack.Screen
        name="AdminManageOrders"
        component={AdminManageOrdersScreen}
        options={{ title: 'Manage Orders' }}
      />
      <Stack.Screen
        name="AdminManageInsights"
        component={AdminManageInsightsScreen}
        options={{ title: 'Manage Insights' }}
      />

      {/* User Features */}
      <Stack.Screen
        name="MedicineDetails"
        component={MedicineDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DoctorDetails"
        component={DoctorDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: 'My Cart' }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BookAppointment"
        component={BookAppointmentScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UserAppointments"
        component={UserAppointmentsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MyMedicines"
        component={MyMedicinesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddMedicineTracker"
        component={AddMedicineTrackerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MyOrders"
        component={MyOrdersScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MyMedicalReports"
        component={MyMedicalReportsScreen}
        options={{ headerShown: false }}
      />

      {/* Doctor Features */}
      <Stack.Screen
        name="DoctorInsights"
        component={DoctorInsightsScreen}
        options={{ title: 'My Insights' }}
      />
      <Stack.Screen
        name="DoctorAppointments"
        component={DoctorAppointmentsScreen}
        options={{ title: 'Appointments' }}
      />
      <Stack.Screen
        name="DoctorPatientsList"
        component={DoctorPatientsListScreen}
        options={{ title: 'Select Patient' }}
      />
      <Stack.Screen
        name="PatientRecords"
        component={PatientRecordsScreen}
        options={{ title: 'Medical Records' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
