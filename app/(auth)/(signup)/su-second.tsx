import { Link, router } from 'expo-router';
import { View, TextInput, Text, KeyboardAvoidingView, Platform, ScrollView, Pressable, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useSignUpProps } from '@/context/signUpPropsContext';
import PageTitle from '@/components/text/PageTitle';
import MainButton from '@/components/buttons/MainButton';
import { useSession } from '@/context/authContext';
import ErrorMsg from '@/components/text/ErrorMsg';
import { useState, useRef } from 'react';
import { handleInputChange, checkBeforeNext, checkName, checkSize } from '@/scripts/formUtils';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import * as ImagePicker from 'expo-image-picker';
import PrivacyPolicy from '@/components/text/PrivacyPolicy';

export default function SUSecond() {
    const { signUpProps, setSignUpProps } = useSignUpProps();
    const { signUp, login } = useSession();
    const [errorMsg, setErrorMsg] = useState('');
    
    const [isFirstNameFocused, setIsFirstNameFocused] = useState(false);
    const [isFirstNameError, setIsFirstNameError] = useState(false);
    const [isLastNameFocused, setIsLastNameFocused] = useState(false);
    const [isLastNameError, setIsLastNameError] = useState(false);
    const [isSizeFocused, setIsSizeFocused] = useState(false);
    const [isSizeError, setIsSizeError] = useState(false);

    const scrollViewRef = useRef<ScrollView>(null);
    const lastNameInputRef = useRef<TextInput>(null);
    const sizeInputRef = useRef<TextInput>(null);
    const firstNameInputRef = useRef<TextInput>(null);

    const scrollToBottom = () => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    };

    const handleInputFocus = (inputType: 'firstName' | 'lastName' | 'size') => {
        if (inputType === 'firstName') setIsFirstNameFocused(true);
        else if (inputType === 'lastName') setIsLastNameFocused(true);
        else if (inputType === 'size') setIsSizeFocused(true);

        setIsFirstNameError(false);
        setIsLastNameError(false);
        setIsSizeError(false);
        setErrorMsg('');
        scrollToBottom();
    };

    const handleInputBlur = (inputType: 'firstName' | 'lastName' | 'size', value: string) => {
        if (inputType === 'firstName') {
            setIsFirstNameFocused(false);
            if (!value) {
                setErrorMsg('Please put your first name.');
                setIsFirstNameError(true);
            } else if (!checkName(value, setErrorMsg, setIsFirstNameError)) {
                return;
            }
        } else if (inputType === 'lastName') {
            setIsLastNameFocused(false);
            if (!value) {
                setErrorMsg('Please put your last name.');
                setIsLastNameError(true);
            } else if (!checkName(value, setErrorMsg, setIsLastNameError)) {
                return;
            }
        } else if (inputType === 'size') {
            setIsSizeFocused(false);
            if (!value || isNaN(Number(value)) || Number(value) <= 0) {
                setErrorMsg('Please put a valid sneaker size.');
                setIsSizeError(true);
            } else if (!checkSize(Number(value), setErrorMsg, setIsSizeError)) {
                return;
            }
        }
    };

    const handleSignUp = () => {
        if (!signUpProps.username.trim()) {
            setErrorMsg('Please put your username.');
            return;
        }

        if (!signUpProps.first_name) {
            setErrorMsg('Please put your first name.');
            setIsFirstNameError(true);
            return;
        }

        if (!signUpProps.last_name) {
            setErrorMsg('Please put your last name.');
            setIsLastNameError(true);
            return;
        }

        if (!signUpProps.sneaker_size || signUpProps.sneaker_size <= 0) {
            setErrorMsg('Please put a valid sneaker size.');
            setIsSizeError(true);
            return;
        }

        setErrorMsg('');
        signUp(
            signUpProps.email,
            signUpProps.password,
            signUpProps.username,
            signUpProps.first_name,
            signUpProps.last_name,
            signUpProps.sneaker_size,
            signUpProps.profile_picture
        ).then(() => {
            login(signUpProps.email, signUpProps.password).then(() => {
                setSignUpProps({ ...signUpProps, email: '', password: '', username: '', first_name: '', last_name: '', sneaker_size: 0, profile_picture: '' });
                router.replace('/collection');
            }).catch((error) => {
                setErrorMsg(`Something went wrong. Please try again 1. ${error}`);
            });
        }).catch((error) => {
            setErrorMsg(`Something went wrong. Please try again 2. ${error}`);
        });
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Désolé, nous avons besoin des permissions pour accéder à vos photos !');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1
        });

        if (!result.canceled) {
            setSignUpProps({ ...signUpProps, profile_picture: result.assets[0].uri });
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert('Désolé, nous avons besoin des permissions pour accéder à votre caméra !');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8
        });

        if (!result.canceled) {
            setSignUpProps({ ...signUpProps, profile_picture: result.assets[0].uri });
        }
    };

    return (
        <KeyboardAvoidingView 
            className="flex-1 bg-background" 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
            <ScrollView 
                ref={scrollViewRef}
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={isFirstNameFocused || isLastNameFocused || isSizeFocused}>
                <View className="flex-1 items-center gap-12 p-4">
                    <PageTitle content='Sign Up' />
                    <View className='flex gap-6 justify-center items-center w-full mt-20'>
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
                                        contentFit="cover"
                                        contentPosition="center"
                                        cachePolicy="memory-disk"
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
                                                    onPress: takePhoto
                                                },
                                                {
                                                    text: 'Choose from gallery',
                                                    onPress: pickImage
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
                        <View className='flex flex-col gap-2 w-full justify-center items-center'>
                            <Text className='font-spacemono-bold text-lg'>*First Name</Text>
                            <TextInput
                                placeholder="John"
                                inputMode='text'
                                textContentType='givenName'
                                clearButtonMode='while-editing'
                                ref={firstNameInputRef}
                                value={signUpProps.first_name}
                                autoComplete={Platform.OS === 'ios' ? 'cc-name' : 'name-given'}
                                autoCorrect={false}
                                placeholderTextColor='gray'
                                returnKeyType='next'
                                enablesReturnKeyAutomatically={true}
                                onSubmitEditing={() => checkBeforeNext(signUpProps.first_name, 'firstName', false, setErrorMsg, setIsFirstNameError, lastNameInputRef)}
                                onFocus={() => handleInputFocus('firstName')}
                                onBlur={() => handleInputBlur('firstName', signUpProps.first_name)}
                                onChangeText={(text) => {
                                    setSignUpProps({ ...signUpProps, first_name: text });
                                    handleInputChange(text, (t) => setSignUpProps({ ...signUpProps, first_name: t }), setErrorMsg);
                                }}
                                className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                                    isFirstNameError ? 'border-2 border-red-500' : ''
                                } ${isFirstNameFocused ? 'border-2 border-primary' : ''}`}
                            />
                        </View>

                        <View className='flex flex-col gap-2 w-full justify-center items-center'>
                            <Text className='font-spacemono-bold text-lg'>*Last Name</Text>
                            <TextInput
                                placeholder="Doe"
                                inputMode='text'
                                textContentType='familyName'
                                ref={lastNameInputRef}
                                value={signUpProps.last_name}
                                autoComplete={Platform.OS === 'ios' ? 'cc-family-name' : 'name-family'}
                                autoCorrect={false}
                                placeholderTextColor='gray'
                                clearButtonMode='while-editing'
                                returnKeyType='next'
                                enablesReturnKeyAutomatically={true}
                                onSubmitEditing={() => checkBeforeNext(signUpProps.last_name, 'lastName', false, setErrorMsg, setIsLastNameError, sizeInputRef)}
                                onFocus={() => handleInputFocus('lastName')}
                                onBlur={() => handleInputBlur('lastName', signUpProps.last_name)}
                                onChangeText={(text) => {
                                    setSignUpProps({ ...signUpProps, last_name: text });
                                    handleInputChange(text, (t) => setSignUpProps({ ...signUpProps, last_name: t }), setErrorMsg);
                                }}
                                className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                                    isLastNameError ? 'border-2 border-red-500' : ''
                                } ${isLastNameFocused ? 'border-2 border-primary' : ''}`}
                            />
                        </View>

                        <View className='flex flex-col gap-2 w-full justify-center items-center'>
                            <Text className='font-spacemono-bold text-lg'>*Sneaker Size (US)</Text>
                            <TextInput
                                ref={sizeInputRef}
                                placeholder="11"
                                inputMode='numeric'
                                value={signUpProps.sneaker_size ? String(signUpProps.sneaker_size) : ''}
                                autoComplete='off'
                                autoCorrect={false}
                                keyboardType='numeric'
                                placeholderTextColor='gray'
                                clearButtonMode='while-editing'
                                returnKeyType='next'
                                enablesReturnKeyAutomatically={true}
                                onSubmitEditing={() => handleSignUp()}
                                onFocus={() => handleInputFocus('size')}
                                onBlur={() => handleInputBlur('size', String(signUpProps.sneaker_size))}
                                onChangeText={(text) => {
                                    setSignUpProps({ ...signUpProps, sneaker_size: Number(text) });
                                    handleInputChange(text, (t) => setSignUpProps({ ...signUpProps, sneaker_size: Number(t) }), setErrorMsg);
                                }}
                                className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                                    isSizeError ? 'border-2 border-red-500' : ''
                                } ${isSizeFocused ? 'border-2 border-primary' : ''}`}
                            />
                        </View>
                    </View>

                    <View className='flex gap-5 w-full justify-center items-center'>
                        <MainButton 
                            content='Sign Up' 
                            backgroundColor='bg-primary' 
                            onPressAction={() => {
                                setTimeout(() => {
                                    handleSignUp();
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
                <View className='flex-1 h-full justify-center items-center'>
                    <PrivacyPolicy />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
