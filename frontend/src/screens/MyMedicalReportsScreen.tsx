import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Platform, Linking } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { SERVER_URL } from '../services/api';
import dayjs from 'dayjs';

const MyMedicalReportsScreen = ({ navigation }: { navigation: any }) => {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [storageUsed, setStorageUsed] = useState(0);
    const [storageLimit, setStorageLimit] = useState(100 * 1024 * 1024);

    const fetchReports = async () => {
        try {
            const res = await api.get('/reports/my-reports');
            setReports(res.data.reports);
            setStorageUsed(res.data.storageUsedBytes);
            setStorageLimit(res.data.storageLimitBytes);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchReports();
        }, [])
    );

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const file = result.assets[0];

            if (file.size && file.size > 25 * 1024 * 1024) {
                Alert.alert('File Too Large', 'Maximum file size is 25MB per report.');
                return;
            }

            setUploading(true);

            const formData = new FormData();
            const filename = file.name || 'report.pdf';
            const match = /\.(\w+)$/.exec(filename);
            let type = file.mimeType || 'application/octet-stream';
            if (!type || type === 'application/octet-stream') {
                if (match) {
                    const ext = match[1].toLowerCase();
                    if (['jpg', 'jpeg'].includes(ext)) type = 'image/jpeg';
                    else if (ext === 'png') type = 'image/png';
                    else if (ext === 'pdf') type = 'application/pdf';
                    else if (ext === 'webp') type = 'image/webp';
                }
            }

            // @ts-ignore - React Native FormData needs this format
            formData.append('file', { uri: file.uri, name: filename, type });

            const token = await AsyncStorage.getItem('token');

            await api.post('/reports/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                transformRequest: (data: any) => formData,
            });

            Alert.alert('Success', 'Report uploaded successfully! ✅');
            fetchReports();
        } catch (error: any) {
            const msg = error.response?.data?.error || 'Failed to upload report';
            Alert.alert('Upload Failed', msg);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (reportId: number, name: string) => {
        Alert.alert('Delete Report', `Are you sure you want to delete "${name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.delete(`/reports/${reportId}`);
                        fetchReports();
                    } catch (error) {
                        Alert.alert('Error', 'Could not delete the report.');
                    }
                },
            },
        ]);
    };

    const handleViewReport = (filename: string) => {
        const url = `${SERVER_URL}/uploads/reports/${filename}`;
        Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open the report.'));
    };

    const getFileIcon = (mimetype: string) => {
        if (mimetype === 'application/pdf') return 'file-pdf';
        if (mimetype.startsWith('image/')) return 'file-image';
        return 'file-alt';
    };

    const getFileIconColor = (mimetype: string) => {
        if (mimetype === 'application/pdf') return '#E53935';
        if (mimetype.startsWith('image/')) return '#1E88E5';
        return '#757575';
    };

    const usagePercent = storageLimit > 0 ? (storageUsed / storageLimit) * 100 : 0;

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.reportCard}>
            <TouchableOpacity style={styles.reportContent} onPress={() => handleViewReport(item.filename)}>
                <View style={[styles.fileIconContainer, { backgroundColor: getFileIconColor(item.mimetype) + '15' }]}>
                    <FontAwesome5 name={getFileIcon(item.mimetype)} size={22} color={getFileIconColor(item.mimetype)} />
                </View>
                <View style={styles.reportInfo}>
                    <Text style={styles.reportName} numberOfLines={1}>{item.originalname}</Text>
                    <Text style={styles.reportMeta}>
                        {formatFileSize(item.filesize)} • {dayjs(item.uploadedat).format('DD MMM YYYY')}
                    </Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.reportid, item.originalname)} style={styles.deleteBtn}>
                <FontAwesome5 name="trash-alt" size={16} color="#E53935" />
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#00695C" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <FontAwesome5 name="arrow-left" size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Medical Reports</Text>
            </View>

            {/* Storage Usage Bar */}
            <View style={styles.storageCard}>
                <View style={styles.storageRow}>
                    <Text style={styles.storageLabel}>Storage Used</Text>
                    <Text style={styles.storageValue}>
                        {formatFileSize(storageUsed)} / {formatFileSize(storageLimit)}
                    </Text>
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${Math.min(usagePercent, 100)}%` }]} />
                </View>
            </View>

            {/* Upload Button */}
            <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload} disabled={uploading}>
                {uploading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <FontAwesome5 name="cloud-upload-alt" size={18} color="#fff" style={{ marginRight: 10 }} />
                        <Text style={styles.uploadBtnText}>Upload Report (PDF / Image)</Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Reports List */}
            {reports.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyCircle}>
                        <FontAwesome5 name="file-medical-alt" size={40} color="#00695C" />
                    </View>
                    <Text style={styles.emptyTitle}>No Reports Uploaded</Text>
                    <Text style={styles.emptySubtitle}>Upload your lab results, prescriptions, or X-rays for doctors to review during consultations.</Text>
                </View>
            ) : (
                <FlatList
                    data={reports}
                    keyExtractor={(item: any) => (item.reportid || Math.random()).toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default MyMedicalReportsScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 20, paddingBottom: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 30,
        backgroundColor: '#00695C',
    },
    backBtn: { padding: 5, marginRight: 15 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    storageCard: {
        margin: 15, backgroundColor: '#fff', borderRadius: 12, padding: 15,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
    },
    storageRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    storageLabel: { fontSize: 14, color: '#666' },
    storageValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    progressBarBg: { height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#00695C', borderRadius: 4 },
    uploadBtn: {
        flexDirection: 'row', backgroundColor: '#00695C', marginHorizontal: 15, padding: 15,
        borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10,
    },
    uploadBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
    listContainer: { paddingHorizontal: 15, paddingBottom: 30 },
    reportCard: {
        flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12,
        marginBottom: 10, alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1,
        borderWidth: 1, borderColor: '#f0f0f0',
    },
    reportContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    fileIconContainer: { width: 45, height: 45, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    reportInfo: { marginLeft: 12, flex: 1 },
    reportName: { fontSize: 14, fontWeight: '600', color: '#333' },
    reportMeta: { fontSize: 12, color: '#999', marginTop: 3 },
    deleteBtn: { padding: 10 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyCircle: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#E0F2F1',
        justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#37474F', marginBottom: 10 },
    emptySubtitle: { fontSize: 14, color: '#78909C', textAlign: 'center', lineHeight: 22 },
});
