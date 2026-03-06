import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    StatusBar,
    RefreshControl,
    Platform
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

const AdminUserListScreen = ({ navigation }: { navigation: any }) => {
    // Using props instead of useNavigation hook
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/auth/users');
            setUsers(res.data);
        } catch (error) {
            console.error("Fetch users error:", error);
            Alert.alert("Error", "Failed to fetch user list.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean, name: string) => {
        try {
            const newStatus = !currentStatus;
            await api.put(`/auth/users/${id}/status`, { isActive: newStatus });
            // Optimistic update or refresh
            fetchUsers();
            // Optional: Simple toast or just visual change
        } catch (error) {
            Alert.alert("Error", "Failed to change user status.");
        }
    };

    const handleUpdateRole = (id: string, currentRole: string, name: string) => {
        // Fix for Android: "Tried to show an alert while not attached to an Activity"
        setTimeout(() => {
            Alert.alert(
                "Change Role",
                `Select new role for ${name}`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Make Doctor",
                        onPress: () => updateRoleAPI(id, 'doctor')
                    },
                    {
                        text: "Make Admin",
                        onPress: () => updateRoleAPI(id, 'admin')
                    },
                    {
                        text: "Make User",
                        onPress: () => updateRoleAPI(id, 'user')
                    }
                ]
            );
        }, 100);
    };

    const updateRoleAPI = async (id: string, newRole: string) => {
        try {
            await api.put(`/auth/users/${id}/role`, { role: newRole });
            Alert.alert("Success", `User is now a ${newRole}.`);
            fetchUsers();
        } catch (error) {
            Alert.alert("Error", "Failed to update role.");
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchUsers();
    };

    const renderItem = ({ item }: { item: any }) => (
        <View className="flex-row items-center bg-white p-4 rounded-xl mb-3 shadow-sm">
            <View className="w-[50px] h-[50px] rounded-full bg-[#E0F2F1] justify-center items-center mr-4">
                <FontAwesome5
                    name={item.role === 'admin' ? "user-shield" : "user"}
                    size={24}
                    color={item.role === 'admin' ? "#E65100" : "#00695C"}
                />
            </View>
            <View className="flex-1">
                <Text className="text-base font-bold text-[#333]">{item.fullname}</Text>
                <Text className="text-sm text-[#666]">{item.email}</Text>
                <Text className="text-xs text-[#999] mt-0.5 capitalize">Role: {item.role}</Text>
                <Text className={`text-xs font-bold mt-0.5 ${item.isactive ? 'text-green-600' : 'text-red-600'}`}>
                    {item.isactive ? 'Active' : 'Banned'}
                </Text>
            </View>
            <View className="flex-row">
                <TouchableOpacity onPress={() => handleUpdateRole(item.userid, item.role, item.fullname)} className="p-2 ml-1">
                    <FontAwesome5 name="user-edit" size={18} color="#00695C" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => toggleStatus(item.userid, item.isactive, item.fullname)}
                    className={`p-2 ml-1 rounded-full ${item.isactive ? 'bg-red-50' : 'bg-green-50'}`}
                >
                    <FontAwesome5
                        name={item.isactive ? "ban" : "check-circle"}
                        size={18}
                        color={item.isactive ? "#D32F2F" : "#2E7D32"}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-[#F5F7FA]">
            {loading ? (
                <ActivityIndicator size="large" color="#00695C" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.userid.toString()}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View className="items-center mt-12">
                            <Text className="text-[#999]">No users found.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

export default AdminUserListScreen;
