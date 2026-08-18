import { supabase } from '@/lib/supabase/client';
import { createUserFactory } from '../../tests/factories/user.factory';
import { createCustomerFactory } from '../../tests/factories/customer.factory';
import { createPetFactory } from '../../tests/factories/pet.factory';
import { createProductFactory } from '../../tests/factories/product.factory';

export async function seedTestData() {
  const tables = [
    'audit_logs',
    'loyalty_transactions',
    'payments',
    'invoice_items',
    'invoices',
    'appointments',
    'pet_allergies',
    'pet_diseases',
    'pet_vaccines',
    'pet_weight_logs',
    'pets',
    'customers',
    'stock_movements',
    'purchase_order_items',
    'purchase_orders',
    'products',
    'categories',
    'suppliers',
    'rooms',
    'procedures',
    'grooming_services',
    'expense_categories',
    'expenses',
    'loyalty_members',
    'loyalty_tiers',
    'promotions',
    'cash_shifts',
    'customer_feedback',
    'notifications',
    'users',
  ];

  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      throw new Error(`Failed to clear table ${table}: ${error.message}`);
    }
  }

  const owner = await supabase
    .from('users')
    .insert(createUserFactory({ role: 'OWNER', username: 'owner' }))
    .select()
    .single();

  if (owner.error) {
    throw new Error(`Failed to create owner: ${owner.error.message}`);
  }

  const admin = await supabase
    .from('users')
    .insert(
      createUserFactory({
        role: 'ADMIN',
        username: 'admin',
        created_by: owner.data.id,
      }),
    )
    .select()
    .single();

  if (admin.error) {
    throw new Error(`Failed to create admin: ${admin.error.message}`);
  }

  const doctor = await supabase
    .from('users')
    .insert(
      createUserFactory({
        role: 'DOKTER',
        username: 'doctor',
        created_by: owner.data.id,
      }),
    )
    .select()
    .single();

  if (doctor.error) {
    throw new Error(`Failed to create doctor: ${doctor.error.message}`);
  }

  const kasir = await supabase
    .from('users')
    .insert(
      createUserFactory({
        role: 'KASIR',
        username: 'kasir',
        created_by: owner.data.id,
      }),
    )
    .select()
    .single();

  if (kasir.error) {
    throw new Error(`Failed to create kasir: ${kasir.error.message}`);
  }

  const customer = await supabase
    .from('users')
    .insert(
      createUserFactory({
        role: 'CUSTOMER',
        username: 'customer',
        created_by: admin.data.id,
      }),
    )
    .select()
    .single();

  if (customer.error) {
    throw new Error(`Failed to create customer: ${customer.error.message}`);
  }

  const testCustomer = await supabase
    .from('customers')
    .insert(createCustomerFactory({ name: 'Ibu Wati', phone: '+6281234567890' }))
    .select()
    .single();

  if (testCustomer.error) {
    throw new Error(`Failed to create customer record: ${testCustomer.error.message}`);
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({ customer_id: testCustomer.data.id })
    .eq('id', customer.data.id);

  if (updateError) {
    throw new Error(`Failed to link customer user: ${updateError.message}`);
  }

  const { error: petsError } = await supabase.from('pets').insert([
    createPetFactory({ customer_id: testCustomer.data.id, name: 'Buddy', species: 'Dog' }),
    createPetFactory({ customer_id: testCustomer.data.id, name: 'Mimi', species: 'Cat' }),
  ]);

  if (petsError) {
    throw new Error(`Failed to seed pets: ${petsError.message}`);
  }

  const { error: productsError } = await supabase.from('products').insert([
    createProductFactory({ sku: 'RC-ADT-5KG', name: 'Royal Canin Adult 5kg', stock_quantity: 10 }),
    createProductFactory({ sku: 'WH-CAT-1KG', name: 'Whiskas Cat 1kg', stock_quantity: 20 }),
    createProductFactory({ sku: 'PD-ADT-10KG', name: 'Pedigree Adult 10kg', stock_quantity: 5 }),
  ]);

  if (productsError) {
    throw new Error(`Failed to seed products: ${productsError.message}`);
  }
}
