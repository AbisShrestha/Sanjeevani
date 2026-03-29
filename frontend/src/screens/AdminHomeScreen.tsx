import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
  BackHandler,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

import { getAdminDashboardStats } from '../services/adminService';

/*
   TYPES
*/

interface DashboardStats {
  totalUsers: number;
  totalDoctors: number;
  totalMedicines: number;
  lowStock: number;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  bgColor: string;
}

interface AdminActionProps {
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  onPress: () => void;
}

/* ============================
   SCREEN
============================ */

const AdminDashboardScreen = ({ navigation }: { navigation: any }) => {
  // Using props instead of useNavigation hook

  const [adminName, setAdminName] = useState<string>('Admin');
  const [showMenu, setShowMenu] = useState(false);

  // States for loading screen and "pull-to-refresh" spinner
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Stats to show on the cards (Users, Doctors, etc.)
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalDoctors: 0,
    totalMedicines: 0,
    lowStock: 0,
  });

  /* 
     When the screen opens, check for data
   */
  useEffect(() => {
    loadData();

    // Prevent going back to Login screen when pressing Android back button
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true
    );

    return () => backHandler.remove();
  }, []);

  /* 
     Master function to load everything
   */
  const loadData = async () => {
    await Promise.all([loadAdminData(), loadDashboardStats()]);
    setLoading(false); // Stop the big loading spinner
  };

  /* 
     Get the user's name from local storage
   */
  const loadAdminData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setAdminName(user.fullName || 'Admin');
      }
    } catch {
      setAdminName('Admin');
    }
  };

  /* 
     Fetch the numbers for the cards from the database
   */
  const loadDashboardStats = async () => {
    try {
      const data = await getAdminDashboardStats();
      setStats(data);
    } catch {
      // If it fails, we keep showing 0 for now
    }
  };

  /* 
     Called when you pull down the screen to refresh
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true); // Show the small spinner at the top
    await loadDashboardStats();
    await loadAdminData();
    setRefreshing(false); // Hide the spinner
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text className="mt-3 text-[#666] text-base">Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F5F7FA]">
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />

      {/* HEADER */}
      <View className={`px-6 pb-5 flex-row justify-between items-center bg-[#F5F7FA] ${Platform.OS === 'ios' ? 'pt-[60px]' : 'pt-[30px]'}`}>
        <View>
          <Text className="text-base text-[#78909C] font-medium">Welcome Back,</Text>
          <Text className="text-[26px] text-[#37474F] font-extrabold mt-1">{adminName}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowMenu(true)}
          className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm z-10"
        >
          <FontAwesome5 name="user-shield" size={20} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2E7D32']}
            tintColor="#2E7D32"
          />
        }
      >
        {/* STATS OVERVIEW */}
        <Text className="text-lg font-bold text-[#37474F] mb-4 mt-2.5">Overview</Text>
        <View className="flex-row flex-wrap justify-between mb-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon="users"
            color="#FFFFFF"
            bgColor="#43A047"
          />
          <StatCard
            title="Doctors"
            value={stats.totalDoctors}
            icon="user-md"
            color="#FFFFFF"
            bgColor="#1E88E5"
          />
          <StatCard
            title="Medicines"
            value={stats.totalMedicines}
            icon="capsules"
            color="#FFFFFF"
            bgColor="#8E24AA"
          />
          <StatCard
            title="Low Stock"
            value={stats.lowStock}
            icon="exclamation-circle"
            color="#FFFFFF"
            bgColor="#FB8C00"
          />
        </View>

        {/* QUICK ACTIONS */}
        <Text className="text-lg font-bold text-[#37474F] mb-4 mt-2.5">Management</Text>

        <View>
          <AdminAction
            title="Manage Medicines"
            subtitle="Inventory, stock & pricing"
            icon="pills"
            iconColor="#43A047"
            onPress={() => navigation.navigate('AdminMedicines')}
          />

          <AdminAction
            title="Manage Doctors"
            subtitle="Add or remove specialists"
            icon="user-md"
            iconColor="#1E88E5"
            onPress={() => navigation.navigate('AdminDoctors')}
          />

          <AdminAction
            title="Stock Alerts"
            subtitle="View low stock items"
            icon="boxes"
            iconColor="#FB8C00"
            onPress={() => navigation.navigate('AdminStockAlerts')}
          />

          <AdminAction
            title="Order Approvals"
            subtitle="Manage & verify user orders"
            icon="clipboard-check"
            iconColor="#00BCD4"
            onPress={() => navigation.navigate('AdminManageOrders')}
          />

          <AdminAction
            title="User Database"
            subtitle="View & manage registered users"
            icon="users-cog"
            iconColor="#8E24AA"
            onPress={() => navigation.navigate('AdminUsers')}
          />
          <AdminAction
            title="Manage Insights"
            subtitle="Edit & delete community articles"
            icon="newspaper"
            iconColor="#E65100"
            onPress={() => navigation.navigate('AdminManageInsights')}
          />
        </View>

        <View className="h-10" />
      </ScrollView>

      {/* Admin Menu Overlay */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable
          className="flex-1"
          onPress={() => setShowMenu(false)}
        >
          <View className={`absolute right-6 bg-white rounded-2xl shadow-lg border border-[#eee] w-[200px] overflow-hidden ${Platform.OS === 'ios' ? 'top-[110px]' : 'top-[70px]'}`}>
            <View className="px-4 py-3 border-b border-[#f0f0f0]">
              <Text className="text-sm font-bold text-[#333]">{adminName}</Text>
              <Text className="text-xs text-[#999] mt-0.5">Administrator</Text>
            </View>
            <TouchableOpacity
              className="flex-row items-center px-4 py-3"
              onPress={() => {
                setShowMenu(false);
                handleLogout();
              }}
            >
              <FontAwesome5 name="sign-out-alt" size={16} color="#D32F2F" />
              <Text className="ml-3 text-[#D32F2F] font-semibold text-[15px]">Log Out</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default AdminDashboardScreen;

/* 
   COMPONENTS
 */

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, bgColor }) => (
  // Note: We can't interpolate bgColor into className directly for arbitrary colors, so we use style for dynamic background
  <View
    className="w-[48%] rounded-3xl p-4 mb-4 shadow-sm overflow-hidden h-[120px] justify-center"
    style={{ backgroundColor: bgColor, elevation: 4 }}
  >
    <View className="relative z-10">
      <View className="mb-3">
        <FontAwesome5 name={icon} size={20} color={color} />
      </View>
      <View>
        <Text className="text-[28px] font-extrabold text-white leading-8">{value}</Text>
        <Text className="text-[13px] font-semibold text-white/90 mt-1">{title}</Text>
      </View>
    </View>
    {/* Decorative Circle */}
    <View className="absolute -top-5 -right-5 w-[100px] h-[100px] rounded-full bg-white/15 z-0" />
  </View>
);

const AdminAction: React.FC<AdminActionProps> = ({
  title,
  subtitle,
  icon,
  iconColor,
  onPress,
}) => (
  <TouchableOpacity
    className="flex-row items-center bg-white rounded-2xl p-4 mb-3 shadow-sm"
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View
      className="w-12 h-12 rounded-xl justify-center items-center mr-4"
      style={{ backgroundColor: `${iconColor}15` }}
    >
      <FontAwesome5 name={icon} size={22} color={iconColor} />
    </View>
    <View className="flex-1">
      <Text className="text-base font-bold text-[#37474F]">{title}</Text>
      <Text className="text-[13px] text-[#90A4AE] mt-0.5">{subtitle}</Text>
    </View>
    <FontAwesome5 name="chevron-right" size={14} color="#CFD8DC" />
  </TouchableOpacity>
);
