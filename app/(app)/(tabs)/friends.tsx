import { Text, View } from 'react-native';
import { useSession } from '@/context/authContext';
import FriendTitle from '@/components/ui/text/FriendTitle';
import CollectionCard from '@/components/ui/cards/CollectionCard';
import Title from '@/components/ui/text/Title';
import MainButton from '@/components/ui/buttons/MainButton';
import PageTitle from '@/components/ui/text/PageTitle';

export default function Friends() {

    return (
      <View className="flex-1">
        <PageTitle content="Friends" />

        <View className="flex-1 gap-4 items-center justify-center">
          <Title content="No friends yet" isTextCenter={true} />
          <MainButton content="Add" backgroundColor="bg-primary" onPressAction={() => {
            alert('Feature in development ...');
          }} />
        </View>
    </View>
)}
