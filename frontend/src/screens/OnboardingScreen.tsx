import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Dimensions,
    TouchableOpacity,
    Image,
    StatusBar,
    SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'AI Health Companion',
        description:
            'Chat with Dr. Sanjeevani for instant Ayurvedic advice, diet plans, and yoga recommendations tailored to your Dosha.',
    },
    {
        id: '2',
        title: 'Authentic Medicines',
        description:
            'Browse our smart store for verified Ayurvedic remedies. High quality, pure ingredients, delivered to your doorstep.',
    },
    {
        id: '3',
        title: 'Expert Consultation',
        description:
            'Connect with experienced Vaidyas for personalized treatment plans. Your health is our priority.',
    },
];

const OnboardingScreen = ({ navigation }: { navigation: any }) => {
    // Using props instead of useNavigation hook
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleFinish = async () => {
        await AsyncStorage.setItem('hasLaunched', 'true');
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
        } else {
            handleFinish();
        }
    };

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const renderItem = ({ item }: { item: any }) => (
        <View style={{ width }} className="items-center px-5 justify-center flex-1">
            <View className="flex-[0.6] justify-center items-center">
                <Image
                    source={require('../assets/logo.jpeg')}
                    className="w-[180px] h-[180px] rounded-[40px] bg-white shadow-lg"
                    resizeMode="contain"
                />
            </View>

            <View className="flex-[0.4] items-center px-5 justify-start">
                <Text className="text-[28px] font-extrabold text-[#00695C] text-center mb-4 tracking-wide">
                    {item.title}
                </Text>
                <Text className="text-base text-[#546E7A] text-center leading-6 max-w-[90%]">
                    {item.description}
                </Text>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <FlatList
                ref={flatListRef}
                data={SLIDES}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                bounces={false}
                keyExtractor={(item) => item.id}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
                scrollEventThrottle={32}
            />

            {/* Pagination Dots */}
            <View className="flex-row justify-center mb-12">
                {SLIDES.map((_, index) => (
                    <View
                        key={index}
                        className={`h-2.5 rounded-full mx-1.5 ${currentIndex === index ? 'w-5 bg-[#00695C]' : 'w-2.5 bg-[#ccc]'}`}
                    />
                ))}
            </View>

            {/* Footer Buttons */}
            <View className="px-5 pb-10">
                {currentIndex < SLIDES.length - 1 ? (
                    <TouchableOpacity
                        onPress={handleNext}
                        className="bg-[#00695C] py-4 rounded-full items-center active:bg-[#004D40]"
                    >
                        <Text className="text-white text-lg font-bold">Next</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={handleFinish}
                        className="bg-[#2E7D32] py-4 rounded-full items-center active:bg-[#1b5e20]"
                    >
                        <Text className="text-white text-lg font-bold">Get Started</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default OnboardingScreen;
