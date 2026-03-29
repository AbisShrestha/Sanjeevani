import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Alert,
  Image,
  Platform,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { getAllMedicines } from '../services/medicineService';
import api, { SERVER_URL } from '../services/api';

const { width } = Dimensions.get('window');

const UserHomeScreen = ({ navigation }: { navigation: any }) => {
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState('User');
  const { cartCount, addToCart } = useCart();
  
  const [featuredMedicines, setFeaturedMedicines] = useState<any[]>([]);
  const [topDoctors, setTopDoctors] = useState<any[]>([]);
  const [loadingTop, setLoadingTop] = useState(true);

  useEffect(() => {
    loadUser();
    fetchHomeData();
  }, []);

  // Refresh data when navigating back to home
  useFocusEffect(
    useCallback(() => {
      fetchHomeData();
    }, [])
  );

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

  const fetchHomeData = async () => {
    try {
      // Fetch latest medicines (limit to 4 on frontend)
      const meds = await getAllMedicines({ sort: 'none' });
      setFeaturedMedicines(meds.slice(0, 4));

      // Fetch docs
      const docsObj = await api.get('/doctors');
      const docsArray = Array.isArray(docsObj.data) ? docsObj.data : [];
      setTopDoctors(docsArray.slice(0, 3));
    } catch (error) {
      console.warn('Failed to load home data:', error);
    } finally {
      setLoadingTop(false);
    }
  };

  const handleAuthAction = async () => {
    if (userName === 'Guest') {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } else {
      navigation.navigate('UserProfile');
    }
  };

  const handleNavigation = (route: string) => {
    if (userName === 'Guest') {
      const allowed = ['Store']; // Guests mostly see Store
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
      className="bg-white p-3 rounded-2xl items-center mb-0 shadow-sm flex-1 mx-1 border border-[#F1F1F1]"
      onPress={() => handleNavigation(route)}
      activeOpacity={0.8}
    >
      <View
        className="w-[45px] h-[45px] rounded-full justify-center items-center mb-1.5"
        style={{ backgroundColor: `${color}15` }}
      >
        <FontAwesome5 name={icon} size={20} color={color} />
      </View>
      <Text className="text-[11px] font-bold text-[#455A64] text-center">{label}</Text>
    </TouchableOpacity>
  );

  const buildImageUrl = (url: string | null) => {
    if (!url) return 'https://via.placeholder.com/150';
    if (url.startsWith('http')) return url;
    let path = url.replace(/\\/g, '/');
    if (path.startsWith('/')) path = path.substring(1);
    return `${SERVER_URL}/${path}`;
  };

  return (
    <View className="flex-1 bg-[#F5F8FA]">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/* HEADER SECTION (Beautiful Curve) */}
      <View
        className="bg-[#00695C] pb-7 px-5 rounded-b-[35px] shadow-lg z-10"
        style={{ paddingTop: insets.top + (Platform.OS === 'android' ? 15 : 5) }}
      >
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-[26px] font-extrabold text-white tracking-wide">Namaste, {userName}</Text>
            <Text className="text-[14px] text-[#E0F2F1] mt-1 opacity-90">Let's prioritize your health today.</Text>
          </View>
          <TouchableOpacity
            className="bg-[#004D40] w-[45px] h-[45px] rounded-full items-center justify-center border border-[#00796b]"
            onPress={handleAuthAction}
            activeOpacity={0.8}
          >
            <FontAwesome5
              name={userName === 'Guest' ? "sign-in-alt" : "user-alt"}
              size={18}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* QUICK ACTIONS ROW (Horizontal) */}
        <View className="px-4 mt-5">
           <View className="flex-row justify-between">
              <QuickAction icon="pills" label="Pharmacy" route="Store" color="#E65100" />
              <QuickAction icon="user-md" label="Consult" route="Consult" color="#1E88E5" />
              <QuickAction icon="robot" label="AI Health" route="AI Chat" color="#D81B60" />
              <QuickAction icon="capsules" label="My Meds" route="MyMedicines" color="#43A047" />
           </View>
        </View>

        {/* HERO BANNER */}
        <View className="bg-[#E8F5E9] rounded-2xl p-4 mx-4 mt-6 flex-row justify-between items-center border border-[#C8E6C9] relative overflow-hidden shadow-sm">
          <View className="flex-1 mr-2 z-10">
            <Text className="text-xs font-bold text-[#2E7D32] mb-1 tracking-widest uppercase">Health Tip</Text>
            <Text className="text-[13px] text-[#1B5E20] font-medium leading-5">
              Hydrate well. Drinking warm water with honey aids digestion and glowing skin.
            </Text>
          </View>
          <FontAwesome5 name="spa" size={50} color="#81C784" style={{ opacity: 0.2, position: 'absolute', right: -5, bottom: -10 }} />
        </View>

        {/* FEATURED MEDICINES SECTION */}
        <View className="mt-7">
          <View className="flex-row justify-between items-end px-5 mb-3">
            <Text className="text-[19px] font-extrabold text-[#263238]">Quick Pharmacy</Text>
            <TouchableOpacity onPress={() => handleNavigation('Store')}>
              <Text className="text-sm font-bold text-[#00695C]">View All</Text>
            </TouchableOpacity>
          </View>

          {loadingTop ? (
            <ActivityIndicator size="small" color="#00695C" style={{ marginVertical: 30 }} />
          ) : featuredMedicines.length === 0 ? (
            <Text className="text-center text-[#999] my-5">No medicines available.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16 }}>
              {featuredMedicines.map((med, idx) => (
                <TouchableOpacity 
                  key={`med-${med.medicineid || idx}`}
                  style={styles.medicineCard}
                  onPress={() => navigation.navigate('MedicineDetails', { medicine: med })}
                >
                  <View style={styles.imageContainer}>
                     <Image 
                       source={{ uri: buildImageUrl(med.imageurl) }} 
                       style={styles.medicineImage} 
                       resizeMode="contain" 
                     />
                  </View>
                  <View className="px-3 pb-3 pt-2">
                    <Text className="text-sm font-bold text-[#333] mb-0.5" numberOfLines={1}>{med.name}</Text>
                    <Text className="text-[10px] font-semibold text-[#00695C] mb-2">Ayurvedic</Text>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm font-extrabold text-[#2E7D32]">Rs. {med.price}</Text>
                      <TouchableOpacity 
                        className="bg-[#00695C] p-1.5 rounded-full"
                        onPress={() => addToCart(med)}
                      >
                         <FontAwesome5 name="plus" size={10} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              <View style={{ width: 16 }} />
            </ScrollView>
          )}
        </View>

        {/* TOP DOCTORS SECTION */}
        <View className="mt-6 mb-4">
          <View className="flex-row justify-between items-end px-5 mb-3">
            <Text className="text-[19px] font-extrabold text-[#263238]">Top Doctors</Text>
            <TouchableOpacity onPress={() => handleNavigation('Consult')}>
              <Text className="text-sm font-bold text-[#00695C]">Book Now</Text>
            </TouchableOpacity>
          </View>

          {loadingTop ? (
            <ActivityIndicator size="small" color="#00695C" style={{ marginVertical: 30 }} />
          ) : topDoctors.length === 0 ? (
            <Text className="text-center text-[#999] my-5">No doctors available yet.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16 }}>
              {topDoctors.map((doc, idx) => (
                <TouchableOpacity 
                  key={`doc-${doc.id || idx}`}
                  style={styles.doctorCard}
                  onPress={() => navigation.navigate('DoctorDetails', { doctor: doc })}
                >
                  <Image 
                    source={{ uri: buildImageUrl(doc.image) }} 
                    style={styles.doctorImage} 
                    resizeMode="cover" 
                  />
                  <View className="p-3 items-center">
                    <Text className="text-[13px] font-extrabold text-[#333] mb-0.5" numberOfLines={1}>{doc.name}</Text>
                    <Text className="text-[11px] text-[#666] mb-2">{doc.specialization}</Text>
                    <View className="bg-[#E0F2F1] px-3 py-1.5 rounded-full w-full items-center">
                       <Text className="text-[#00695C] text-[10px] font-bold">FEES: Rs. {doc.consultationfee}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              <View style={{ width: 16 }} />
            </ScrollView>
          )}
        </View>

      </ScrollView>
    </View>
  );
};

export default UserHomeScreen;

const styles = StyleSheet.create({
  medicineCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
    height: 220,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    padding: 10,
  },
  medicineImage: {
    width: '100%',
    height: '100%',
  },
  doctorCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
    paddingTop: 12,
    alignItems: 'center',
    height: 190,
  },
  doctorImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#E0F2F1',
    backgroundColor: '#f5f5f5'
  }
});
