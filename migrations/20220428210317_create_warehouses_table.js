/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('warehouses', (table) => {
    table.increments('id').primary();
    table.string('warehouse_name').notNullable();
    table.string('address').notNullable();
    table.string('city').notNullable();
    table.string('country').notNullable();
    table.string('contact_name').notNullable();
    table.string('contact_position').notNullable();
    table.string('contact_phone').notNullable();
    table.string('contact_email').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('warehouses');
};
