
type RecipeCardProps = {
	recipe: {
		id: string;
		title: string;
		description: string | null;
		diet_tags: string[];
		cook_time: number;
		servings: number;
		image_url: string | null;
		created_at: string;
	};
};

export default function RecipeCard({ recipe }: RecipeCardProps) {
	return (
		<article className="recipe-card">
			<h3 className="recipe-card-title">{recipe.title}</h3>
			<p className="recipe-card-meta">
				{recipe.cook_time} min · {recipe.servings} serving{recipe.servings === 1 ? "" : "s"}
			</p>
			{recipe.description ? (
				<p className="recipe-card-description">{recipe.description}</p>
			) : null}
			{recipe.diet_tags.length > 0 ? (
				<p className="recipe-card-tags">
					{recipe.diet_tags.slice(0, 4).map((tag) => (
						<span key={tag} className="recipe-card-tag">
							{tag}
						</span>
					))}
				</p>
			) : null}
		</article>
	);
}