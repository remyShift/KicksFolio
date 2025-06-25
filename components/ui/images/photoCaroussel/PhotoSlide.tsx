import { View, Pressable, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Photo } from '@/types/Sneaker';
import { Image } from 'expo-image';

interface PhotoSlideProps {
  photo: Photo;
  index: number;
  width: number;
  mode: 'view' | 'edit';
  onPress?: () => void;
  onRemove?: () => void;
}

export const PhotoSlide = ({ 
  photo, 
  index, 
  width,
  mode, 
  onPress, 
  onRemove 
}: PhotoSlideProps) => {
    return (
    <View style={{ width }} onMoveShouldSetResponder={() => true}>
      <Pressable
        onPress={mode === 'edit' ? onPress : undefined}
        className="w-full h-full"
      >
        <Image
          source={{ uri: photo.uri }}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 8
          }}
          cachePolicy="memory-disk"
          contentFit="cover"
          contentPosition="center"
          accessibilityLabel={
            photo.alt || `Photo ${index + 1}`
          }
          accessible={true}
        />
      </Pressable>
      
      {mode === 'edit' && onRemove && (
        <Pressable
          onPress={() => {
            Alert.alert('Removing photo', 'Are you sure you want to remove this photo?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Remove', style: 'destructive', onPress: onRemove }
            ]);
          }}
          className="absolute top-2 left-2 bg-red-500 rounded-full w-8 h-8 items-center justify-center"
        >
          <MaterialIcons name="delete" size={18} color="white" />
        </Pressable>
      )}
    </View>
  );
}; 