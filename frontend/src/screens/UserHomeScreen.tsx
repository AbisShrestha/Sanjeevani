import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Alert,
  Image,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

const UserHomeScreen = ({ navigation }: { navigation: any }) => {
  // const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState('User');
  const { cartCount } = useCart();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const data = await AsyncStorage.getItem('user');
      if (data) {
        const u = JSON.parse(data);
        setUserName(u.fullName ? u.fullName.split(' ')[0] : 'User');
      } else {
        setUserName('Guest');
      }
    } catch {
      setUserName('Guest');
    }
  };

  const handleAuthAction = async () => {
    if (userName === 'Guest') {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } else {
      await AsyncStorage.multiRemove(['user', 'token', 'cart']);
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  };

  const handleNavigation = (route: string) => {
    if (userName === 'Guest') {
      const allowed = ['Store']; // Guests can only see Store
      if (!allowed.includes(route)) {
        Alert.alert(
          'Login Required',
          'Join the Sanjeevani family to access this feature.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Login', onPress: () => navigation.navigate('Login') },
          ]
        );
        return;
      }
    }
    navigation.navigate(route);
  };

  const QuickAction = ({ icon, label, route, color }: any) => (
    <TouchableOpacity
      className="bg-white p-4 rounded-[20px] items-center mb-4 shadow-sm w-[47%]"
      onPress={() => handleNavigation(route)}
      activeOpacity={0.8}
    >
      <View
        className="w-[50px] h-[50px] rounded-full justify-center items-center mb-2.5"
        style={{ backgroundColor: `${color}20` }}
      >
        <FontAwesome5 name={icon} size={24} color={color} />
      </View>
      <Text className="text-sm font-semibold text-[#37474F]">{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#F5F7FA]">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/* HEADER SECTION */}
      <View
        className="bg-[#00695C] pb-6 px-6 rounded-b-[30px] shadow-md z-10"
        style={{ paddingTop: insets.top + (Platform.OS === 'android' ? 20 : 10) }}
      >
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-[26px] font-extrabold text-white tracking-wide">Namaste, {userName}</Text>
            <Text className="text-[15px] text-[#E0F2F1] mt-1.5 opacity-90">Let's prioritize your health today.</Text>
          </View>
          <TouchableOpacity
            className="bg-white p-3 rounded-2xl shadow-sm items-center justify-center"
            onPress={handleAuthAction}
            activeOpacity={0.8}
          >
            <FontAwesome5
              name={userName === 'Guest' ? "sign-in-alt" : "user-circle"}
              size={22}
              color="#00695C"
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >

        {/* HERO SECTION - Daily Tip */}
        <View className="bg-[#E0F2F1] rounded-[20px] p-5 flex-row justify-between items-center mb-6 border border-[#B2DFDB] overflow-hidden relative">
          <View className="flex-1 mr-2.5 z-10">
            <Text className="text-sm font-bold text-[#00695C] mb-1.5 uppercase tracking-wider">Daily Ayurvedic Tip</Text>
            <Text className="text-base text-[#004D40] italic leading-6">
              "Drink warm water with lemon and honey in the morning to detoxify your body."
            </Text>
          </View>
          <FontAwesome5 name="leaf" size={60} color="#00695C" style={{ opacity: 0.1, position: 'absolute', right: -10, bottom: -10 }} />
        </View>

        {/* QUICK ACTIONS GRID */}
        <Text className="text-lg font-bold text-[#263238] mb-4 ml-1">Quick Services</Text>
        <View className="flex-row flex-wrap justify-between mb-6">
          <QuickAction icon="pills" label="Medicines" route="Store" color="#E65100" />
          <QuickAction icon="user-md" label="Doctors" route="Consult" color="#1E88E5" />
          <QuickAction icon="robot" label="Health AI" route="AI Chat" color="#D81B60" />
          <QuickAction icon="users" label="Community" route="Insights" color="#43A047" />
        </View>

        {/* UPCOMING APPOINTMENTS (Empty State) */}
        <Text className="text-lg font-bold text-[#263238] mb-4 ml-1">Your Schedule</Text>
        <View className="bg-white rounded-[20px] p-8 items-center border border-[#ECEFF1] border-dashed">
          <View className="bg-[#ECEFF1] p-4 rounded-full mb-4">
            <FontAwesome5 name="calendar-check" size={32} color="#B0BEC5" />
          </View>
          <Text className="text-base text-[#90A4AE] mb-5 font-medium">Manage your video consultations.</Text>
          <View className="flex-row w-full justify-between">
            <TouchableOpacity
              className="bg-[#E0F2F1] py-3.5 px-4 rounded-xl shadow-sm flex-1 mr-2 items-center"
              onPress={() => handleNavigation('UserAppointments')}
              activeOpacity={0.8}
            >
              <Text className="text-[#00695C] font-semibold text-sm">My Appointments</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-[#00695C] py-3.5 px-4 rounded-xl shadow-sm flex-1 ml-2 items-center"
              onPress={() => handleNavigation('Consult')}
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-sm">Book New</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

export default UserHomeScreen;
