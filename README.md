# Laura Girls Food Delivery App

A complete food delivery app hosted on GitHub Pages with Supabase backend.

## 🌐 Live Demo
[Your GitHub Pages URL here]

## 📋 Features

- **User Features:**
  - Browse menu items from Supabase database
  - Add items to cart
  - Place orders with cash on delivery
  - View delivery location on Google Maps

- **Admin Features:**
  - Add/remove delivery girls
  - All data stored in Supabase

## 🚀 Deployment Instructions

### 1. Set Up Supabase

1. Create a free account at [Supabase](https://supabase.com)
2. Create a new project
3. Go to SQL Editor and run the `supabase-schema.sql` script
4. Get your Project URL and Anon Key from Settings > API

### 2. Update the App

1. Open `index.html` in a text editor
2. Replace these values at the top of the script:
   ```javascript
   const SUPABASE_URL = 'https://your-project-url.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key-here';
