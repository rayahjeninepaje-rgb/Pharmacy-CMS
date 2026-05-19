import { supabase } from '../lib/supabaseClient';

// ==========================================
// 1. PATIENT / CUSTOMER MODULE FUNCTIONS
// ==========================================

// Get customers (Main Patient Records)
export async function getCustomers(userType) {
  let query = supabase.from('customer').select('*').order('custno');

  if (userType === 'USER') {
    query = query.eq('record_status', 'ACTIVE');
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Get transactions (View-Only)
export async function getSalesByCustomer(custNo) {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .eq('custno', custNo); // Ensure column name matches DB (custno)
  if (error) throw error;
  return data;
}

// Get transaction details (View-Only)
export async function getSalesDetail(transNo) {
  const { data, error } = await supabase
    .from('salesdetail')
    .select('*, product(description)')
    .eq('transno', transNo); // Ensure column name matches DB (transno)
  if (error) throw error;
  return data;
}

// ==========================================
// 2. PRODUCT MODULE FUNCTIONS (WITH FALLBACK)
// ==========================================

// Get the product catalogue (View-Only with Safe Table Fallback)
export async function getProducts() {
  try {
    // Try fetching from the custom pricing view first
    const { data, error } = await supabase
      .from('product_current_price')
      .select('*');
    
    // If the view is missing (Error code 42P01), bypass to fallback
    if (error && error.code === '42P01') {
      console.warn("Database view 'product_current_price' missing. Falling back to 'product' table...");
      return await getProductsFallback();
    }
    
    if (error) throw error;
    return data;
  } catch (err) {
    if (err.code === '42P01' || err.message?.includes('does not exist')) {
      return await getProductsFallback();
    }
    throw err;
  }
}

// Private safe fallback helper querying the direct product table layout
async function getProductsFallback() {
  const { data, error } = await supabase
    .from('product')
    .select('*');
  
  if (error) {
    console.error("Both view and direct table queries failed:", error);
    throw error;
  }
  return data;
}

// ==========================================
// 3. ADMIN & PROFILE MODULE FUNCTIONS
// ==========================================

// Get all users (Admin panel)
export async function getUsers() {
  const { data, error } = await supabase
    .from('user')
    .select('*')
    .order('email');
  if (error) throw error;
  return data;
}

// Activate/Deactivate a user (Admin panel - Fixed: Removed broken 'id' fallback column code)
export async function updateUserStatus(userId, newStatus) {
  const { data, error } = await supabase
    .from('user')
    .update({ record_status: newStatus })
    .eq('userid', userId)
    .select(); // CRITICAL: Returns updated row values to force instant component re-renders

  if (error) {
    console.error("Supabase updateUserStatus error:", error);
    throw error;
  }

  return data;
}

// Update specific rights for a user (Admin panel)
export async function updateUserRight(userId, rightId, value) {
  const { data, error } = await supabase
    .from('user_module_rights')
    .update({ right_value: value }) 
    .eq('userid', userId)          
    .eq('rightid', rightId)
    .select();
  if (error) throw error;
  return data;
}

// Update user profile (username, contact info, etc. - Fixed: Removed broken 'id' fallback column code)
export async function updateUser(userId, userData) {
  const { data, error } = await supabase
    .from('user')
    .update(userData)
    .eq('userid', userId)
    .select();
    
  if (error) throw error;
  return data;
}

// Fetch user's full profile (Fixed: Removed broken 'id' fallback column code)
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('user')
    .select('*')
    .eq('userid', userId)
    .single(); // Strictly targets the precise user profile row setup
  
  if (error) throw error;
  return data;
}