import CollectionCard from '@/components/ui/cards/CollectionCard';
import PageTitle from '@/components/ui/text/PageTitle';
import Title from '@/components/ui/text/Title';
import MainButton from '@/components/ui/buttons/MainButton';
import { ScrollView, View, Modal, Pressable } from 'react-native';
import { useSession } from '@/context/authContext';
import { useLocalSearchParams } from "expo-router";
import { useState, useEffect } from 'react';
import { SneakersModal } from '@/components/modals/SneakersModal';
import { useStepModalStore } from '@/store/useStepModalStore';

export default function Index() {
    const params = useLocalSearchParams();
    const isNewUser = params.newUser === 'true';
    const { userCollection, userSneakers, setUserSneakers } = useSession();
    const [modalVisible, setModalVisible] = useState(false);
    const { setModalStep } = useStepModalStore();

    useEffect(() => {
        if (isNewUser || !userSneakers || userSneakers.length === 0) {
            setModalStep('index');
            setModalVisible(true);
        } else {
            setModalVisible(false);
        }
    }, [isNewUser, userSneakers]);

    return (
        <View className="flex-1">
            <ScrollView className="flex-1">
                <View className="flex-1 gap-10">
                    <PageTitle content="KicksFolio" />

                    <View className='flex-1 gap-32'>
                        <View className="flex-1 gap-4">
                            <Title content="My collection" />
                            <View className="flex-1 px-4">
                                <CollectionCard userCollection={userCollection} userSneakers={userSneakers} />
                            </View>
                        </View>
                        <View className="flex-1 gap-4">
                            <View className="flex-1 gap-4 items-center justify-center">
                                <Title content="Add some friends" isTextCenter={true} />
                                <MainButton content="Browse" backgroundColor="bg-primary" onPressAction={() => {
                                    alert('Feature in development ...');
                                }} />
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable 
                    className="flex-1 bg-black/50" 
                    onPress={() => setModalVisible(false)}
                >
                    <View className="flex-1 justify-end">
                        <Pressable 
                            className="h-[80%] bg-background rounded-t-3xl p-4"
                            onPress={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            <SneakersModal 
                                isVisible={modalVisible} 
                                onClose={() => setModalVisible(false)} 
                                userSneakers={userSneakers} 
                                setUserSneakers={setUserSneakers} 
                                sneaker={null} 
                            />
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}
