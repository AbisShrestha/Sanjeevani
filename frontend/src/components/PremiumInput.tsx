import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Animated,
    Easing,
    TextInputProps,
} from 'react-native';

interface PremiumInputProps extends TextInputProps {
    label: string;
    error?: string | null;
    touched?: boolean;
}

export const PremiumInput = ({
    label,
    error,
    touched,
    value,
    style,
    onFocus,
    onBlur,
    ...props
}: PremiumInputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(focusAnim, {
            toValue: isFocused || !!value ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
            easing: Easing.out(Easing.ease),
        }).start();
    }, [isFocused, value]);

    const handleFocus = (e: any) => {
        setIsFocused(true);
        if (onFocus) onFocus(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        if (onBlur) onBlur(e);
    };

    const labelStyle = {
        top: focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [18, -10], // Move up
        }),
        fontSize: focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 12], // Scale down
        }),
        color: focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['#78909C', '#2E7D32'], // Change color
        }),
    };

    // Determine border color/width based on state
    // We handle these via dynamic classes or inline styles for specific colors that tailwind might not map perfectly if custom, 
    // but here we use standard tailwind logic where possible. 
    // However, border color animation isn't standard in nativewind without extras, so we'll control class names conditionally.

    const getBorderColorClass = () => {
        if (error && touched) return 'border-[#D32F2F]';
        if (isFocused) return 'border-[#2E7D32]';
        return 'border-[#CFD8DC]';
    };

    const getBorderWidthClass = () => {
        if (isFocused || (error && touched)) return 'border-2';
        return 'border';
    };

    return (
        <View className="mb-5" style={style}>
            <View
                className={`bg-white rounded-xl px-4 justify-center border ${getBorderColorClass()} ${getBorderWidthClass()} ${props.multiline ? 'h-auto py-2' : 'h-14'}`}
            >
                <Animated.Text
                    style={[
                        labelStyle,
                        { position: 'absolute', left: 16, backgroundColor: 'white', paddingHorizontal: 4, zIndex: 1 }
                        // Note: absolute/zIndex needed for the floating effect
                    ]}
                >
                    {label}
                </Animated.Text>

                <TextInput
                    value={value}
                    className={`text-base text-[#263238] p-0 ${props.multiline ? 'h-[100px] mt-5 align-top' : 'h-full'}`}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholderTextColor="transparent"
                    {...props}
                />
            </View>
            {error && touched && (
                <View className="flex-row items-center mt-1.5 ml-1">
                    <Text className="text-[#D32F2F] text-xs font-medium">• {error}</Text>
                </View>
            )}
        </View>
    );
};
