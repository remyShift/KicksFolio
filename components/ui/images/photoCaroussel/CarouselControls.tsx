import { View, Text, Pressable } from 'react-native';
import { Photo } from '@/types/Sneaker';

interface CarouselControlsProps {
  photos: Photo[];
  currentIndex: number;
  maxImages: number;
  mode: 'view' | 'edit';
  onAddPhoto?: () => void;
}

export const CarouselControls = ({ 
  photos, 
  currentIndex, 
  maxImages, 
  mode, 
  onAddPhoto 
}: CarouselControlsProps) => {
  if (mode !== 'edit') return null;

  return (
    <>
      {photos.length > 0 && (
        <View className="absolute top-2 right-2 bg-black/50 rounded-full px-2 py-1">
          <Text className="text-white text-xs font-spacemono">
            {Math.min(currentIndex + 1, photos.length)}/{photos.length}
          </Text>
        </View>
      )}

      <View className="flex-row items-center justify-between mt-2 px-1">
        <Text className="text-xs text-gray-600 font-spacemono">
          {photos.length}/{maxImages} photos
        </Text>
        {photos.length < maxImages && photos.length > 0 && onAddPhoto && (
          <Pressable
            onPress={onAddPhoto}
            className="bg-primary px-3 py-1 rounded-full"
          >
            <Text className="text-white text-xs font-spacemono">Add Photo</Text>
          </Pressable>
        )}
      </View>
    </>
  );
}; 