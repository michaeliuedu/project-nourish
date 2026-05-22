"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { z } from "zod";
import sql from "@/lib/db";
import { DietList } from "@/lib/definitions";

export async function authenticate(formData: FormData) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      throw new Error("Invalid credentials.");
    }
    throw error;
  }
}

const RegisterSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(6),
  preferences: z.array(z.enum(DietList)).default([]),
});

export async function register(formData: FormData) {
  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    preferences: formData.getAll("preferences"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { name, email, password, preferences } = parsed.data;

  try {
    const existing = await sql<{ id: number }[]>`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `;

    if (existing.length > 0) {
      throw new Error("Email is already registered.");
    }

    const hashed = await bcrypt.hash(password, 10);
    await sql`
      INSERT INTO users (name, email, password, preferences)
      VALUES (${name}, ${email}, ${hashed}, ${preferences})
    `;
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }

  redirect("/login");
}
