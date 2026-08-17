import { supabase } from '$lib/supabase/client';
import { createUserFactory } from '$tests/factories/user.factory';
import { createCustomerFactory } from '$tests/factories/customer.factory';
import { createPetFactory } from '$tests/factories/pet.factory';
import { createProductFactory } from '$tests/factories/product.factory';

export async function seedTestData() {
  await supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('loyalty_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('invoice_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('invoices').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('appointments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('pet_allergies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('pet_diseases').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('pet_vaccines').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('pet_weight_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('pets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('stock_movements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('purchase_order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('purchase_orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('suppliers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('rooms').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('procedures').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('grooming_services').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('expense_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('loyalty_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('loyalty_tiers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('promotions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('cash_shifts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('customer_feedback').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const owner = await supabase
    .from('users')
    .insert(createUserFactory({ role: 'OWNER', username: 'test.owner' }))
    .select()
    .single();

  const admin = await supabase
    .from('users')
    .insert(createUserFactory({ role: 'ADMIN', username: 'test.admin', created_by: owner.data.id }))
    .select()
    .single();

  const doctor = await supabase
    .from('users')
    .insert(createUserFactory({ role: 'DOKTER', username: 'test.doctor', created_by: owner.data.id }))
    .select()
    .single();

  const kasir = await supabase
    .from('users')
    .insert(createUserFactory({ role: 'KASIR', username: 'test.kasir', created_by: owner.data.id }))
    .select()
    .single();

  const customer = await supabase
    .from('users')
    .insert(createUserFactory({ role: 'CUSTOMER', username: 'test.customer', created_by: admin.data.id }))
    .select()
    .single();

  const testCustomer = await supabase
    .from('customers')
    .insert(createCustomerFactory({ name: 'Ibu Wati', phone: '+6281234567890' }))
    .select()
    .single();

  await supabase
    .from('users')
    .update({ customer_id: testCustomer.data.id })
    .eq('id', customer.data.id);

  await supabase.from('pets').insert([
    createPetFactory({ customer_id: testCustomer.data.id, name: 'Buddy', species: 'Dog' }),
    createPetFactory({ customer_id: testCustomer.data.id, name: 'Mimi', species: 'Cat' }),
  ]);

  await supabase.from('products').insert([
    createProductFactory({ sku: 'RC-ADT-5KG', name: 'Royal Canin Adult 5kg', stock_quantity: 10 }),
    createProductFactory({ sku: 'WH-CAT-1KG', name: 'Whiskas Cat 1kg', stock_quantity: 20 }),
    createProductFactory({ sku: 'PD-ADT-10KG', name: 'Pedigree Adult 10kg', stock_quantity: 5 }),
  ]);
}
