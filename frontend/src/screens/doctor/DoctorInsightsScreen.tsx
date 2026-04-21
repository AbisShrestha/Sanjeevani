import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { getMyInsights, createInsight, deleteInsight } from '../../services/doctorService';
import { uploadImage } from '../../services/fileUploadService';
import { FontAwesome5 } from '@expo/vector-icons';
import dayjs from 'dayjs';
import * as ImagePicker from 'expo-image-picker';

interface Insight {
    id: number;
    title: string;
    content: string;
    image_url: string;
    created_at: string;
}

const DoctorInsightsScreen = () => {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageAsset, setImageAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchInsights = async () => {
        try {
            setLoading(true);
            const data = await getMyInsights();
            setInsights(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsights();
    }, []);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageAsset(result.assets[0]);
        }
    };

    const handleSubmit = async () => {
        if (!title || !content) {
            Alert.alert('Error', 'Please fill in the title and content.');
            return;
        }

        try {
            setSubmitting(true);
            let uploadedUrl = '';
            if (imageAsset) {
                uploadedUrl = (await uploadImage(imageAsset!)) || '';
            }

            await createInsight(title, content, uploadedUrl);
            Alert.alert('Success', 'Insight published successfully');

            // Reset form
            setTitle('');
            setContent('');
            setImageAsset(null);
            setIsCreating(false);

            fetchInsights();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to publish insight');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert('Delete Insight', 'Are you sure you want to delete this insight?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteInsight(id);
                        fetchInsights(); // Re-fetch
                    } catch (e) {
                        Alert.alert('Error', 'Could not delete insight');
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }: { item: Insight }) => (
        <View style={styles.card}>
            {item.image_url ? (
                <Image source={{ uri: item.image_url! }} style={styles.cardImage} />
            ) : null}
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDate}>{dayjs(item.created_at).format('MMMM D, YYYY')}</Text>
                <Text style={styles.cardText} numberOfLines={3}>{item.content}</Text>

                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                    <FontAwesome5 name="trash" size={16} color="#d32f2f" />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (isCreating) {
        return (
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <ScrollView contentContainerStyle={styles.formContainer}>
                    <Text style={styles.formTitle}>Create New Insight</Text>

                    <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                        {imageAsset ? (
                            <Image source={{ uri: imageAsset.uri! }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <FontAwesome5 name="camera" size={30} color="#999" />
                                <Text style={styles.imagePlaceholderText}>Upload Cover Image</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TextInput
                        style={styles.input}
                        placeholder="Insight Title"
                        value={title}
                        onChangeText={setTitle}
                    />

                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Write your article or medical insight here..."
                        value={content}
                        onChangeText={setContent}
                        multiline
                        textAlignVertical="top"
                    />

                    <View style={styles.formActions}>
                        <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => setIsCreating(false)}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.btn, styles.submitBtn]} onPress={handleSubmit} disabled={submitting}>
                            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Publish</Text>}
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={insights}
                keyExtractor={(item: any) => (item.id || Math.random()).toString()}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.center}>
                            <FontAwesome5 name="lightbulb" size={60} color="#ccc" />
                            <Text style={styles.emptyText}>You haven't written any insights yet.</Text>
                        </View>
                    ) : null
                }
            />

            <TouchableOpacity style={styles.fab} onPress={() => setIsCreating(true)}>
                <FontAwesome5 name="plus" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

export default DoctorInsightsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAF9',
    },
    center: {
        paddingTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardImage: {
        width: '100%',
        height: 150,
    },
    cardContent: {
        padding: 16,
        position: 'relative',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
        paddingRight: 30, // space for delete icon
    },
    cardDate: {
        fontSize: 12,
        color: '#999',
        marginBottom: 10,
    },
    cardText: {
        fontSize: 14,
        color: '#444',
        lineHeight: 20,
    },
    deleteBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 5,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#2E7D32',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
    },
    // Form Styles
    formContainer: {
        padding: 20,
        paddingTop: 40,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    imagePicker: {
        width: '100%',
        height: 200,
        backgroundColor: '#e0e0e0',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderText: {
        marginTop: 10,
        color: '#666',
        fontSize: 16,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        marginBottom: 16,
    },
    textArea: {
        height: 200,
    },
    formActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    btn: {
        flex: 1,
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelBtn: {
        backgroundColor: '#f5f5f5',
        marginRight: 10,
    },
    cancelBtnText: {
        color: '#333',
        fontWeight: 'bold',
        fontSize: 16,
    },
    submitBtn: {
        backgroundColor: '#2E7D32',
        marginLeft: 10,
    },
    submitBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
