'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, Stack, Typography, Button, Modal, TextField, Card, CardContent, 
  IconButton, InputAdornment, Select, MenuItem, Dialog, DialogTitle, 
  DialogContent, DialogActions,
  Menu
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import { firestore } from '@/firebase';
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { auth } from '@/firebase';

import styles from './home.module.css';

const colors = ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFDFBA'];

export default function Home() {
  const router = useRouter();
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemSupplier, setItemSupplier] = useState('');
  const [sortBy, setSortBy] = useState('name'); // for sorting
  const [filterCategory, setFilterCategory] = useState('');
  const [detailItem, setDetailItem] = useState(null);

  const updateInventory = async (userId) => {
    const userInventoryRef = collection(firestore, "users", userId, "inventory");
    const snapshot = await getDocs(userInventoryRef);
    const inventoryList = [];
    const categoriesSet = new Set();
    snapshot.forEach((doc) => {
      const data = doc.data();
      inventoryList.push({ id: doc.id, ...data });
      if (data.category) categoriesSet.add(data.category);
    });
    setInventory(inventoryList);
    setCategories(Array.from(categoriesSet));
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        updateInventory(user.uid);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router, sortBy, filterCategory]);

  const increaseItemQuantity = async (itemId) => {
    try {
      if (!itemId || !user) {
        console.error('Invalid itemId or user not logged in');
        return;
      }
      const docRef = doc(collection(firestore, 'users', user.uid, 'inventory'), itemId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const quantity = (data.quantity || 0) + 1;
        const category = data.category || '';
        await setDoc(docRef, { quantity, category }, { merge: true });
        await updateInventory(user.uid);
      } else {
        console.error('Document does not exist');
      }
    } catch (error) {
      console.error('Error increasing item quantity:', error);
    }
  };
  
  const addNewItem = async () => {
    try {
      if (!itemName || (!itemCategory && !newCategory) || !user) {
        console.error('Invalid item data or user not logged in');
        return;
      }
      const category = itemCategory === 'new' ? newCategory : itemCategory;
      const docRef = doc(collection(firestore, 'users', user.uid, 'inventory'), itemName);
      await setDoc(docRef, { 
        quantity: 1, 
        category,
        price: parseFloat(itemPrice) || 0,
        description: itemDescription || '',
        supplier: itemSupplier || ''
      });
      setItemName('');
      setItemCategory('');
      setNewCategory('');
      setItemPrice('');
      setItemDescription('');
      setItemSupplier('');
      setOpen(false);
      await updateInventory(user.uid);
    } catch (error) {
      console.error('Error adding new item:', error);
    }
  };

  const removeItem = async (item) => {
    if (!user) {
      console.error('User not logged in');
      return;
    }
    const docRef = doc(collection(firestore, 'users', user.uid, 'inventory'), item.id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { ...docSnap.data(), quantity: quantity - 1 });
      }
    }
    await updateInventory(user.uid);
  };

  const deleteItem = async (item) => {
    if (!user) {
      console.error('User not logged in');
      return;
    }
    const docRef = doc(collection(firestore, 'users', user.uid, 'inventory'), item.id);
    await deleteDoc(docRef);
    await updateInventory(user.uid);
  };

  const handleEditSave = async () => {
    if (editItem && user) {
      const docRef = doc(collection(firestore, 'users', user.uid, 'inventory'), editItem.id);
      await setDoc(docRef, {
        quantity: parseInt(editItem.quantity),
        category: editItem.category,
        price: parseFloat(editItem.price) || 0,
        description: editItem.description || '',
        supplier: editItem.supplier || ''
      });
      handleEditClose();
      await updateInventory(user.uid);
    }
  };
  const handleEditOpen = (item) => {
    setEditItem(item);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditItem(null);
    setEditOpen(false);
  };
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleOpenDetail = (item) => {
    setDetailItem(item);
  };
  
  const handleCloseDetail = () => {
    setDetailItem(null);
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedAndFilteredInventory = filteredInventory
  .filter(item => filterCategory ? item.category === filterCategory : true)
  .sort((a, b) => {
    if (sortBy === 'name') return a.id.localeCompare(b.id);
    if (sortBy === 'category') return a.category.localeCompare(b.category);
    if (sortBy === 'price') return a.price - b.price;
    return 0;
  });

  return (
    <Box sx={{ 
      backgroundColor: '#f5f5f5', 
      minHeight: '100vh',
      width: '100%',
      padding: 0, // Remove all padding from the main container
    }}>
      {/* Header Section */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        width: '100%', // Ensure full width
        mb: 4,
        pb: 2,
        borderBottom: '2px solid #e0e0e0',
        minHeight: '80px',
        backgroundColor: 'white', // Optional: add a background color to distinguish the header
      }}>
        {/* Welcome message and sign out button */}
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          right: 0,
          display: 'flex', 
          alignItems: 'center', 
          gap: '15px',
          padding: '10px 20px', // Add some right padding
        }}>
          {user && (
            <Typography variant="h6" sx={{ 
              color: '#34495e',
            }}>
              Welcome, {user.displayName || 'User'}
            </Typography>
          )}
          <Button 
            variant="contained" 
            onClick={handleSignOut} 
            sx={{ 
              backgroundColor: '#3498db', 
              '&:hover': { 
                backgroundColor: '#2980b9' 
              },
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              textTransform: 'none',
              height: '40px'
            }}
          >
            Sign Out
          </Button>
        </Box>
  
        {/* Inventory Management Title */}
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 'bold',
            color: '#2c3e50',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            mt: 5, // Add top margin to push it down a bit
            mb: 2, // Add some bottom margin
          }}
        >
          Inventory Management
        </Typography>
      </Box>
  
      {/* Content Container */}
    <Box sx={{ padding: '0 20px' }}>
      {/* Search, Add New Item, and Filtering options */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        mb: 4,
        width: '100%',
        flexWrap: 'wrap', // Allow wrapping on smaller screens
      }}>
        {/* Search bar */}
        <TextField
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            width: '300px',
            backgroundColor: 'white',
            borderRadius: 1,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#bdc3c7',
              },
              '&:hover fieldset': {
                borderColor: '#3498db',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#3498db',
              },
            },
          }}
        />

        {/* Add New Item button */}
        <Button 
          variant="contained" 
          onClick={handleOpen} 
          startIcon={<AddIcon />}
          sx={{ 
            backgroundColor: '#2ecc71', 
            '&:hover': { 
              backgroundColor: '#27ae60' 
            },
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            textTransform: 'none',
            height: '56px', // Match height with TextField
          }}
        >
          Add New Item
        </Button>

        {/* Sorting and Filtering options */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FilterListIcon sx={{ color: '#7f8c8d' }} />
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{ 
              width: 150, 
              backgroundColor: 'white',
              height: '56px', // Match height with TextField
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#bdc3c7',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3498db',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3498db',
              },
            }}
          >
            <MenuItem value="name">Sort by Name</MenuItem>
            <MenuItem value="category">Sort by Category</MenuItem>
            <MenuItem value="price">Sort by Price</MenuItem>
            <MenuItem value="quantity">Sort by Quantity</MenuItem>
          </Select>
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            sx={{ 
              width: 150, 
              backgroundColor: 'white',
              height: '56px', // Match height with TextField
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#bdc3c7',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3498db',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3498db',
              },
            }}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </Select>
        </Box>
      </Box>
      

      {/* Inventory Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
  {sortedAndFilteredInventory.map((item, index) => (
    <Card 
      key={item.id} 
      sx={{ 
        width: 250, 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: colors[index % colors.length],
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 3,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" sx={{ mb: 1, color: '#333333' }}>
          {item.id.charAt(0).toUpperCase() + item.id.slice(1)}
        </Typography>
        <Typography color="text.secondary">
          Price: ${item.price}
        </Typography>
        <Typography color="text.secondary">
          Category: {item.category}
        </Typography>
        <Typography color="text.secondary">
          Quantity: {item.quantity}
        </Typography>
      </CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: alpha('#ffffff', 0.3) }}>
        <IconButton onClick={() => removeItem(item)} sx={{ color: '#d32f2f' }}>
          <RemoveIcon />
        </IconButton>
        <IconButton onClick={() => handleEditOpen(item)} sx={{ color: '#1976d2' }}>
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => deleteItem(item)} sx={{ color: '#d32f2f' }}>
          <DeleteIcon />
        </IconButton>
        <IconButton onClick={() => increaseItemQuantity(item.id)} sx={{ color: '#388e3c' }}>
          <AddIcon />
        </IconButton>
        <IconButton onClick={() => handleOpenDetail(item)} sx={{ color: '#000000' }}>
          <VisibilityIcon />
        </IconButton>
      </Box>
    </Card>
  ))}
</Box>
{/*Display Modal*/}
<Modal
  open={Boolean(detailItem)}
  onClose={handleCloseDetail}
  aria-labelledby="detail-modal-title"
  aria-describedby="detail-modal-description"
