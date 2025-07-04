import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  const [table, setTable] = useState('');

  const handleStart = () => {
    if (!table.trim()) {
      Alert.alert('Please enter your table number');
      return;
    }
    navigation.navigate('Menu', { table });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome to Our Restaurant</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Table Number"
        value={table}
        onChangeText={setTable}
        keyboardType="numeric"
      />
      <Button title="View Menu" onPress={handleStart} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  heading: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
});
