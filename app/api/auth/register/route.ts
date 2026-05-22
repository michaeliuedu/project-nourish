import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { z } from "zod";
import sql from "@/lib/db";
import { DietList } from "@/lib/definitions";

const RegisterSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(6),
  preferences: z.array(z.enum(DietList)).default([]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { name, email, password, preferences } = parsed.data;

    const existing = await sql<{ id: number }[]>`
			SELECT id FROM users WHERE email = ${email} LIMIT 1
		`;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    await sql`
      INSERT INTO users (name, email, password, preferences)
      VALUES (${name}, ${email}, ${hashed}, ${preferences})
		`;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Registration failed:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
