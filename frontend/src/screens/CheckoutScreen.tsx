import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../context/CartContext';
import { initiateEsewaPayment, generateEsewaFormHTML, verifyEsewaPayment } from '../services/esewaService';
import { placeOrder, cancelOrder } from '../services/orderService';
import { WebView } from 'react-native-webview';

const CheckoutScreen = ({ navigation }: { navigation: any }) => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(false);
  const [esewaHtmlConfig, setEsewaHtmlConfig] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);

  // Contact Info
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  // Auto-fill user details if logged in
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('user');
        if (userDataString) {
          const user = JSON.parse(userDataString);
          setFullName(user.fullname || user.fullName || '');
          setEmail(user.email || '');
          setPhone(user.phone || '');
        }
      } catch (e) {
        console.error('Error loading user data for checkout', e);
      }
    };
    loadUserData();
  }, []);

  // Cancel any pending order and close the payment modal
  const handleClosePaymentModal = async () => {
    setEsewaHtmlConfig(null);
    if (pendingOrderId) {
      try {
        await cancelOrder(pendingOrderId);
      } catch (cancelErr) {
        console.error('Failed to cancel abandoned order', cancelErr);
      }
      setPendingOrderId(null);
    }
    Alert.alert('Payment Cancelled', 'Your payment was not completed. No charges were made.');
  };

  const handlePlaceOrder = async () => {
    // 1. Validate Form
    if (!fullName.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Missing Details', 'Please fill in all shipping and contact details.');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty.');
      return;
    }

    // Prevent duplicate orders if user spams button
    if (loading || pendingOrderId) {
      return;
    }

    try {
      setLoading(true);

      // 2. Pre-create the order as "Pending" to reserve inventory and secure a database record
      let newOrder;
      try {
        newOrder = await placeOrder(
            totalPrice,
            address,
            cartItems.map(item => ({
              medicineid: item.medicineid,
              quantity: item.quantity,
              price: item.price
            })),
            'Pending Payment',
            'Pending Payment'
        );
        setPendingOrderId(newOrder.order.orderid);
      } catch (orderErr: any) {
        const errorMessage = orderErr.response?.data?.error || 'Failed to initialize order. Please try again.';
        Alert.alert('Checkout Failed', errorMessage);
        setLoading(false);
        return;
      }

      // 3. Initiate eSewa Payment
      const purchaseId = `ORD-${newOrder.order.orderid}-${Date.now()}`;
      const esewaResponse = await initiateEsewaPayment(
        Math.round(totalPrice * 100) / 100,
        purchaseId,
        `Sanjeevani Store Order (${cartItems.length} items)`
      );

      if (esewaResponse && esewaResponse.paymentUrl) {
        const formHTML = generateEsewaFormHTML(esewaResponse.paymentUrl, esewaResponse.paymentData);
        setEsewaHtmlConfig(formHTML);
      } else {
        // eSewa initiation failed — cancel the pending order immediately
        try { await cancelOrder(newOrder.order.orderid); } catch(e) {}
        setPendingOrderId(null);
        Alert.alert('eSewa Error', 'Failed to connect to eSewa payment gateway.');
      }

    } catch (error: any) {
      // If we already created an order but eSewa failed, cancel it
      if (pendingOrderId) {
        try { await cancelOrder(pendingOrderId); } catch(e) {}
        setPendingOrderId(null);
      }
      Alert.alert('Payment Initiation Failed', error?.message || 'Could not connect to eSewa. Please try again.');
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigationStateChange = async (navState: any) => {
    const { url } = navState;

    if (url.includes('sanjeevani-health.com/payment/success')) {
      // Payment successful, close webview immediately
      setEsewaHtmlConfig(null);
      setLoading(true);
      
      try {
        // Extract data parameter from URL
        const urlObj = new URL(url);
        const encodedData = urlObj.searchParams.get('data');
        
        if (encodedData) {
          // 1. Verify payment with eSewa API (Our backend will auto-upgrade the DB order status!)
          await verifyEsewaPayment(encodedData);
          setPendingOrderId(null); // Success, so clear the pending tracker
          
          // 2. Success Alert & Clear Cart
          Alert.alert(
            'Order Placed Successfully! 🎉',
            `Thank you ${fullName.split(' ')[0]}, your order has been received and will be shipped to ${address}.\n\nPayment Method: eSewa`,
            [
              { 
                text: 'View My Orders', 
                onPress: async () => {
                  await clearCart();
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'User', params: { screen: 'UserProfile' } }],
                  });
                } 
              }
            ]
          );
        } else {
            throw new Error("Missing verification data");
        }
      } catch (error) {
         Alert.alert('Payment Verification Failed', 'We could not verify your payment with eSewa. If money was deducted, please check your history.');
      } finally {
         setLoading(false);
      }
    } else if (url.includes('sanjeevani-health.com/payment/failure')) {
      setEsewaHtmlConfig(null);
      
      // Cancel the pending order to restore the medicine stock!
      if (pendingOrderId) {
          try {
              await cancelOrder(pendingOrderId);
          } catch (cancelErr) {
              console.error('Failed to cancel abandoned order', cancelErr);
          }
          setPendingOrderId(null);
      }

      Alert.alert('Payment Cancelled', 'Your eSewa payment was not completed.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={{ flex: 1, backgroundColor: '#F5F7FA' }}
    >
      {/* Header */}
      <View 
        className={`bg-[#00695C] pb-5 px-5 flex-row items-center rounded-b-[30px] shadow-sm`}
        style={{ paddingTop: insets.top + (Platform.OS === 'android' ? 20 : 10) }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <FontAwesome5 name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white ml-3">Secure Checkout</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        
        {/* Order Summary */}
        <View className="bg-white p-5 rounded-2xl shadow-sm mb-6 flex-row justify-between items-center border border-[#E0F2F1]">
          <View>
            <Text className="text-[13px] font-bold text-[#78909C] uppercase tracking-wider mb-1">Order Total ({cartItems.length} Items)</Text>
            <Text className="text-2xl font-extrabold text-[#00695C]">Rs. {totalPrice.toFixed(2)}</Text>
          </View>
          <TouchableOpacity 
            className="bg-[#E0F2F1] px-4 py-2.5 rounded-xl flex-row items-center border border-[#B2DFDB]"
            onPress={() => navigation.navigate('User', { screen: 'Store' })}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="plus" size={12} color="#00695C" />
            <Text className="text-[#00695C] font-bold ml-2">Add Items</Text>
          </TouchableOpacity>
        </View>

        {/* Shipping Details */}
        <Text className="text-lg font-bold text-[#263238] mb-4 ml-1">Shipping Details</Text>
        <View className="bg-white p-6 rounded-2xl shadow-sm mb-8 border border-[#ECEFF1]">
          
          <View className="mb-5">
            <Text className="text-xs font-bold text-[#78909C] uppercase mb-2 ml-1">Full Name *</Text>
            <View className="flex-row items-center bg-[#F9FAFB] rounded-xl px-4 h-[54px] border border-[#CFD8DC]">
              <FontAwesome5 name="user" size={16} color="#90A4AE" />
              <TextInput
                className="flex-1 ml-3 text-base text-[#263238] h-full"
                value={fullName}
                onChangeText={setFullName}
                placeholder="John Doe"
              />
            </View>
          </View>

          <View className="mb-5">
            <Text className="text-xs font-bold text-[#78909C] uppercase mb-2 ml-1">Email Address *</Text>
            <View className="flex-row items-center bg-[#F9FAFB] rounded-xl px-4 h-[54px] border border-[#CFD8DC]">
              <FontAwesome5 name="envelope" size={16} color="#90A4AE" />
              <TextInput
                className="flex-1 ml-3 text-base text-[#263238] h-full"
                value={email}
                onChangeText={setEmail}
                placeholder="john@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View className="mb-5">
            <Text className="text-xs font-bold text-[#78909C] uppercase mb-2 ml-1">Phone Number *</Text>
            <View className="flex-row items-center bg-[#F9FAFB] rounded-xl px-4 h-[54px] border border-[#CFD8DC]">
              <FontAwesome5 name="phone" size={16} color="#90A4AE" />
              <TextInput
                className="flex-1 ml-3 text-base text-[#263238] h-full"
                value={phone}
                onChangeText={setPhone}
                placeholder="+977 98xxxxxxxx"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View className="mb-2">
            <Text className="text-xs font-bold text-[#78909C] uppercase mb-2 ml-1">Delivery Address *</Text>
            <View className="flex-row items-start bg-[#F9FAFB] rounded-xl p-4 border border-[#CFD8DC]">
              <FontAwesome5 name="map-marker-alt" size={16} color="#90A4AE" style={{ marginTop: 2 }} />
              <TextInput
                className="flex-1 ml-3 text-base text-[#263238] min-h-[60px]"
                value={address}
                onChangeText={setAddress}
                placeholder="Thamel, Kathmandu, Nepal 44600"
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

        </View>

        {/* Payment Method */}
        <Text className="text-lg font-bold text-[#263238] mb-4 ml-1">Payment Method</Text>
        <View className="space-y-3 mb-6">
          
          <TouchableOpacity 
            className={`flex-row items-center p-4 rounded-2xl border-2 border-[#60BB46] bg-[#F1F8E9]`}
            activeOpacity={1}
          >
            <View className="w-[50px] h-[50px] rounded-xl bg-white border border-[#F0F0F0] justify-center items-center shadow-sm mr-4">
               <Text className="text-[#60BB46] font-extrabold text-sm">eSewa</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-[#263238]">Pay with eSewa</Text>
              <Text className="text-xs text-[#78909C] mt-0.5">Nepal's #1 digital wallet</Text>
            </View>
            <View className="w-6 h-6 rounded-full border-2 items-center justify-center border-[#60BB46]">
              <View className="w-3 h-3 rounded-full bg-[#60BB46]" />
            </View>
          </TouchableOpacity>

        </View>

      </ScrollView>

      {/* Footer Checkout Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white p-5 border-t border-[#ECEFF1] shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        <TouchableOpacity
          className="bg-[#00695C] py-4 rounded-xl items-center shadow-md flex-row justify-center"
          onPress={handlePlaceOrder}
          disabled={loading}
          activeOpacity={0.9}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text className="text-white font-bold text-lg tracking-wide mr-2">
                Place Order (Rs. {totalPrice.toFixed(2)})
              </Text>
              <FontAwesome5 name="check-circle" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Embedded eSewa WebView Modal */}
      <Modal visible={!!esewaHtmlConfig} animationType="slide" onRequestClose={handleClosePaymentModal}>
        <View style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 40 : 0 }}>
          <View className="flex-row items-center p-4 border-b border-[#ECEFF1] bg-white">
             <TouchableOpacity onPress={handleClosePaymentModal} className="p-2">
               <FontAwesome5 name="times" size={20} color="#333" />
             </TouchableOpacity>
             <Text className="text-lg font-bold ml-4">Secure eSewa Payment</Text>
          </View>
          {esewaHtmlConfig && (
            <WebView
              key={Date.now().toString()}
              source={{ html: esewaHtmlConfig }}
              onNavigationStateChange={handleNavigationStateChange}
              style={{ flex: 1 }}
              startInLoadingState={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              mixedContentMode="always"
              thirdPartyCookiesEnabled={true}
              sharedCookiesEnabled={true}
              originWhitelist={['*']}
              onShouldStartLoadWithRequest={() => true}
              cacheEnabled={false}
              incognito={true}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.error('[WebView Error]', nativeEvent);
                Alert.alert('WebView Error', nativeEvent.description || 'Unknown error loading eSewa page');
              }}
              onHttpError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.error('[WebView HTTP Error]', nativeEvent.statusCode, nativeEvent.url);
              }}
              renderLoading={() => (
                <View className="absolute top-0 bottom-0 left-0 right-0 justify-center items-center bg-white z-10">
                  <ActivityIndicator size="large" color="#60BB46" />
                </View>
              )}
            />
          )}
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
};

export default CheckoutScreen;
