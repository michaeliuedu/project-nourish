"use client";

import { useEffect, useRef, useState } from "react";
import RecipeCard from "../ui/recipe_card";

type Recipe = {
	id: string;
	title: string;
	description: string | null;
	diet_tags: string[];
	cook_time: number;
	servings: number;
	image_url: string | null;
	created_at: string;
};

export default function HomeFeed() {
	const [recipes, setRecipes] = useState<Recipe[]>([]);
	const [nextCursor, setNextCursor] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const sentinelRef = useRef<HTMLDivElement | null>(null);
	const canTriggerLoadMoreRef = useRef(true);

	useEffect(() => {
		let cancelled = false;

		async function loadFeed() {
			setLoading(true);
			setError(null);

			try {
				const response = await fetch("/api/recipes?tab=general", {
					credentials: "include",
				});
				const payload = await response.json();

				if (cancelled) {
					return;
				}

				if (!response.ok) {
					setRecipes([]);
					setNextCursor(null);
					setError(payload.error || "Failed to load recipes");
					return;
				}

				const initialRecipes = (payload.recipes ?? []) as Recipe[];
				setRecipes(initialRecipes);
				setNextCursor(initialRecipes.at(-1)?.created_at ?? null);
			} catch {
				if (!cancelled) {
					setRecipes([]);
					setNextCursor(null);
					setError("Failed to load recipes");
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}

		void loadFeed();

		return () => {
			cancelled = true;
		};
	}, []);

	async function loadMore() {
		if (!nextCursor || loadingMore) {
			return;
		}

		setLoadingMore(true);
		setError(null);
        console.log("Loading more recipes with cursor:", nextCursor);
		try {
			const response = await fetch(
					`/api/recipes?tab=general&cursor=${encodeURIComponent(nextCursor)}`,
				{
					credentials: "include",
				}
			);
			const payload = await response.json();

			if (!response.ok) {
				setError(payload.error || "Failed to load recipes");
				return;
			}

			const moreRecipes = (payload.recipes ?? []) as Recipe[];
			setRecipes((current) => {
				const seen = new Set(current.map((recipe) => recipe.id));
				const nextRecipes = moreRecipes.filter((recipe) => !seen.has(recipe.id));
				return [...current, ...nextRecipes];
			});
			setNextCursor(moreRecipes.at(-1)?.created_at ?? null);
		} catch {
			setError("Failed to load recipes");
		} finally {
			setLoadingMore(false);
		}
	}

	useEffect(() => {
		const sentinel = sentinelRef.current;

		if (!sentinel || loading || loadingMore || !nextCursor) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (!entry) {
					return;
				}

				if (!entry.isIntersecting) {
					canTriggerLoadMoreRef.current = true;
					return;
				}

				if (!canTriggerLoadMoreRef.current) {
					return;
				}

				canTriggerLoadMoreRef.current = false;
				if (entry.isIntersecting) {
					void loadMore();
				}
			},
			{
				rootMargin: "300px 0px",
			}
		);

		observer.observe(sentinel);

		return () => {
			observer.disconnect();
		};
	}, [loading, loadingMore, nextCursor]);

	return (
		<section className="home-feed">
			{error ? <p className="home-feed-error">{error}</p> : null}

			{loading ? <p className="home-feed-note">Loading recipes...</p> : null}

			{!loading && recipes.length === 0 && !error ? (
				<p className="home-feed-empty">No recipes yet.</p>
			) : null}

			<div className="home-feed-list">
				{recipes.map((recipe) => (
					<RecipeCard key={recipe.id} recipe={recipe} />
				))}
			</div>

			{nextCursor ? <div ref={sentinelRef} className="home-feed-sentinel" aria-hidden="true" /> : null}

			{loadingMore ? <p className="home-feed-note">Loading more recipes...</p> : null}
		</section>
	);
}
