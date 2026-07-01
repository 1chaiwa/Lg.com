const express = require('express');
const path = require('path');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('🔐 Connecting to Supabase...');
console.log(`📡 URL: ${supabaseUrl}`);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test Supabase connection
async function testConnection() {
  try {
    const { data, error } = await supabase.from('menu').select('count').limit(1);
    if (error) {
      console.error('❌ Supabase connection error:', error.message);
    } else {
      console.log('✅ Supabase connected successfully!');
    }
  } catch (err) {
    console.error('❌ Supabase connection failed:', err.message);
  }
}
testConnection();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ============================================
// API ROUTES
// ============================================

// Get all menu items
app.get('/api/menu', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('menu')
      .select('*')
      .order('id');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all delivery girls
app.get('/api/delivery-girls', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('delivery_girls')
      .select('name')
      .order('name');

    if (error) throw error;
    res.json(data.map(g => g.name));
  } catch (error) {
    console.error('Error fetching delivery girls:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a new delivery girl
app.post('/api/delivery-girls', async (req, res) => {
  const { name } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    // Check if girl already exists
    const { data: existing } = await supabase
      .from('delivery_girls')
      .select('name')
      .eq('name', name.trim())
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Delivery girl already exists' });
    }

    // Insert new girl
    const { error } = await supabase
      .from('delivery_girls')
      .insert({ name: name.trim() });

    if (error) throw error;

    // Get updated list
    const { data: allGirls } = await supabase
      .from('delivery_girls')
      .select('name')
      .order('name');

    res.status(201).json({ 
      success: true, 
      message: 'Delivery girl added successfully',
      girls: allGirls.map(g => g.name) 
    });
  } catch (error) {
    console.error('Error adding delivery girl:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove a delivery girl
app.delete('/api/delivery-girls/:name', async (req, res) => {
  const name = req.params.name;
  
  try {
    const { error } = await supabase
      .from('delivery_girls')
      .delete()
      .eq('name', name);

    if (error) throw error;

    // Get updated list
    const { data: allGirls } = await supabase
      .from('delivery_girls')
      .select('name')
      .order('name');

    res.json({ 
      success: true, 
      message: 'Delivery girl removed successfully',
      girls: allGirls.map(g => g.name) 
    });
  } catch (error) {
    console.error('Error removing delivery girl:', error);
    res.status(500).json({ error: error.message });
  }
});

// Place a new order
app.post('/api/order', async (req, res) => {
  const { items, total, customerLocation } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item' });
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        items: items,
        total: total,
        customer_location: customerLocation || 'Accra, Ghana',
        status: 'pending'
      })
      .select();

    if (error) throw error;

    res.status(201).json({ 
      success: true, 
      message: 'Order placed successfully!',
      order: data[0] 
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all orders (for admin dashboard)
app.get('/api/orders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update order status
app.put('/api/order/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: status })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, order: data[0] });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Laura Girls Food Delivery App`);
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🗄️  Connected to Supabase: ${supabaseUrl}`);
  console.log(`✅ Ready to accept orders!`);
});
