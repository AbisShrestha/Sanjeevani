import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    StatusBar,
    SafeAreaView,
    StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import api from '../services/api';

/* 
   TYPES
*/
interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const SUGGESTIONS = [
    "Diet for healthy heart ❤️",
    "Yoga for stress relief 🧘",
    "Foods to boost immunity 🥦",
    "Tips for better sleep 😴",
];

// Define styles for Markdown (Bot messages)
const markdownStyles = StyleSheet.create({
    body: { fontSize: 15, lineHeight: 22, color: '#333' },
    strong: { fontWeight: '700', color: '#004D40' },
    em: { fontStyle: 'italic' },
    heading1: { fontSize: 18, fontWeight: 'bold', color: '#00695C', marginBottom: 10 },
    heading2: { fontSize: 16, fontWeight: 'bold', color: '#00695C', marginBottom: 8 },
    bullet_list: { marginBottom: 8 },
    ordered_list: { marginBottom: 8 },
    list_item: { marginBottom: 4 },
});

const ChatBotScreen = ({ navigation }: { navigation: any }) => {
    // Using props instead of useNavigation hook
    const insets = useSafeAreaInsets();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Namaste! I am Sanjeevani AI. \n\nI can help you with diet plans, lifestyle tips, and general health advice. How can I help you today?",
            sender: 'bot',
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    /* 
       AUTO SCROLL
    */
    useEffect(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
    }, [messages, isTyping]);

    /* 
       SEND MESSAGE
    */
    const handleSend = async (text: string = inputText) => {
        const cleanText = text.trim();
        if (!cleanText) return;

        // 1. Add User Message
        const userMsg: Message = {
            id: Date.now().toString(),
            text: cleanText,
            sender: 'user',
            timestamp: new Date(),
        };

        const botMsgId = (Date.now() + 1).toString();
        
        // 2. Add an EMPTY bot message placeholder that we will immediately start filling
        const botMsgPlaceholder: Message = {
            id: botMsgId,
            text: '',
            sender: 'bot',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg, botMsgPlaceholder]);
        setInputText('');
        setIsTyping(true);

        // 3. Call Backend API using XHR to read the stream progressively
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${api.defaults.baseURL}/chat`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        // Manual extraction to bridge Axios token config to XHR
        import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
            AsyncStorage.getItem('token').then(token => {
                if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                
                // Moved send() inside here to ensure auth header is attached before sending
                xhr.send(JSON.stringify({ message: cleanText }));
            });
        });

        let seenBytes = 0;
        let buffer = ''; 

        xhr.onreadystatechange = () => {
             if (xhr.readyState === 3 || xhr.readyState === 4) {
                 const newText = xhr.responseText.substring(seenBytes);
                 seenBytes = xhr.responseText.length;
                 buffer += newText;
                 
                 let parts = buffer.split('\n\n');
                 // The last segment might be an incomplete chunk, so keep it in the buffer until the next network packet arrives
                 buffer = parts.pop() || '';
                 
                 for (const chunk of parts) {
                     if (chunk.startsWith('data: ')) {
                         try {
                             const dataObj = JSON.parse(chunk.replace('data: ', ''));
                             
                             if (dataObj.text) {
                                 // Dynamically update the specific bot message in the state
                                 setMessages(prev => prev.map(m => 
                                     m.id === botMsgId 
                                        ? { ...m, text: m.text + dataObj.text }
                                        : m
                                 ));
                             }
                         } catch (e) {
                             // This won't happen often now because we wait for the double newline boundary
                             console.error("SSE JSON Parse Error", e);
                         }
                     }
                 }
                 
                 if (xhr.readyState === 4) {
                     setIsTyping(false);
                 }
             }
        };

        xhr.onerror = () => {
             console.error('XHR Stream Error');
             setMessages(prev => prev.map(m => 
                m.id === botMsgId 
                   ? { ...m, text: "I am having trouble connecting to my knowledge base. Please try again later." }
                   : m
             ));
             setIsTyping(false);
        };
    };

    const renderItem = ({ item }: { item: Message }) => {
        const isUser = item.sender === 'user';
        return (
            <View className={`flex-row mb-4 items-end ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                    <View className="w-8 h-8 rounded-full bg-[#00695C] justify-center items-center mr-2 mb-1">
                        <FontAwesome5 name="robot" size={14} color="#fff" />
                    </View>
                )}
                <View
                    className={`max-w-[80%] p-3.5 rounded-2xl shadow-sm ${isUser
                        ? 'bg-[#00695C] rounded-br-sm'
                        : 'bg-white rounded-bl-sm'
                        }`}
                >
                    {isUser ? (
                        <Text className="text-[15px] leading-6 text-white">
                            {item.text}
                        </Text>
                    ) : (
                        <Markdown style={markdownStyles}>
                            {item.text}
                        </Markdown>
                    )}
                    <Text className={`text-[10px] mt-1.5 self-end ${isUser ? 'text-white/70' : 'text-gray-400'}`}>
                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-[#E0F2F1]">
            <StatusBar barStyle="dark-content" backgroundColor="#E0F2F1" />

            {/* HEADER */}
            <View
                className="bg-[#E0F2F1] px-4 pb-3 border-b border-[#B2DFDB]"
                style={{ paddingTop: insets.top + (Platform.OS === 'android' ? 10 : 5) }}
            >
                <View className="flex-row items-center">
                    <TouchableOpacity
                        className="mr-4 p-2"
                        onPress={() => navigation.navigate('Home')}
                    >
                        <FontAwesome5 name="arrow-left" size={20} color="#004D40" />
                    </TouchableOpacity>

                    <View className="w-11 h-11 rounded-full bg-[#B2DFDB] justify-center items-center mr-3">
                        <FontAwesome5 name="heartbeat" size={24} color="#00695C" />
                    </View>
                    <View>
                        <Text className="text-lg font-bold text-[#004D40]">Sanjeevani AI</Text>
                        <Text className="text-[13px] text-[#00796B]">Health & Lifestyle Assistant</Text>
                    </View>
                </View>
            </View>

            {/* CHAT AREA */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                className="flex-1"
            />

            {/* TYPING INDICATOR */}
            {isTyping && (
                <View className="flex-row items-center ml-5 mb-3">
                    <ActivityIndicator size="small" color="#00695C" />
                    <Text className="ml-2 text-[#00695C] text-xs italic">Sanjeevani is thinking...</Text>
                </View>
            )}

            {/* SUGGESTIONS (Quick Chips) */}
            {!isTyping && messages.length < 3 && (
                <View className="px-4 mb-3">
                    <Text className="text-xs text-[#555] mb-2 ml-1">Try asking:</Text>
                    <View className="flex-row flex-wrap">
                        {SUGGESTIONS.map((s, i) => (
                            <TouchableOpacity
                                key={i}
                                className="bg-[#B2DFDB] px-3 py-2 rounded-2xl mr-2 mb-2"
                                onPress={() => handleSend(s)}
                            >
                                <Text className="text-[#004D40] text-[13px] font-semibold">{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* INPUT AREA */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
            >
                <View className="flex-row p-3 bg-white items-center border-t border-[#ddd]">
                    <TextInput
                        className="flex-1 bg-[#F5F5F5] rounded-3xl px-4 py-3 text-[15px] text-[#333] max-h-24"
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Ask about diet, yoga, health..."
                        placeholderTextColor="#888"
                        multiline
                    />
                    <TouchableOpacity
                        className={`w-11 h-11 rounded-full justify-center items-center ml-3 shadow-sm ${!inputText.trim() ? 'bg-[#B0BEC5]' : 'bg-[#00695C]'}`}
                        onPress={() => handleSend()}
                        disabled={!inputText.trim()}
                    >
                        <FontAwesome5 name="paper-plane" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

export default ChatBotScreen;
