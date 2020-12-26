import * as Knex from 'knex';
import { DbConnection } from '../db';
// import models from '../models/factory';
import { hashPassword } from '../utils/auth';
import uuidgen from '../utils/uuidgen';

export async function up(db: DbConnection): Promise<any> {
	await db.schema.createTable('users', function(table: Knex.CreateTableBuilder) {
		table.string('id', 32).unique().primary().notNullable();
		table.text('email', 'mediumtext').unique().notNullable();
		table.text('password', 'mediumtext').notNullable();
		table.text('full_name', 'mediumtext').defaultTo('').notNullable();
		table.integer('is_admin').defaultTo(0).notNullable();
		table.bigInteger('updated_time').notNullable();
		table.bigInteger('created_time').notNullable();
	});

	await db.schema.createTable('sessions', function(table: Knex.CreateTableBuilder) {
		table.string('id', 32).unique().primary().notNullable();
		table.string('user_id', 32).notNullable();
		table.string('auth_code', 32).defaultTo('').notNullable();
		table.bigInteger('updated_time').notNullable();
		table.bigInteger('created_time').notNullable();
	});

	await db.schema.createTable('permissions', function(table: Knex.CreateTableBuilder) {
		table.string('id', 32).unique().primary().notNullable();
		table.string('user_id', 32).notNullable();
		table.integer('item_type').notNullable();
		table.string('item_id', 32).notNullable();
		table.integer('can_read').defaultTo(0).notNullable();
		table.integer('can_write').defaultTo(0).notNullable();
		table.bigInteger('updated_time').notNullable();
		table.bigInteger('created_time').notNullable();
	});

	await db.schema.alterTable('permissions', function(table: Knex.CreateTableBuilder) {
		table.unique(['user_id', 'item_type', 'item_id']);
	});

	await db.schema.createTable('files', function(table: Knex.CreateTableBuilder) {
		table.string('id', 32).unique().primary().notNullable();
		table.string('owner_id', 32).notNullable();
		table.text('name').notNullable();
		table.binary('content').defaultTo('').notNullable();
		table.string('mime_type', 128).defaultTo('application/octet-stream').notNullable();
		table.integer('size').defaultTo(0).notNullable();
		table.integer('is_directory').defaultTo(0).notNullable();
		table.integer('is_root').defaultTo(0).notNullable();
		table.string('parent_id', 32).defaultTo('').notNullable();
		table.bigInteger('updated_time').notNullable();
		table.bigInteger('created_time').notNullable();
	});

	await db.schema.alterTable('files', function(table: Knex.CreateTableBuilder) {
		table.unique(['parent_id', 'name']);
	});

	await db.schema.createTable('changes', function(table: Knex.CreateTableBuilder) {
		table.increments('counter').unique().primary().notNullable();
		table.string('id', 32).unique().notNullable();
		table.string('owner_id', 32).notNullable();
		table.integer('item_type').notNullable();
		table.string('parent_id', 32).defaultTo('').notNullable();
		table.string('item_id', 32).notNullable();
		table.text('item_name').defaultTo('').notNullable();
		table.integer('type').notNullable();
		table.bigInteger('updated_time').notNullable();
		table.bigInteger('created_time').notNullable();
	});

	await db.schema.createTable('api_clients', function(table: Knex.CreateTableBuilder) {
		table.string('id', 32).unique().primary().notNullable();
		table.string('name', 32).notNullable();
		table.string('secret', 32).notNullable();
		table.bigInteger('updated_time').notNullable();
		table.bigInteger('created_time').notNullable();
	});

	const adminId = uuidgen();
	const adminRootFileId = uuidgen();
	const now = Date.now();

	await db('users').insert({
		id: adminId,
		email: 'admin@localhost',
		password: hashPassword('admin'),
		full_name: 'Admin',
		is_admin: 1,
		updated_time: now,
		created_time: now,
	});

	await db('files').insert({
		id: adminRootFileId,
		owner_id: adminId,
		name: adminRootFileId,
		size: 0,
		is_directory: 1,
		is_root: 1,
		updated_time: now,
		created_time: now,
	});

	await db('api_clients').insert({
		id: uuidgen(),
		name: 'Joplin',
		secret: 'sdrNUPtKNdY5Z5tF4bthqu',
		updated_time: now,
		created_time: now,
	});
}

export async function down(db: DbConnection): Promise<any> {
	await db.schema.dropTable('users');
	await db.schema.dropTable('sessions');
	await db.schema.dropTable('permissions');
	await db.schema.dropTable('files');
	await db.schema.dropTable('api_clients');
	await db.schema.dropTable('changes');
}