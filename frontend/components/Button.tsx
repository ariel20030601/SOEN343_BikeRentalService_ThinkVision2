import { StyleSheet, View, Pressable, Text } from 'react-native';

type Props = {
  label: string;
  theme?: 'primary';
};

export default function Button({ label, theme }: Props) {
  if (theme === 'primary') {
    return (
      <View
        style={[
          styles.buttonContainer,
          { borderWidth: 0, borderRadius: 0 },
        ]}>
        <Pressable
          style={[styles.button, { backgroundColor: '#F15A29' }]}
          onPress={() => alert('You pressed a button.')}>
          <Text style={[styles.buttonLabel, { color: '#fff' }]}>{label}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.buttonContainer}>
      <Pressable style={styles.button} onPress={() => alert('You pressed a button.')}>
        <Text style={styles.buttonLabel}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: 300,
    height: 65,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  button: {
    borderRadius: 10,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonIcon: {
    paddingRight: 8,
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
});