>
  <Box sx={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor:'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    color: 'text.primary'
  }}>
    {detailItem && (
      <>
        <Typography id="detail-modal-title" variant="h6" component="h2">
          {detailItem.id}
        </Typography>
        <Typography id="detail-modal-description" sx={{ mt: 2 }}>
          Price: ${detailItem.price}<br />
          Category: {detailItem.category}<br />
          Quantity: {detailItem.quantity}<br />
          Description: {detailItem.description}<br />
          Supplier: {detailItem.supplier}
        </Typography>
      </>
    )}
  </Box>
</Modal>

      {/* Add New Item Modal */}
      <Modal open={open} onClose={handleClose}>
  <Box className={styles.modalStyle}>
    <Typography variant="h6" component="h2">Add New Item</Typography>
    <TextField
      label="Item Name"
      value={itemName}
      onChange={(e) => setItemName(e.target.value)}
      fullWidth
      margin="normal"
    />
    <Select
      value={itemCategory}
      onChange={(e) => setItemCategory(e.target.value)}
      fullWidth
      margin="normal"
    >
      {categories.map((category) => (
        <MenuItem key={category} value={category}>{category}</MenuItem>
      ))}
      <MenuItem value="new"><em>Add New Category</em></MenuItem>
    </Select>
    {itemCategory === 'new' && (
      <TextField
        label="New Category"
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        fullWidth
        margin="normal"
      />
    )}
    <TextField
      label="Price"
      type="number"
      value={itemPrice}
      onChange={(e) => setItemPrice(e.target.value)}
      fullWidth
      margin="normal"
    />
    <TextField
      label="Description"
      value={itemDescription}
      onChange={(e) => setItemDescription(e.target.value)}
      fullWidth
      margin="normal"
    />
    <TextField
      label="Supplier"
      value={itemSupplier}
      onChange={(e) => setItemSupplier(e.target.value)}
      fullWidth
      margin="normal"
    />
    <Button variant="contained" onClick={addNewItem} fullWidth>Add</Button>
  </Box>
