import { Text, View } from 'react-native';
import { useSession } from '@/context/authContext';
import FriendTitle from '@/components/text/FriendTitle';
import CollectionCard from '@/components/cards/CollectionCard';
import Title from '@/components/text/Title';
import MainButton from '@/components/buttons/MainButton';
import PageTitle from '@/components/text/PageTitle';

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
