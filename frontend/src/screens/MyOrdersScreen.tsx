import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getMyOrders, Order } from '../services/orderService';
import dayjs from 'dayjs';

const MyOrdersScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    // Determine status color
    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'delivered': return 'text-[#60BB46] bg-[#F1F8E9] border-[#C5E1A5]';
        case 'processing': return 'text-[#F57C00] bg-[#FFF3E0] border-[#FFE0B2]';
        case 'shipped': return 'text-[#1E88E5] bg-[#E3F2FD] border-[#BBDEFB]';
        case 'cancelled': return 'text-[#E53935] bg-[#FFEBEE] border-[#FFCDD2]';
        default: return 'text-[#78909C] bg-[#ECEFF1] border-[#CFD8DC]';
      }
    };
    const statusStyle = getStatusColor(item.orderstatus);

    return (
      <View className="bg-white p-5 rounded-2xl shadow-sm mb-4 border border-[#ECEFF1]">
        
        {/* Order Header */}
        <View className="flex-row justify-between items-center mb-3">
          <View>
            <Text className="text-base font-extrabold text-[#263238]">Order #{item.orderid}</Text>
            <Text className="text-xs text-[#78909C] mt-0.5">{dayjs(item.createdat).format('MMM D, YYYY • h:mm A')}</Text>
          </View>
          <View className={`px-2.5 py-1 rounded-lg border ${statusStyle.split(' ')[1]} ${statusStyle.split(' ')[2]}`}>
            <Text className={`text-[10px] font-bold uppercase ${statusStyle.split(' ')[0]}`}>
              {item.orderstatus}
            </Text>
          </View>
        </View>

        <View className="h-[1px] bg-[#ECEFF1] w-full my-3" />

        {/* Order Items Summary */}
        <View className="mb-3">
          {item.items && item.items.map((prod, index) => (
             <View key={index} className="flex-row items-center mb-2">
                <View className="w-2 h-2 rounded-full bg-[#00695C] opacity-50 mr-2" />
                <Text className="text-sm text-[#455A64] flex-1" numberOfLines={1}>
                  {prod.quantity}x {prod.name}
                </Text>
             </View>
          ))}
        </View>

        <View className="h-[1px] bg-[#ECEFF1] w-full my-3" />

        {/* Order Footer (Total Data) */}
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-[11px] font-bold text-[#90A4AE] uppercase tracking-wider mb-0.5">Total Amount</Text>
            <Text className="text-lg font-extrabold text-[#00695C]">₹ {Number(item.totalamount).toFixed(2)}</Text>
          </View>
          <View className="items-end">
             <Text className="text-[11px] font-bold text-[#90A4AE] uppercase tracking-wider mb-0.5">Payment</Text>
             <View className="flex-row items-center">
                <FontAwesome5 name="check-circle" size={10} color="#60BB46" solid />
                <Text className="text-xs font-bold text-[#263238] ml-1">{item.paymentmethod}</Text>
             </View>
          </View>
        </View>

      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      {/* Header */}
      <View 
        className="bg-[#00695C] pb-5 px-5 flex-row items-center rounded-b-[30px] shadow-sm z-10"
        style={{ paddingTop: insets.top + (Platform.OS === 'android' ? 20 : 10) }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2" activeOpacity={0.7}>
          <FontAwesome5 name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white ml-3">My Orders</Text>
      </View>

      {/* List */}
      <View className="flex-1 px-5 pt-5">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#00695C" />
          </View>
        ) : orders.length === 0 ? (
          <View className="flex-1 justify-center items-center px-10">
            <View className="w-24 h-24 bg-[#E0F2F1] rounded-full items-center justify-center mb-6 shadow-sm">
                <FontAwesome5 name="box-open" size={40} color="#00695C" />
            </View>
            <Text className="text-xl font-bold text-[#37474F] mb-2 text-center">No orders yet</Text>
            <Text className="text-[#78909C] text-center leading-5 mb-8">
                Your order history is currently empty. Start exploring our medicines to see your purchases here!
            </Text>
            <TouchableOpacity 
              className="bg-[#00695C] px-8 py-4 rounded-2xl shadow-md active:opacity-90 w-full"
              onPress={() => {
                navigation.navigate('User', { screen: 'Store' });
              }}
            >
              <Text className="text-white font-bold text-center text-base">Shop Medicines</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.orderid.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    </View>
  );
};

export default MyOrdersScreen;
