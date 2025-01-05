import MainButton from '@/components/buttons/MainButton';
import { ScrollView, Text, View, Modal } from 'react-native';
import { Image } from 'expo-image';
import { useSession } from '@/context/authContext';
import PageTitle from '@/components/text/PageTitle';
import Title from '@/components/text/Title';
import SneakerCard from '@/components/cards/SneakerCard';
import AddButton from '@/components/buttons/AddButton';
import { Pressable } from 'react-native';
import { useState, useMemo, useEffect } from 'react';
import { renderModalContent } from '@/components/modals/AddSneakersForm';
import BrandTitle from '@/components/text/BrandTitle';
import { Sneaker } from '@/types/Models';

const brandLogos: Record<string, any> = {
  nike: require('@/assets/images/brands/nike.png'),
  adidas: require('@/assets/images/brands/adidas.png'),
  jordan: require('@/assets/images/brands/jordan.png'),
  newbalance: require('@/assets/images/brands/newbalance.png'),
  asics: require('@/assets/images/brands/asics.png'),
  puma: require('@/assets/images/brands/puma.png'),
  reebok: require('@/assets/images/brands/reebok.png'),
  converse: require('@/assets/images/brands/converse.png'),
  vans: require('@/assets/images/brands/vans.png'),
};

export default function User() {
  const { logout, user, userSneakers } = useSession();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalStep, setModalStep] = useState<'index' | 'box' | 'noBox' | 'sneakerInfo'>('index');
  const [sneaker, setSneaker] = useState<Sneaker | null>(null);
  const [currentSneaker, setCurrentSneaker] = useState<Sneaker | null>(null);

  useEffect(() => {
    setCurrentSneaker(sneaker);
  }, [sneaker]);

  const sneakersByBrand = useMemo(() => {
    if (!userSneakers) return {};
    return userSneakers.reduce((acc, sneaker) => {
      if (!acc[sneaker.brand]) {
        acc[sneaker.brand] = [];
      }
      acc[sneaker.brand].push(sneaker);
      return acc;
    }, {} as Record<string, typeof userSneakers>);
  }, [userSneakers]);

  return (
    <>
      <ScrollView className="flex-1">
        <View className="flex-1 gap-12">
          <PageTitle content="Profile" />
          <View className="flex-1 gap-12">
            <View className="flex-col gap-4">
              <Title content={user?.username || ''} />

              <View className="flex-row justify-between w-full px-4 gap-4 items-center">
                
                {user?.profile_picture_url ? (
                  <View className='w-24 h-24 rounded-full'>
                    <Image source={{ uri: user?.profile_picture_url }} 
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 100
                      }}
                      contentFit="cover"
                      contentPosition="center" 
                      cachePolicy="memory-disk"/>
                  </View>
                ) : (
                  <View className='w-24 h-24 bg-primary rounded-full items-center justify-center'>
                    <Text className='text-white font-actonia text-6xl text-center'>{user?.username.charAt(0)}</Text>
                  </View>
                )}

                <View className="flex-row w-full gap-10">
                  <View>
                    <Text className="font-spacemono-bold text-lg text-center">{userSneakers?.length || '0'}</Text>
                    <Text className="font-spacemono text-base text-center">sneakers</Text>
                  </View>

                  <View>
                    <Text className="font-spacemono-bold text-lg text-center">0</Text>
                    <Text className="font-spacemono text-base text-center">friends</Text>
                  </View>

                  <View>
                    <Text className="font-spacemono-bold text-lg text-center">$0</Text>
                    <Text className="font-spacemono text-base text-center">value</Text>
                  </View>
                </View>
              </View>
            </View>

              {userSneakers && userSneakers.length === 0 || !userSneakers ? (
                <View className="flex-1 gap-8 items-center">
                  <Title content='Add Sneakers' isTextCenter={true} />
                  <MainButton content='Add' backgroundColor='bg-primary' onPressAction={() => {
                    setModalStep('index');
                    setModalVisible(true);
                  }} />
                </View>
              ) : (
                <View className="flex-1 gap-4">
                  {Object.entries(sneakersByBrand).map(([brand, sneakers]) => (
                    <View key={brand} className="flex-1">
                      <BrandTitle
                        content={brand} 
                        brandLogo={
                          brand === 'New Balance' ? 
                            require('@/assets/images/brands/newbalance.png') : 
                            brandLogos[brand.toLowerCase()]
                        } 
                      />
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                      >
                        {sneakers.map((sneaker) => (
                          <View key={sneaker.id} className="w-96 p-4">
                            <SneakerCard
                              setModalVisible={(isVisible) => setModalVisible(isVisible)}
                              sneaker={sneaker}
                              setSneaker={(s) => setSneaker(s)}
                              setModalStep={(step) => setModalStep(step)}
                            />
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  ))}
                </View>
              )}

              <View className="flex-1 w-full items-center">
                <MainButton content='Logout' backgroundColor='bg-gray-400' onPressAction={() => {
                  setTimeout(() => {
                    logout();
                  }, 300);
                }} />
              </View>
          </View>
        </View>

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
                      {renderModalContent({ 
                          modalStep,
                          sneaker: currentSneaker,
                          setSneaker: setCurrentSneaker,
                          setModalStep,
                          closeModal: () => setModalVisible(false) 
                      })}
                  </Pressable>
              </View>
            </Pressable>
          </Modal>
      </ScrollView>

      <AddButton onPress={() => {
        setModalStep('index');
        setModalVisible(true);
      }}/>
    </>
  );
}
