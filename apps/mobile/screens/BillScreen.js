import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { collection, query, where, getDocs,updateDoc, addDoc, doc } from 'firebase/firestore';

import { db } from 'shared/firebaseConfig';

export default function BillScreen({ route, navigation }) {
  const { table } = route.params || {};
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState('All');
  const [tip, setTip] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'order'),
          where('table', '==', table),
          where('status', '==', 'pending') // Only include unpaid orders
        );

        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => doc.data());
        setOrders(results);
      } catch (err) {
        console.error(err);
        Alert.alert('Error loading bill');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const allNames = [
    ...new Set(
      orders.flatMap(order =>
        order.items?.map(i => i.person || 'Anonymous') || []
      )
    ),
  ];
  const markOrdersCompleted = async () => {
    const q = query(collection(db, 'order'), where('table', '==', table), where('status', '==', 'pending'));
    const snapshot = await getDocs(q);
    const updates = snapshot.docs.map(docSnap =>
      updateDoc(doc(db, 'order', docSnap.id), { status: 'completed' })
    );
    await Promise.all(updates);
  };

  const filteredOrders = selectedPerson === 'All'
    ? orders
    : orders.map(order => ({
        ...order,
        items: order.items?.filter(i => (i.person || 'Anonymous') === selectedPerson),
      })).filter(order => order.items?.length);

  const total = filteredOrders.reduce((sum, order) =>
    sum + (order.items?.reduce((s, i) => s + (i.quantity * (i.price || 0)), 0) || 0), 0
  );

  const endSession = async () => {
    try {
      const tipAmount = parseFloat(tip || '0');

      // Submit review
      await addDoc(collection(db, 'reviews'), {
        table,
        rating,
        reviewNote: rating < 3 ? reviewNote : '',
        tip: tipAmount,
        timestamp: new Date(),
      });

      // Log billing completion
      await addDoc(collection(db, 'billing_complete'), {
        table,
        totalPaid: total + tipAmount,
        settledAt: new Date(),
      });
      await markOrdersCompleted();
      Alert.alert('Thank you!', 'Session ended.', [
        {
          text: 'OK',
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            }),
        },
      ]);
    } catch (err) {
      console.error('Error during session end:', err);
      Alert.alert('Error', 'Something went wrong while ending the session.');
    }
  };


  const splitEqually = () => {
    const perPerson = total / allNames.length;
    Alert.alert('Equal Split', `Each person pays: R${perPerson.toFixed(2)}`);
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Bill for Table {table}</Text>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontWeight: 'bold' }}>View Bill For:</Text>
        <ScrollView horizontal style={{ flexDirection: 'row', marginTop: 5 }}>
          <Button title="All" onPress={() => setSelectedPerson('All')} />
          {allNames.map((p, i) => (
            <Button
              key={i}
              title={p}
              onPress={() => setSelectedPerson(p)}
            />
          ))}
        </ScrollView>
      </View>

      {filteredOrders.map((order, i) => (
        <View key={i} style={styles.orderBlock}>
          {order.items?.map((item, j) => (
            <Text key={j}>
              {item.quantity} × {item.name} - R{(item.price || 0).toFixed(2)}{' '}
              ({item.person || 'Anonymous'})
            </Text>
          ))}
        </View>
      ))}

      <Text style={styles.total}>Total: R{total.toFixed(2)}</Text>

      {selectedPerson === 'All' && (
        <Button title="Split Bill Equally" onPress={splitEqually} />
      )}

      <View style={{ marginVertical: 20 }}>
        <Text style={{ fontWeight: 'bold' }}>Tip (optional):</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Enter tip amount"
          value={tip}
          onChangeText={setTip}
        />
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontWeight: 'bold' }}>Rate Your Experience (1-5):</Text>
        <ScrollView horizontal style={{ flexDirection: 'row', marginTop: 5 }}>
          {[1, 2, 3, 4, 5].map(num => (
            <Button
              key={num}
              title={num.toString()}
              color={rating === num ? 'orange' : 'gray'}
              onPress={() => setRating(num)}
            />
          ))}
        </ScrollView>
      </View>

      {rating < 3 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontWeight: 'bold' }}>Tell us what went wrong:</Text>
          <TextInput
            style={styles.input}
            placeholder="Write a short review"
            multiline
            numberOfLines={4}
            value={reviewNote}
            onChangeText={setReviewNote}
          />
        </View>
      )}

      <View style={{ marginBottom: 30 }}>
        <Button title="Settle Bill & End Session" onPress={endSession} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  orderBlock: { marginBottom: 10 },
  total: { fontSize: 18, fontWeight: 'bold', marginVertical: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginTop: 5,
  },
});
