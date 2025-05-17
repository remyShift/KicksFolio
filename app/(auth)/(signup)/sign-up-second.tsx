import { Link, router } from 'expo-router';
import { View, TextInput, Text, KeyboardAvoidingView, Platform, ScrollView, Pressable, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useSignUpProps } from '@/context/signUpPropsContext';
import PageTitle from '@/components/ui/text/PageTitle';
import MainButton from '@/components/ui/buttons/MainButton';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { useState, useRef } from 'react';
import { FormService, FieldName } from '@/services/FormService';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import PrivacyPolicy from '@/components/ui/text/PrivacyPolicy';
import { imageService } from '@/services/ImageService';
import { authService } from '@/services/AuthService';

export default function SUSecond() {
    const { signUpProps, setSignUpProps } = useSignUpProps();
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

    const formValidation = new FormService(setErrorMsg, {
        firstName: setIsFirstNameError,
        lastName: setIsLastNameError,
        size: setIsSizeError
    }, {
        firstName: setIsFirstNameFocused,
        lastName: setIsLastNameFocused,
        size: setIsSizeFocused
    }, scrollViewRef);

    const handleInputFocus = (inputType: FieldName) => {
        formValidation.handleInputFocus(inputType);
    };

    const handleInputBlur = (inputType: FieldName, value: string) => {
        formValidation.handleInputBlur(inputType, value);
    };

    const handleSignUp = async () => {
        const success = await authService.handleSignUp(
            signUpProps.email,
            signUpProps.password,
            signUpProps.username,
            signUpProps.first_name,
            signUpProps.last_name,
            signUpProps.sneaker_size,
            signUpProps.profile_picture,
            formValidation,
            setSignUpProps,
            signUpProps
        );

        if (success) {
            router.replace('/collection');
        }
    };

    const handleImageSelection = async (type: 'camera' | 'gallery') => {
        const imageUri = type === 'camera' 
            ? await imageService.takePhoto()
            : await imageService.pickImage();

        if (imageUri) {
            setSignUpProps({ ...signUpProps, profile_picture: imageUri });
        }
    };

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
                    scrollEnabled={isFirstNameFocused || isLastNameFocused || isSizeFocused}>
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
                                    onSubmitEditing={() => formValidation.validateField(signUpProps.first_name, 'firstName')}
                                    onFocus={() => handleInputFocus('firstName')}
                                    onBlur={() => handleInputBlur('firstName', signUpProps.first_name)}
                                    onChangeText={(text) => {
                                        setSignUpProps({ ...signUpProps, first_name: text });
                                        formValidation.handleInputChange(text, (t) => setSignUpProps({ ...signUpProps, first_name: t }));
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
                                    onSubmitEditing={() => formValidation.validateField(signUpProps.last_name, 'lastName')}
                                    onFocus={() => handleInputFocus('lastName')}
                                    onBlur={() => handleInputBlur('lastName', signUpProps.last_name)}
                                    onChangeText={(text) => {
                                        setSignUpProps({ ...signUpProps, last_name: text });
                                        formValidation.handleInputChange(text, (t) => setSignUpProps({ ...signUpProps, last_name: t }));
                                    }}
                                    className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                                        isLastNameError ? 'border-2 border-red-500' : ''
                                    } ${isLastNameFocused ? 'border-2 border-primary' : ''}`}
                                />
                            </View>

                            <View className='flex flex-col gap-2 w-full justify-center items-center'>
                                <Text className='font-spacemono-bold text-lg'>*Sneaker prout (US)</Text>
                                <TextInput
                                    ref={sizeInputRef}
                                    className={`bg-white rounded-md p-2 w-2/3 font-spacemono-bold relative ${
                                        isSizeError ? 'border-2 border-red-500' : ''
                                    } ${isSizeFocused ? 'border-2 border-primary' : ''}`} 
                                    placeholder="9.5"
                                    inputMode='decimal'
                                    keyboardType='decimal-pad'
                                    maxLength={4}
                                    clearButtonMode='while-editing'
                                    returnKeyType='done'
                                    enablesReturnKeyAutomatically={true}
                                    autoComplete='off'
                                    placeholderTextColor='gray'
                                    value={signUpProps.sneaker_size ? String(signUpProps.sneaker_size) : ''}
                                    onChangeText={(text) => {
                                        const formattedText = text.replace(',', '.');
                                        if (formattedText === '' || !isNaN(Number(formattedText))) {
                                            setSignUpProps({ ...signUpProps, sneaker_size: formattedText });
                                            formValidation.handleInputChange(formattedText, (t) => setSignUpProps({ ...signUpProps, sneaker_size: t }));
                                        }
                                    }}
                                    onFocus={() => handleInputFocus('size')}
                                    onBlur={() => handleInputBlur('size', String(signUpProps.sneaker_size))}
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
                </ScrollView>
            </KeyboardAvoidingView>
            <View className='flex justify-center items-center bg-background pb-10'>
                <PrivacyPolicy />
            </View>
        </>
    );
}
