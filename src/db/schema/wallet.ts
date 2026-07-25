import { pgTable, serial, integer, numeric, varchar, timestamp, text } from 'drizzle-orm/pg-core';
import { users } from './users';

export const wallets = pgTable('wallets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  balance: numeric('balance', { precision: 12, scale: 2 }).default('0.00').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const walletTransactions = pgTable('wallet_transactions', {
  id: serial('id').primaryKey(),
  walletId: integer('wallet_id').references(() => wallets.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'deposit' | 'withdrawal' | 'payment'
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  reference: text('reference'), // 'text' works now!
  createdAt: timestamp('created_at').defaultNow().notNull(),
});