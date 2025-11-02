import {View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';


export default function ProfileButton() {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('profile' as never);
  }

  return (
    <View>
      <Pressable onPress={handlePress}>
        <Ionicons name="person-circle-outline" size={28} color="#333" />
      </Pressable>
    </View>
  );
}