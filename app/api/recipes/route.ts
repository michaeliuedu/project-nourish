import { z } from "zod";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import sql from "@/lib/db";

const RecipeSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().optional().nullable(),
  diet_tags: z.array(z.string()).optional().default([]),
  cook_time: z.number().int().nonnegative().optional().default(0),
  servings: z.number().int().nonnegative().optional().default(1),
  image_url: z.string().url().optional().nullable(),
  ingredients: z.any().optional().default([]),
  steps: z.any().optional().default([]),
  tips: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const session = (await auth()) as any;
    const email = session?.user?.email;
    if (!email) {
      console.warn("No session email available when creating recipe", { session });
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = RecipeSchema.safeParse(body);
    if (!parsed.success) {
      console.warn("Invalid recipe payload", {
        issues: parsed.error.issues,
        body,
      });
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const {
      title,
      description,
      diet_tags,
      cook_time,
      servings,
      image_url,
      ingredients,
      steps,
      tips,
    } = parsed.data;

    // lookup user's id by their session email
    const userRow =
      await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    const user_id = userRow?.[0]?.id;
    if (!user_id) {
      console.warn("Session email not found in users table", { email });
      return NextResponse.json(
        { error: "User not registered. Please sign up before creating recipes." },
        { status: 401 }
      );
    }

    const inserted = await sql`
			INSERT INTO recipes (user_id, title, description, diet_tags, cook_time, servings, image_url, ingredients, steps, tips)
			VALUES (${user_id}, ${title}, ${description}, ${diet_tags}, ${cook_time}, ${servings}, ${image_url}, ${JSON.stringify(
      ingredients
    )}::jsonb, ${JSON.stringify(steps)}::jsonb, ${tips}) RETURNING *
		`;

    return NextResponse.json({ recipe: inserted[0] ?? null }, { status: 201 });
  } catch (error) {
    console.error("Create recipe failed:", error);
    return NextResponse.json(
      { error: "Failed to create recipe" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const user_id = url.searchParams.get("user_id");
    const tab = url.searchParams.get("tab");
    const cursor = url.searchParams.get("cursor");

    // functional queries using a cursor (expects an ISO timestamp)
    if (cursor) {
      const cursorDate = new Date(cursor);
      if (isNaN(cursorDate.getTime())) {
        return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
      }
      const uid = user_id ? Number(user_id) : undefined;

      // profile: recipes created by the given user
      if (tab === "profile") {
        if (uid) {
          const rows = await sql`
						SELECT r.* FROM recipes r
						WHERE r.user_id = ${uid} AND r.created_at < ${cursorDate.toISOString()}
						ORDER BY r.created_at DESC
						LIMIT 50
					`;
          return NextResponse.json({ recipes: rows });
        }
        console.error("user id was not provided for the profile query");
        return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
      }

      // for_you: recipes matching the user's preferences
      if (tab === "for_you") {
        if (uid) {
          const rows = await sql`
						SELECT r.* FROM recipes r
						JOIN users u ON r.user_id = u.id
						WHERE r.diet_tags && u.preferences AND r.created_at < ${cursorDate.toISOString()}
						ORDER BY r.created_at DESC
						LIMIT 50
					`;
          return NextResponse.json({ recipes: rows });
        }
        console.error("user id was not provided for for_you query");
        return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
      }

      // general feed: newest recipes before the cursor
      const rows = await sql`
				SELECT * FROM recipes
				WHERE created_at < ${cursorDate.toISOString()}
				ORDER BY created_at DESC
				LIMIT 50
			`;
      return NextResponse.json({ recipes: rows });
    }

    // search by id
    if (id) {
      const rows = await sql`SELECT * FROM recipes WHERE id = ${id} LIMIT 1`;
      return NextResponse.json({ recipe: rows[0] ?? null });
    }

    // search by user
    if (user_id) {
      const uid = Number(user_id);
      const rows = await sql`
				SELECT * FROM recipes WHERE user_id = ${uid} ORDER BY created_at DESC LIMIT 50
			`;
      return NextResponse.json({ recipes: rows });
    }

    const rows =
      await sql`SELECT * FROM recipes ORDER BY created_at DESC LIMIT 50`;
    return NextResponse.json({ recipes: rows });
  } catch (error) {
    console.error("Fetch recipes failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}
