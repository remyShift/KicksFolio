import CollectionCard from '@/components/ui/cards/CollectionCard';
import Title from '@/components/ui/text/Title';
import MainButton from '@/components/ui/buttons/MainButton';
import { ScrollView, View } from 'react-native';
import { useSession } from '@/context/authContext';
import { useLocalSearchParams } from "expo-router";
import { useEffect } from 'react';
import { useModalStore } from '@/store/useModalStore';
import SneakersModalWrapper from '@/components/screens/app/SneakersModalWrapper';
import useToast from '@/hooks/useToast';

export default function Index() {
    const params = useLocalSearchParams();
    const isNewUser = params.newUser === 'true';
    const { userCollection, userSneakers } = useSession();
    const { setModalStep, setIsVisible, modalStep, isVisible } = useModalStore();
    const { showInfoToast } = useToast();

    useEffect(() => {
        if (isNewUser || !userSneakers || userSneakers.length === 0) {
            setModalStep('index');
            setIsVisible(true);
        } else {
            if (!isVisible || (modalStep !== 'view' && modalStep !== 'editForm')) {
                setIsVisible(false);
            }
        }
    }, [isNewUser, userSneakers]);

    return (
        <ScrollView className="flex-1 pt-32">
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
                                showInfoToast('Feature in development ...', 'We are working on it ! 💪🏼');
                            }} />
                        </View>
                    </View>
                </View>
                <SneakersModalWrapper />
        </ScrollView>
    );
}
