import { useState, useRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View, Text } from 'react-native';
import { useSession } from '@/context/authContext';
import { CollectionService } from '@/services/CollectionService';
import { router } from 'expo-router';
import PageTitle from '@/components/ui/text/PageTitle';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import MainButton from '@/components/ui/buttons/MainButton';
import CollectionNameInput from '@/components/ui/inputs/CollectionNameInput';
import { useForm } from '@/hooks/useForm';

export default function CreateCollection() {
    const [isCollectionNameFocused, setIsCollectionNameFocused] = useState(false);
    const [isCollectionNameError, setIsCollectionNameError] = useState(false);
    const [collectionName, setCollectionName] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);
    const { user, sessionToken, getUserCollection } = useSession();

    const { errorMsg } = useForm({
        errorSetters: {
            collectionName: setIsCollectionNameError
        },
        focusSetters: {
            collectionName: setIsCollectionNameFocused
        },
        scrollViewRef
    });

    // TODO: extract this to a hook
    const collectionService = new CollectionService();

    return (
        <KeyboardAvoidingView 
            className="flex-1 bg-background" 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
            <ScrollView 
                ref={scrollViewRef}
                className='flex-1'
                keyboardShouldPersistTaps="handled"
                scrollEnabled={isCollectionNameFocused}>
                <View className="flex-1 items-center gap-12 p-4 bg-background">
                    <PageTitle content='Welcome to KicksFolio !' />
                    <View className='flex justify-center items-center gap-8 w-full mt-32'>
                        <View className="absolute w-full flex items-center" style={{ top: -50 }}>
                            <ErrorMsg content={errorMsg} display={errorMsg !== ''} />
                        </View>
                        <Text className="text-lg font-spacemono-bold">Please give a name to your collection :</Text>

                        <CollectionNameInput
                            collectionName={collectionName}
                            setCollectionName={setCollectionName}
                            isCollectionNameError={isCollectionNameError}
                            isCollectionNameFocused={isCollectionNameFocused}
                            setIsCollectionNameError={setIsCollectionNameError}
                            setIsCollectionNameFocused={setIsCollectionNameFocused}
                        />

                        <MainButton
                            // TODO: extract this to a service and a hook
                            content='Create' 
                            backgroundColor='bg-primary' 
                            onPressAction={async () => {
                                if (collectionName.length === 0) {
                                    setIsCollectionNameError(true);
                                    setErrorMsg('Please put a name to your collection.');
                                } else {
                                    setIsCollectionNameFocused(false);
                                    setIsCollectionNameError(false);
                                    setErrorMsg('');
                                    if (user && sessionToken) {
                                        collectionService.create(collectionName, user.id, sessionToken).then(() => {
                                            getUserCollection().then(() => {
                                                router.replace('/(app)/(tabs)?newUser=true');
                                            }).catch(error => {
                                                setErrorMsg('Something went wrong when getting user collection, please try again.');
                                            });
                                        }).catch(error => {
                                            setErrorMsg('Something went wrong when creating collection, please try again.');
                                        });
                                    } else {
                                        setErrorMsg('Something went wrong, please try again.');
                                    }
                                }
                            }} 
                        />
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}
