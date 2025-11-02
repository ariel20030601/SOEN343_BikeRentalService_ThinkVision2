import {View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';


export default function SearchButton() {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('search' as never);
  }

  return (
    <View>
      <Pressable onPress={handlePress}>
        <Ionicons name="search" size={30} color="#333" />
      </Pressable>
    </View>
  );
}