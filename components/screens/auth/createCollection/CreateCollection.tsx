import { useState, useRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, Text } from 'react-native';
import { router } from 'expo-router';
import PageTitle from '@/components/ui/text/PageTitle';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import MainButton from '@/components/ui/buttons/MainButton';
import CollectionNameInput from '@/components/ui/inputs/CollectionNameInput';
import { useForm } from '@/hooks/useForm';
import { useCreateCollection } from '@/hooks/useCreateCollection';

export default function CreateCollection() {
    const [isCollectionNameFocused, setIsCollectionNameFocused] = useState(false);
    const [isCollectionNameError, setIsCollectionNameError] = useState(false);
    const [collectionName, setCollectionName] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);

    const { errorMsg, formValidation } = useForm({
        errorSetters: {
            collectionName: setIsCollectionNameError
        },
        focusSetters: {
            collectionName: setIsCollectionNameFocused
        },
        scrollViewRef
    });

    const { createCollection, error } = useCreateCollection();

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
                            <ErrorMsg content={error || errorMsg} display={!!error || errorMsg !== ''} />
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
                            content='Create' 
                            backgroundColor='bg-primary' 
                            onPressAction={() => {
                                formValidation.validateField(collectionName, 'collectionName')
                                    .then(isValid => {
                                        if (!isValid) {
                                            return;
                                        }
                                        createCollection(collectionName)
                                            .then(success => {
                                                if (success) {
                                                    router.replace('/(app)/(tabs)?newUser=true');
                                                }
                                            });
                                });
                            }} 
                        />
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}
