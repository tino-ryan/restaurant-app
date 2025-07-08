import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Alert,
  Pressable,
  StyleSheet,
} from 'react-native';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from 'shared/firebaseConfig';
import { useTheme } from '../themeContext'; // <-- use your context

export default function OrderConfirmation({ route, navigation }) {
  const { cart, table } = route.params;
  const [loading, setLoading] = useState(false);

  const { theme } = useTheme(); // 👈 get theme
  const styles = createStyles(theme); // 👈 dynamic styles

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
      <Text style={styles.subtitle}>Table Number: {table}</Text>

      <FlatList
        data={cart}
        keyExtractor={(item, index) => item.id + index}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
            </View>
            {item.notes ? <Text style={styles.notes}>Notes: {item.notes}</Text> : null}
            <Text style={styles.itemPrice}>R{(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        )}
      />

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalAmount}>R{total.toFixed(2)}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmitOrder}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Submitting...' : 'Confirm Order'}</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.editButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Edit Order</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.background,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
      color: theme.text,
    },
    subtitle: {
      fontSize: 16,
      color: theme.subtleText || '#999',
      marginBottom: 20,
    },
    listContainer: {
      paddingBottom: 20,
    },
    itemCard: {
      backgroundColor: theme.card,
      borderRadius: 10,
      padding: 12,
      marginBottom: 12,
      borderColor: '#ddd',
      borderWidth: 1,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    itemName: {
      fontWeight: 'bold',
      fontSize: 16,
      color: theme.text,
    },
    itemQuantity: {
      fontSize: 16,
      color: theme.text,
    },
    notes: {
      marginTop: 4,
      fontStyle: 'italic',
      color: theme.mutedText || '#777',
    },
    itemPrice: {
      marginTop: 8,
      fontWeight: 'bold',
      color: theme.text,
      fontSize: 15,
    },
    totalContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 24,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderColor: '#ccc',
    },
    totalLabel: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    totalAmount: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    buttonContainer: {
      gap: 10,
    },
    button: {
      backgroundColor: theme.primary,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    editButton: {
      backgroundColor: '#888', // or theme.secondary
    },
    buttonDisabled: {
      opacity: 0.6,
    },
  });
