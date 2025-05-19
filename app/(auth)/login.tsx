import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState, useRef } from 'react';
import PrivacyPolicy from '@/components/ui/text/PrivacyPolicy';
import LoginForm from '@/components/screens/login/loginForm';

export default function Login() {
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    return (
        <>
            <KeyboardAvoidingView 
                className="flex-1 bg-background" 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
                <ScrollView 
                    ref={scrollViewRef}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    scrollEnabled={isEmailFocused || isPasswordFocused}>

                    <LoginForm 
                        isEmailFocused={isEmailFocused}
                        isPasswordFocused={isPasswordFocused}
                        setIsEmailFocused={setIsEmailFocused}
                        setIsPasswordFocused={setIsPasswordFocused}
                    />

                </ScrollView>
            </KeyboardAvoidingView>
            <View className='flex justify-center items-center bg-background pb-10'>
                <PrivacyPolicy />
            </View>
        </>
    );
}
