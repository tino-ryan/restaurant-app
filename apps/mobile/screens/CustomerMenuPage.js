import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Image,
  Alert,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../themeContext';
import { Ionicons } from '@expo/vector-icons';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from 'firebase/firestore';
import { db } from 'shared/firebaseConfig';

export default function CustomerMenuScreen({ route, navigation }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

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

        const categorySet = new Set(items.map(item => item.category));
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
    if (!selectedItem || !parseInt(quantity)) {
      Alert.alert('Please select a valid item and quantity.');
      return;
    }

    const existingIndex = cart.findIndex(
      i => i.id === selectedItem.id && i.notes === notes
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
        },
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
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text>No Image</Text>
        </View>
      )}
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>R{item.price?.toFixed(2) || '0.00'}</Text>
    </Pressable>
  );

  const filteredMenu = menu.filter(item => item.category === selectedCategory);

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Table {table}</Text>
      </SafeAreaView>

      {/* Content filling rest of screen */}
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 100, // space for action bar
            // paddingTop: 0, // optional to tweak if needed
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Tabs inside a View with no fixed height */}
          <View style={[styles.tabBar]}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[styles.tab, selectedCategory === cat && styles.tabSelected]}
              >
                <Text style={[styles.tabText, selectedCategory === cat && styles.tabTextSelected]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cards container */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              marginTop: 8,

            }}
          >
            {filteredMenu.map(item => (
              <Pressable key={item.id} onPress={() => setSelectedItem(item)} style={styles.card}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.image} />
                ) : (
                  <View style={[styles.image, styles.imagePlaceholder]}>
                    <Text>No Image</Text>
                  </View>
                )}
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>R{item.price?.toFixed(2) || '0.00'}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton} onPress={goToConfirmation}>
          <Text style={styles.actionButtonText}>View Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleCallWaiter}>
          <Text style={styles.actionButtonText}>Call Waiter</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Bill', { table })}
        >
          <Text style={styles.actionButtonText}>Request Bill</Text>
        </TouchableOpacity>
      </View>

      {/* Modal stays unchanged */}
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
                <View style={[styles.modalImage, styles.imagePlaceholder]}>
                  <Text>No Image</Text>
                </View>
              )}

              <Text style={styles.modalTitle}>
                {selectedItem.name || 'Unnamed Item'}
              </Text>
              <Text style={styles.modalPrice}>
                R{selectedItem.price ? selectedItem.price.toFixed(2) : '0.00'}
              </Text>
              <Text style={styles.modalText}>
                {selectedItem.description || 'No description available.'}
              </Text>
              {selectedItem.allergens && (
                <Text style={styles.modalText}>
                  Allergens: {selectedItem.allergens}
                </Text>
              )}

              <TextInput
                style={styles.input}
                placeholder="Quantity"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
              />
              <TextInput
                style={styles.input}
                placeholder="Notes (optional)"
                placeholderTextColor="#999"
                value={notes}
                onChangeText={setNotes}
              />
              <TextInput
                style={styles.input}
                placeholder="Name (optional)"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
              />

              <TouchableOpacity style={styles.actionButton} onPress={addToCart}>
                <Text style={styles.actionButtonText}>Add to Cart</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#999' }]}
                onPress={() => setSelectedItem(null)}
              >
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </Modal>

    </View>
  );

}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.background,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
    color: theme.text,
  },
  tabBar: {
    backgroundColor: 'theme.background',
    paddingHorizontal: 16,
    paddingVertical: 6,
    // height: 40,  // remove fixed height to allow natural size
    flexDirection: 'row',
    alignItems: 'center',
  },

  tab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#f2f2f2',
    alignSelf: 'flex-start',
    marginRight: 8,
  },
  tabSelected: {
    backgroundColor: theme.primary,
  },
  tabText: {
    color: '#333',
    fontSize: 14,
  },
  tabTextSelected: {
    color: '#fff',
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    width: '48%',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: theme.text,
    fontFamily: theme.font,
  },
  price: {
    color: theme.text,
    marginBottom: 8,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.background,
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  actionButton: {
    backgroundColor: theme.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    padding: 20,
    backgroundColor: theme.background,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
    color: theme.text,
    fontFamily: theme.font,
  },
  modalPrice: {
    fontSize: 18,
    marginBottom: 10,
    color: theme.text,
  },
  modalText: {
    marginBottom: 10,
    color: theme.text,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    color: theme.text,
  },
});
