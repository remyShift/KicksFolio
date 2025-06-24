import { View } from 'react-native';
import { Photo } from '@/types/Sneaker';
import { PhotoCarousel } from '@/components/ui/images/photoCaroussel/PhotoCarousel';
import ErrorMsg from '@/components/ui/text/ErrorMsg';

interface ImageUploaderProps {
    images: Photo[];
    setImages: (images: Photo[]) => void;
    isFocused: boolean;
    sneakerId?: string;
}

export const ImageUploader = ({ 
    images, 
    setImages, 
    isFocused,
    sneakerId,
}: ImageUploaderProps) => {
    const MAX_IMAGES = 3;

    return (
        <View className="gap-0 w-full mb-2">
            <PhotoCarousel
                photos={images}
                height={190}
                mode="edit"
                onPhotosChange={setImages}
                maxImages={MAX_IMAGES}
                sneakerId={sneakerId}
            />
        </View>
    );
}; 