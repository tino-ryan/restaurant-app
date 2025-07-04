import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  Image,
  Alert,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  collection,
  query,
  where,
  getDocs,addDoc,
} from 'firebase/firestore';
import { db } from 'shared/firebaseConfig';

export default function CustomerMenuScreen({ route, navigation }) {
  const { table } = route.params || {};
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [cart, setCart] = useState([]);
  const [name, setName] = useState('');


  useEffect(() => {
    const loadMenu = async () => {
      try {
        const q = query(collection(db, 'menu'), where('active', '==', true));
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMenu(items);

        const categorySet = new Set();
        items.forEach(item => {
          if (item.category) categorySet.add(item.category);
        });
        const categoryList = Array.from(categorySet);
        setCategories(categoryList);
        if (categoryList.length > 0) setSelectedCategory(categoryList[0]);
      } catch (error) {
        console.error('Error loading menu:', error);
        Alert.alert('Failed to load menu. Please try again later.');
      }
    };
    loadMenu();
  }, []);

  const addToCart = () => {
    if (!selectedItem) {
      Alert.alert('No item selected');
      return;
    }

    if (!parseInt(quantity)) {
      Alert.alert('Please enter a valid quantity');
      return;
    }

    const existingIndex = cart.findIndex(
      (i) => i.id === selectedItem.id && i.notes === notes
    );

    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += parseInt(quantity);
      setCart(newCart);
    } else {
      setCart([
        ...cart,
        {
        id: selectedItem.id,
        name: selectedItem.name || 'Unnamed Item',
        quantity: parseInt(quantity),
        notes,
        price: selectedItem.price || 0,
        person: name.trim() || 'Anonymous',
        }

      ]);
    }
    setSelectedItem(null);
    setQuantity('1');
    setNotes('');
    setName('');

  };
    const handleCallWaiter = async () => {
    try {
        await addDoc(collection(db, 'waiter_calls'), {
        table,
        timestamp: new Date(),
        status: 'pending',
        });
        Alert.alert('Waiter requested', 'A waiter has been notified.');
    } catch (err) {
        console.error('Error calling waiter:', err);
        Alert.alert('Error', 'Failed to call waiter.');
    }
    };


  const goToConfirmation = () => {
    if (!table) {
      Alert.alert('Missing table number. Please go back and enter your table number.');
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Your cart is empty');
      return;
    }
    navigation.navigate('confirmOrder', { cart, table });
  };

  const renderCard = ({ item }) => (
    <Pressable onPress={() => setSelectedItem(item)} style={styles.card}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text>No Image</Text>
        </View>
      )}
      <Text style={styles.name}>{item.name || 'Unnamed'}</Text>
      <Text style={styles.price}>R{item.price ? item.price.toFixed(2) : '0.00'}</Text>
    </Pressable>
  );

  const filteredMenu = menu.filter(item => item.category === selectedCategory);

  return (
    <View style={styles.container}>
      <Text style={{ marginBottom: 10 }}>Table Number: {table || 'N/A'}</Text>
      <View style={styles.row}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <ScrollView>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat && styles.selectedCategory,
                ]}
              >
                <Text>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Menu Grid */}
        <View style={{ flex: 1 }}>
        <FlatList
        data={filteredMenu}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={renderCard}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingBottom: 140 }} // ensures space for bottom bar
        />

        {/* Sticky bottom action bar */}
        <View style={styles.actionBar}>
        <Button title="View Cart" color="green" onPress={goToConfirmation} />
        <Button
            title="Call Waiter"
            onPress={handleCallWaiter}
            color="green"
        />

        <Button title="Request Bill" onPress={() => navigation.navigate('Bill', { table })} color="green" />
        </View>

        </View>
      </View>

      <Modal visible={!!selectedItem} animationType="slide">
        <ScrollView style={styles.modalContainer}>
          {selectedItem && (
            <>
              {selectedItem.imageUrl ? (
                <Image
                  source={{ uri: selectedItem.imageUrl }}
                  style={styles.modalImage}
                />
              ) : (
                <View style={[styles.modalImage, { justifyContent: 'center', alignItems: 'center' }]}>
                  <Text>No Image</Text>
                </View>
              )}
              <Text style={styles.modalTitle}>{selectedItem.name || 'Unnamed Item'}</Text>
              <Text style={styles.modalPrice}>R{selectedItem.price ? selectedItem.price.toFixed(2) : '0.00'}</Text>
              <Text style={styles.modalText}>{selectedItem.description || 'No description available.'}</Text>
              {selectedItem.allergens && (
                <Text style={styles.modalText}>Allergens: {selectedItem.allergens}</Text>
              )}
              <TextInput
                style={styles.input}
                placeholder="Quantity"
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
              />
              <TextInput
                style={styles.input}
                placeholder="Notes (optional)"
                value={notes}
                onChangeText={setNotes}
              />
              <TextInput
                style={styles.input}
                placeholder="Name (optional)"
                value={name}
                onChangeText={setName}
              />

              <Button
                title="Add to Cart"
                onPress={addToCart}
              />
              <Button title="Cancel" color="red" onPress={() => setSelectedItem(null)} />
            </>
          )}
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  row: { flexDirection: 'row', flex: 1 },
  sidebar: { width: 100, padding: 10, backgroundColor: '#f0f0f0' },
  categoryButton: {
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  selectedCategory: {
    backgroundColor: '#cceeff',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    width: '48%',
    alignItems: 'center',
  },
    actionBar: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'column',
    gap: 10,
    },

  image: { width: '100%', height: 100, borderRadius: 8, marginBottom: 8, backgroundColor: '#eee' },
  name: { fontWeight: 'bold', fontSize: 16 },
  price: { color: '#555', marginBottom: 8 },
  modalContainer: { padding: 20 },
  modalImage: { width: '100%', height: 200, borderRadius: 10, backgroundColor: '#eee' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginVertical: 10 },
  modalPrice: { fontSize: 18, marginBottom: 10 },
  modalText: { marginBottom: 10 },
  input: { borderWidth: 1, padding: 8, borderRadius: 6, marginBottom: 10 },
});
