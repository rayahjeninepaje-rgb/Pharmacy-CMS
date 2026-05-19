import { supabase } from '../lib/supabaseClient';

const makeStamp = (action, userId) => `${action} by ${userId} on ${new Date().toISOString()}`;

export const patientService = {
  // --- Patient CRUD Operations ---
  async getPatients(userType) {
    let query = supabase.from('customer').select('*').order('custno');
    if (userType === 'USER') {
      query = query.eq('record_status', 'ACTIVE');
    }
    const { data, error } = await query;
    return { data, error };
  },

  async addPatient(patientData, userId) {
    const { data: latest } = await supabase
      .from('customer')
      .select('custno')
      .order('custno', { ascending: false })
      .limit(1)
      .single();

    const lastNum = latest ? parseInt(latest.custno.substring(1)) : 82;
    const newId = `C${(lastNum + 1).toString().padStart(4, '0')}`;

    const payload = {
      ...patientData,
      custno: newId,
      record_status: patientData.record_status || 'ACTIVE',
      stamp: makeStamp('CREATED', userId),
    };
    return await supabase.from('customer').insert([payload]);
  },

  async updatePatient(custno, patientData, userId) {
    const payload = {
      ...patientData,
      stamp: makeStamp('UPDATED', userId),
    };
    return await supabase.from('customer')
      .update(payload)
      .eq('custno', custno);
  },

  async archivePatient(custno, userId) {
    return await supabase.from('customer')
      .update({ 
        record_status: 'INACTIVE', 
        stamp: makeStamp('ARCHIVED', userId) 
      })
      .eq('custno', custno);
  },

  async recoverPatient(custno, userId) {
    return await supabase.from('customer')
      .update({ 
        record_status: 'ACTIVE', 
        stamp: makeStamp('RECOVERED', userId) 
      })
      .eq('custno', custno);
  },

  // --- Dispense History Operations ---
  // Get all sales joined with customer info
  async getSales() {
    return await supabase
      .from('sales')
      .select('transno, salesdate, customer(custname)')
      .order('salesdate', { ascending: false });
  },

  // Get specific items for a transaction joined with product
  async getSalesDetail(transNo) {
    return await supabase
      .from('salesdetail')
      .select(`
        quantity,
        product(description, unit)
      `)
      .eq('transno', transNo);
  }
};