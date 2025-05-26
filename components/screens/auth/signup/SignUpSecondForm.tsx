import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView, Pressable, Alert, Image } from 'react-native';
import { useSignUpProps } from '@/context/signUpPropsContext';
import { useState, useRef } from 'react';
import FirstNameInput from '@/components/ui/inputs/FirstNameInput';
import { FontAwesome5 } from '@expo/vector-icons';
import MainButton from '@/components/ui/buttons/MainButton';
import { Link } from 'expo-router';
import LastNameInput from '@/components/ui/inputs/LastNameInput';
import SizeInput from '@/components/ui/inputs/SizeInput';
import { useAuth } from '@/hooks/useAuth';
import PageTitle from '@/components/ui/text/PageTitle';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { useImagePicker } from '@/hooks/useImagePicker';

export default function SignUpSecondForm() {
    const { signUpProps, setSignUpProps } = useSignUpProps();
    const [firstNameErrorMsg, setFirstNameErrorMsg] = useState('');
    const [lastNameErrorMsg, setLastNameErrorMsg] = useState('');
    const [sizeErrorMsg, setSizeErrorMsg] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [size, setSize] = useState('');

    const scrollViewRef = useRef<ScrollView>(null);
    const lastNameInputRef = useRef<TextInput>(null);
    const sizeInputRef = useRef<TextInput>(null);
    const firstNameInputRef = useRef<TextInput>(null);

    const { signUp } = useAuth();
    const { handleImageSelection } = useImagePicker();

    const errorMsg = firstNameErrorMsg || lastNameErrorMsg || sizeErrorMsg;

    return (
        <KeyboardAvoidingView 
        className="flex-1 bg-background" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
            <ScrollView 
                ref={scrollViewRef}
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <View className="flex-1 items-center gap-12 p-4">
                    <PageTitle content='Sign Up' />
                    <View className='flex gap-6 justify-center items-center w-full mt-8'>
                        <View className="absolute w-full flex items-center" style={{ top: -50 }}>
                            <ErrorMsg content={errorMsg} display={errorMsg !== ''} />
                        </View>

                        <View className='flex flex-col gap-2 w-full justify-center items-center'>
                            <Text className='font-spacemono-bold text-lg'>Profile Picture</Text>
                            {signUpProps.profile_picture ?
                                <View className='w-24 h-24 rounded-full bg-gray-400 flex items-center justify-center'>
                                    <Image 
                                        source={{ uri: signUpProps.profile_picture }} 
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            borderRadius: 100
                                        }}
                                        resizeMode='cover'
                                    /> 
                                </View>
                                : 
                                <Pressable 
                                    className='w-24 h-24 rounded-full bg-gray-400 flex items-center justify-center'
                                    onPress={() => {
                                        Alert.alert(
                                            'Add a profile picture',
                                            'Choose a profile picture',
                                            [
                                                {
                                                    text: 'Take a photo',
                                                    onPress: () => handleImageSelection('camera')
                                                },
                                                {
                                                    text: 'Choose from gallery',
                                                    onPress: () => handleImageSelection('gallery')
                                                },
                                                {
                                                    text: 'Cancel',
                                                    style: 'cancel'
                                                }
                                            ]
                                        );
                                    }}
                                >
                                    <FontAwesome5 name="user-edit" size={24} color="white" />
                                </Pressable>
                            }
                        </View>

                        <FirstNameInput 
                            inputRef={firstNameInputRef}
                            signUpProps={signUpProps}
                            setSignUpProps={setSignUpProps}
                            scrollViewRef={scrollViewRef}
                            onErrorChange={setFirstNameErrorMsg}
                            onValueChange={setFirstName}
                        />

                        <LastNameInput 
                            inputRef={lastNameInputRef}
                            signUpProps={signUpProps}
                            setSignUpProps={setSignUpProps}
                            scrollViewRef={scrollViewRef}
                            onErrorChange={setLastNameErrorMsg}
                            onValueChange={setLastName}
                        />

                        <SizeInput 
                            inputRef={sizeInputRef}
                            signUpProps={signUpProps}
                            setSignUpProps={setSignUpProps}
                            scrollViewRef={scrollViewRef}
                            onErrorChange={setSizeErrorMsg}
                            onValueChange={setSize}
                        />
                    </View>

                    <View className='flex gap-5 w-full justify-center items-center'>
                        <MainButton 
                            content='Sign Up' 
                            backgroundColor='bg-primary' 
                            onPressAction={() => {
                                setTimeout(() => {
                                    signUp(signUpProps, setSignUpProps);
                                }, 300);
                            }}
                        />
                        <View className='flex gap-0 w-full justify-center items-center'>
                            <Text className='font-spacemono-bold text-sm'>Go to previous step ?</Text>
                            <Link href='/sign-up'>
                                <Text className='text-primary font-spacemono-bold text-sm'>
                                    Back
                                </Text>
                            </Link>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}
