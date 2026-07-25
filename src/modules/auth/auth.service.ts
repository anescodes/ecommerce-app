import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../../config/db';
import { users, wallets } from '../../db/schema';
import { ENV } from '../../config/env';
import type { RegisterInput, LoginInput } from './auth.schema';

export const registerUser = async (input: RegisterInput) => {
  // 1. Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });

  if (existingUser) {
    throw new Error('EMAIL_EXISTS');
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(input.password, 10);

  // 3. Create user & initialize zero-balance wallet in a transaction
  return await db.transaction(async (tx) => {
    const [newUser] = await tx
      .insert(users)
      .values({
        name: input.name,
        email: input.email,
        password: hashedPassword,
      })
      .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

    await tx.insert(wallets).values({
      userId: newUser.id,
      balance: '0.00',
    });

    // 4. Generate JWT
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as SignOptions['expiresIn'] }
    );

    return { user: newUser, token };
  });
};

export const loginUser = async (input: LoginInput) => {
  // 1. Find user by email
  const user = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });

  if (!user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // 2. Verify password
  const isPasswordValid = await bcrypt.compare(input.password, user.password);

  if (!isPasswordValid) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // 3. Generate JWT
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES_IN as SignOptions['expiresIn'] }
  );

  const { password, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};