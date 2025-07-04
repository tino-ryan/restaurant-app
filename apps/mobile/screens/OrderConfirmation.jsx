import React, { useState } from 'react';
import { View, Text, Button, FlatList, Alert, StyleSheet } from 'react-native';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from 'shared/firebaseConfig';

export default function OrderConfirmation({ route, navigation }) {
  const { cart, table } = route.params;
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmitOrder = async () => {
    const order = {
      table,
      items: cart,
      status: 'pending',
      createdAt: Timestamp.now(),
    };

    try {
      setLoading(true);
      await addDoc(collection(db, 'order'), order);
      Alert.alert('Order submitted!');
      setLoading(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Menu', params: { table } }],
      });

    } catch (err) {
      console.error(err);
      Alert.alert('Error submitting order');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm Your Order</Text>
      <Text>Table Number: {table}</Text>

      <FlatList
        data={cart}
        keyExtractor={(item, index) => item.id + index}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.name} x{item.quantity}</Text>
            {item.notes ? <Text style={styles.notes}>Notes: {item.notes}</Text> : null}
            <Text style={styles.price}>R{(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        )}
      />

      <Text style={styles.total}>Total: R{total.toFixed(2)}</Text>

      <Button title={loading ? 'Submitting...' : 'Confirm Order'} onPress={handleSubmitOrder} disabled={loading} />
      <Button title="Edit Order" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  item: { marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#ccc', paddingBottom: 10 },
  name: { fontWeight: 'bold' },
  notes: { fontStyle: 'italic', color: '#555' },
  price: { color: '#555', marginTop: 5 },
  total: { fontSize: 18, fontWeight: 'bold', marginVertical: 20 },
});
