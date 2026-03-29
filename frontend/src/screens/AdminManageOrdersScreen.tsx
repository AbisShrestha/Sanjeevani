import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Alert, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllOrders, updateOrderStatus } from '../services/adminService';
import { FontAwesome5 } from '@expo/vector-icons';
import dayjs from 'dayjs';

const AdminManageOrdersScreen = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchText);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchText]);

    const fetchOrders = async () => {
        try {
            if (!refreshing && !debouncedSearch && orders.length === 0) {
                setLoading(true);
            }
            if (debouncedSearch) setIsSearching(true);
            
            const data = await getAllOrders(debouncedSearch);
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch admin orders:', error);
            Alert.alert('Error', 'Could not load orders');
        } finally {
            setLoading(false);
            setRefreshing(false);
            setIsSearching(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [debouncedSearch])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const handleUpdateStatus = (orderId: number, currentStatus: string) => {
        const nextStatusOptions = ['Approved', 'Shipped', 'Completed', 'Cancelled']
            .filter(s => s !== currentStatus);

        Alert.alert(
            'Update Order Status',
            'Select the new status for this order:',
            [
                ...nextStatusOptions.map(status => ({
                    text: status,
                    onPress: async () => {
                        try {
                            await updateOrderStatus(orderId, status);
                            fetchOrders();
                        } catch (err) {
                            Alert.alert('Error', 'Failed to update order status');
                        }
                    }
                })),
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    const renderOrderItem = ({ item }: { item: any }) => {
        const getStatusColor = (status: string) => {
            switch (status) {
                case 'Processing': return '#2196F3';
                case 'Approved': return '#00BCD4';
                case 'Shipped': return '#FF9800';
                case 'Completed': return '#4CAF50';
                case 'Cancelled': return '#F44336';
                default: return '#757575';
            }
        };

        const parsedItems = Array.isArray(item.items) ? item.items : [];

        return (
            <View style={styles.card}>
                <View style={styles.headerRow}>
                    <Text style={styles.orderId}>Order #{item.orderid}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.orderstatus) }]}>
                        <Text style={styles.statusText}>{item.orderstatus}</Text>
                    </View>
                </View>
                
                <View style={styles.detailRow}>
                    <FontAwesome5 name="user" size={14} color="#666" style={{ width: 20 }} />
                    <Text style={styles.detailText}>{item.username} ({item.userphone})</Text>
                </View>

                <View style={styles.detailRow}>
                    <FontAwesome5 name="map-marker-alt" size={14} color="#666" style={{ width: 20 }} />
                    <Text style={styles.detailText}>{item.shippingaddress}</Text>
                </View>
                
                <View style={styles.detailRow}>
                    <FontAwesome5 name="clock" size={14} color="#666" style={{ width: 20 }} />
                    <Text style={styles.detailText}>{dayjs(item.createdat).format('DD MMM YYYY, hh:mm A')}</Text>
                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionSubtitle}>Items:</Text>
                {parsedItems.map((prod: any, idx: number) => (
                    <View key={idx} style={styles.productRow}>
                        <Text style={styles.productName}>{prod.quantity}x {prod.name}</Text>
                        <Text style={styles.productPrice}>Rs. {prod.price}</Text>
                    </View>
                ))}

                <View style={styles.divider} />

                <View style={styles.footerRow}>
                    <Text style={styles.totalLabel}>Total Paid ({item.paymentmethod}):</Text>
                    <Text style={styles.totalValue}>Rs. {item.totalamount}</Text>
                </View>

                <TouchableOpacity 
                    style={styles.actionBtn} 
                    onPress={() => handleUpdateStatus(item.orderid, item.orderstatus)}
                >
                    <Text style={styles.actionBtnText}>Update Status</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#00695C" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* SEARCH BAR */}
            <View style={{ backgroundColor: 'white', padding: 12, marginHorizontal: 16, marginTop: 16, marginBottom: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, borderWidth: 1, borderColor: '#eee' }}>
                <FontAwesome5 name="search" size={16} color="#999" />
                <TextInput
                    style={{ flex: 1, marginLeft: 12, fontSize: 15, color: '#333' }}
                    placeholder="Search by Order ID, Name, Email..."
                    value={searchText}
                    onChangeText={setSearchText}
                />
                {isSearching ? (
                    <ActivityIndicator size="small" color="#00695C" style={{ padding: 4 }} />
                ) : searchText ? (
                    <TouchableOpacity onPress={() => setSearchText('')} style={{ padding: 4 }}>
                        <FontAwesome5 name="times-circle" size={16} color="#ccc" />
                    </TouchableOpacity>
                ) : null}
            </View>

            {loading && !refreshing ? (
                <View style={[styles.center, { marginTop: 50 }]}>
                    <ActivityIndicator size="large" color="#00695C" />
                </View>
            ) : (
                <FlatList
                    data={orders}
                keyExtractor={(item: any) => (item.orderid || Math.random()).toString()}
                renderItem={renderOrderItem}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00695C']} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <FontAwesome5 name={searchText ? "search-minus" : "box-open"} size={64} color="#ccc" />
                        <Text style={styles.emptyText}>{searchText ? 'No orders match your search query.' : 'No orders received yet.'}</Text>
                    </View>
                }
            />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContainer: { padding: 15, paddingBottom: 40 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#E0E0E0'
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    orderId: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    detailText: { fontSize: 13, color: '#555', flex: 1 },
    divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 12 },
    sectionSubtitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    productRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    productName: { fontSize: 13, color: '#666', flex: 1 },
    productPrice: { fontSize: 13, fontWeight: '600', color: '#333' },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5, marginBottom: 15 },
    totalLabel: { fontSize: 14, color: '#666' },
    totalValue: { fontSize: 16, fontWeight: 'bold', color: '#00695C' },
    actionBtn: {
        backgroundColor: '#00695C',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 16, color: '#888', marginTop: 15 }
});

export default AdminManageOrdersScreen;
