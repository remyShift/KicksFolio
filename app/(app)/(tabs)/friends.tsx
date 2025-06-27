import { View } from 'react-native';
import Title from '@/components/ui/text/Title';
import MainButton from '@/components/ui/buttons/MainButton';
import useToast from '@/hooks/useToast';
import SneakersModalWrapper from '@/components/screens/app/SneakersModalWrapper';

export default function Friends() {
    const { showInfoToast } = useToast();

    return (
      <View className="flex-1 gap-4 items-center justify-center">
        <Title content="No friends yet" isTextCenter={true} />
        <MainButton content="Add" backgroundColor="bg-primary" onPressAction={() => {
          showInfoToast('Feature in development ...', 'We are working on it ! 💪🏼');
        }} />
        <SneakersModalWrapper />
      </View>
)}
