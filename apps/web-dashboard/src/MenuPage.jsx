import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTheme } from './themeContext'; 

import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from 'shared';

const CLOUD_NAME = 'dfkg0topw';
const UPLOAD_PRESET = 'menu-upload';

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [showArchived, setShowArchived] = useState(false); 
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    allergens: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const { theme } = useTheme(); // 👈 Theme access
  const styles = getStyles(theme);



  const menuRef = collection(db, 'menu');

  const fetchMenuItems = async () => {
    const q = showArchived ? query(menuRef) : query(menuRef, where('active', '==', true));
    const snapshot = await getDocs(q);
    setMenuItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchMenuItems();
  }, [showArchived]);

  const restoreItem = async (id) => {
    try {
      await updateDoc(doc(db, 'menu', id), { active: true });
      fetchMenuItems();
    } catch (err) {
      console.error('Error restoring item:', err);
      alert('Failed to restore item.');
    }
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const res = await axios.post(url, formData);
    return res.data.secure_url;
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const imageUrl = imageFile ? await uploadImageToCloudinary(imageFile) : '';
      await addDoc(menuRef, {
        ...newItem,
        price: parseFloat(newItem.price),
        imageUrl,
        active: true,
        createdAt: new Date(),
      });
      setNewItem({
        name: '',
        price: '',
        category: '',
        description: '',
        allergens: ''
      });
      setImageFile(null);
      fetchMenuItems();
    } catch (err) {
      console.error('Error adding item:', err);
      alert('Failed to add menu item.');
    } finally {
      setUploading(false);
    }
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditingData({
      name: item.name,
      price: item.price,
      category: item.category,
      description: item.description || '',
      allergens: item.allergens || ''
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingData({});
  };

  const saveEditing = async (id) => {
    try {
      const itemDoc = doc(db, 'menu', id);
      await updateDoc(itemDoc, {
        ...editingData,
        price: parseFloat(editingData.price),
      });
      setEditingId(null);
      setEditingData({});
      fetchMenuItems();
    } catch (err) {
      console.error('Error updating item:', err);
      alert('Failed to update item.');
    }
  };

  const archiveItem = async (id) => {
    if (!confirm('Are you sure you want to archive this item?')) return;
    try {
      await updateDoc(doc(db, 'menu', id), { active: false });
      fetchMenuItems();
    } catch (err) {
      console.error('Error archiving item:', err);
      alert('Failed to archive item.');
    }
  };

  return (
    <div style={styles.container}>
      <h2>📋 Menu Manager</h2>

      <label style={{ display: 'block', marginBottom: 12 }}>
        <input 
          type="checkbox" 
          checked={showArchived} 
          onChange={() => setShowArchived(!showArchived)} 
        />{' '}
        Show Archived Items
      </label>

      <form onSubmit={handleAddItem} style={styles.form}>
        <input
          placeholder="Item name"
          value={newItem.name}
          onChange={e => setNewItem({ ...newItem, name: e.target.value })}
          required
          style={styles.input}
        />
        <input
          placeholder="Price"
          type="number"
          value={newItem.price}
          onChange={e => setNewItem({ ...newItem, price: e.target.value })}
          required
          style={styles.input}
        />
        <input
          placeholder="Category"
          value={newItem.category}
          onChange={e => setNewItem({ ...newItem, category: e.target.value })}
          required
          style={styles.input}
        />
        <textarea
          placeholder="Description (optional)"
          value={newItem.description}
          onChange={e => setNewItem({ ...newItem, description: e.target.value })}
          style={{ padding: 8, fontSize: 16, minHeight: 60 }}
        />
        <input
          placeholder="Allergens (comma separated)"
          value={newItem.allergens}
          onChange={e => setNewItem({ ...newItem, allergens: e.target.value })}
          style={styles.input}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={styles.input}
        />
        <button type="submit" disabled={uploading} style={styles.button}>
          {uploading ? 'Uploading…' : 'Add Item'}
        </button>
      </form>

      <hr />

      <ul style={styles.list}>
        {menuItems.map(item => (
          <li key={item.id} style={styles.listItem}>
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.name} style={styles.thumb} />
            )}
            {editingId === item.id ? (
              <div style={{ flexGrow: 1 }}>
                <input
                  style={styles.input}
                  value={editingData.name}
                  onChange={e => setEditingData({ ...editingData, name: e.target.value })}
                />
                <input
                  type="number"
                  style={styles.input}
                  value={editingData.price}
                  onChange={e => setEditingData({ ...editingData, price: e.target.value })}
                />
                <input
                  style={styles.input}
                  value={editingData.category}
                  onChange={e => setEditingData({ ...editingData, category: e.target.value })}
                />
                <textarea
                  style={{ padding: 8, fontSize: 16, minHeight: 60 }}
                  value={editingData.description}
                  onChange={e => setEditingData({ ...editingData, description: e.target.value })}
                />
                <input
                  style={styles.input}
                  value={editingData.allergens}
                  onChange={e => setEditingData({ ...editingData, allergens: e.target.value })}
                />
                <button onClick={() => saveEditing(item.id)} style={styles.buttonSmall}>Save</button>
                <button onClick={cancelEditing} style={styles.buttonSmallCancel}>Cancel</button>
              </div>
            ) : (
              <div style={{ flexGrow: 1 }}>
                <strong>{item.name}</strong> — R{item.price.toFixed(2)}{' '}
                <em style={styles.category}>({item.category})</em>
                {item.description && <p style={{ margin: '4px 0' }}>{item.description}</p>}
                {item.allergens && <p style={{ fontStyle: 'italic', color: 'red', margin: '4px 0' }}>Allergens: {item.allergens}</p>}
                <div>
                  {item.active ? (
                    <>
                      <button onClick={() => startEditing(item)} style={styles.buttonSmall}>Edit</button>
                      <button onClick={() => archiveItem(item.id)} style={styles.buttonSmallCancel}>Archive</button>
                    </>
                  ) : (
                    <button onClick={() => restoreItem(item.id)} style={styles.buttonSmallRestore}>Restore</button>
                  )}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

const getStyles = (theme) => ({
  container: {
    maxWidth: 600,
    margin: '2rem auto',
    fontFamily: 'Arial, sans-serif',
    color: theme.text,
    backgroundColor: theme.background,
    padding: 20,
    borderRadius: 8,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  input: {
    padding: 8,
    fontSize: 16,
    marginBottom: 6,
    borderRadius: 4,
    border: `1px solid ${theme.primary}`,
    backgroundColor: theme.input || '#fff',
    color: theme.text,
  },
  button: {
    padding: 10,
    fontSize: 16,
    backgroundColor: theme.primary,
    color: theme.buttonText || '#fff',
    border: 'none',
    borderRadius: 5,
    marginTop: 10,
    cursor: 'pointer',
  },
  list: { marginTop: 20, listStyle: 'none', padding: 0 },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    backgroundColor: theme.card || '#f5f5f5',
    borderRadius: 6,
    padding: 10,
  },
  thumb: { width: 60, height: 60, objectFit: 'cover', borderRadius: 4 },
  category: { marginLeft: 6, fontStyle: 'normal', color: theme.muted || '#666' },
  buttonSmall: {
    padding: '6px 10px',
    fontSize: 14,
    margin: '4px 8px 0 0',
    backgroundColor: theme.primary,
    color: theme.buttonText || '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
  buttonSmallCancel: {
    padding: '6px 10px',
    fontSize: 14,
    marginTop: 4,
    backgroundColor: '#999',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
  buttonSmallRestore: {
    padding: '6px 10px',
    fontSize: 14,
    marginTop: 4,
    backgroundColor: '#228B22',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
});