</Modal>

      {/* Edit Item Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose}>
  <DialogTitle>Edit Item</DialogTitle>
  <DialogContent>
    <TextField
      label="Item Name"
      value={editItem?.id || ''}
      disabled
      fullWidth
      margin="normal"
    />
    <TextField
      label="Quantity"
      type="number"
      value={editItem?.quantity || ''}
      onChange={(e) => setEditItem({...editItem, quantity: e.target.value})}
      fullWidth
      margin="normal"
    />
    <Select
      value={editItem?.category || ''}
      onChange={(e) => setEditItem({...editItem, category: e.target.value})}
      fullWidth
      margin="normal"
    >
      {categories.map((category) => (
        <MenuItem key={category} value={category}>{category}</MenuItem>
      ))}
      <MenuItem value="new"><em>Add New Category</em></MenuItem>
    </Select>
    {editItem?.category === 'new' && (
      <TextField
        label="New Category"
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        fullWidth
        margin="normal"
      />
    )}
    <TextField
      label="Price"
      type="number"
      value={editItem?.price || ''}
      onChange={(e) => setEditItem({...editItem, price: e.target.value})}
      fullWidth
      margin="normal"
    />
    <TextField
      label="Description"
      value={editItem?.description || ''}
      onChange={(e) => setEditItem({...editItem, description: e.target.value})}
      fullWidth
      margin="normal"
    />
    <TextField
      label="Supplier"
      value={editItem?.supplier || ''}
      onChange={(e) => setEditItem({...editItem, supplier: e.target.value})}
      fullWidth
      margin="normal"
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={handleEditClose}>Cancel</Button>
    <Button onClick={handleEditSave}>Save</Button>
  </DialogActions>
</Dialog>
    </Box>
    </Box>
  );
}