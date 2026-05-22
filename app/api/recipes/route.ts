import { z } from "zod";
import { NextResponse } from "next/server";
import sql from "@/lib/db";

const RecipeSchema = z.object({
	user_id: z.number().int().positive(),
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
		const body = await request.json();
		const parsed = RecipeSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json({ error: "Invalid input" }, { status: 400 });
		}

		const {
			user_id,
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

		const inserted = await sql`
			INSERT INTO recipes (user_id, title, description, diet_tags, cook_time, servings, image_url, ingredients, steps, tips)
			VALUES (${user_id}, ${title}, ${description}, ${diet_tags}, ${cook_time}, ${servings}, ${image_url}, ${JSON.stringify(
			ingredients
		)}::jsonb, ${JSON.stringify(steps)}::jsonb, ${tips}) RETURNING *
		`;

		return NextResponse.json({ recipe: inserted[0] ?? null }, { status: 201 });
	} catch (error) {
		console.error("Create recipe failed:", error);
		return NextResponse.json({ error: "Failed to create recipe" }, { status: 500 });
	}
}

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const id = url.searchParams.get("id");
		const user_id = url.searchParams.get("user_id");
        const tab = url.searchParams.get("tab");
        const cursor = url.searchParams.get("cursor");


        // functional queries
        if(tab){
            if(tab === "feed"){

            }

            if(tab === "for_you"){

            }

            if(tab === "profile"){

            }
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

		const rows = await sql`SELECT * FROM recipes ORDER BY created_at DESC LIMIT 50`;
		return NextResponse.json({ recipes: rows });
	} catch (error) {
		console.error("Fetch recipes failed:", error);
		return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
	}
}