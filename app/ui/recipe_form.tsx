"use client"

import { useState } from "react";
import { DietList, type Diet } from "@/lib/definitions";

type RecipeFormProps = {
    step: number;
    setStep?: (n: number) => void;
    onSubmit?: (data: any) => Promise<void> | void;
    loading?: boolean;
    message?: string | null;
};

export default function RecipeForm({
    step,
    setStep,
    onSubmit,
    loading,
    message,
}: RecipeFormProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [selectedTags, setSelectedTags] = useState<Diet[]>([]);
    const [cookTime, setCookTime] = useState(0);
    const [servings, setServings] = useState(1);
    const [tips, setTips] = useState("");

    const [ingredients, setIngredients] = useState<
        { name: string; amount: string }[]
    >([{ name: "", amount: "" }]);
    const [stepsList, setStepsList] = useState<string[]>([""]);
    const [localError, setLocalError] = useState<string | null>(null);

    function hasText(value: string) {
        return value.trim().length > 0;
    }

    function normalizeList(values: string[]) {
        return values.map((value) => value.trim()).filter(Boolean);
    }

    function normalizeIngredients() {
        return ingredients
            .map((ingredient) => ({
                name: ingredient.name.trim(),
                amount: ingredient.amount.trim(),
            }))
            .filter((ingredient) => ingredient.name.length > 0 || ingredient.amount.length > 0);
    }

    function isValidUrl(value: string) {
        if (!value.trim()) return true;

        try {
            const parsedUrl = new URL(value);
            return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
        } catch {
            return false;
        }
    }

    function handleTagChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const nextTags = Array.from(event.target.selectedOptions, (option) => option.value as Diet);
        setSelectedTags(nextTags);
    }

    function validateCurrentStep() {
        if (step === 1 && !hasText(title)) {
            return "Title is required.";
        }

        if (step === 2) {
            const cleanedIngredients = normalizeIngredients();
            if (cleanedIngredients.length === 0) {
                return "Add at least one ingredient.";
            }
            if (cleanedIngredients.some((ingredient) => !ingredient.name || !ingredient.amount)) {
                return "Each ingredient needs both a name and an amount.";
            }
            if (normalizeList(stepsList).length === 0) {
                return "Add at least one step.";
            }
        }

        return null;
    }

    function validateBeforeSubmit() {
        if (!hasText(title)) return "Title is required.";
        const cleanedIngredients = normalizeIngredients();
        if (cleanedIngredients.length === 0) return "Add at least one ingredient.";
        if (cleanedIngredients.some((ingredient) => !ingredient.name || !ingredient.amount)) {
            return "Each ingredient needs both a name and an amount.";
        }
        if (normalizeList(stepsList).length === 0) return "Add at least one step.";
        if (!Number.isFinite(cookTime) || cookTime < 0) return "Cook time must be zero or greater.";
        if (!Number.isFinite(servings) || servings < 1) return "Servings must be at least 1.";
        if (!isValidUrl(imageUrl)) return "Image URL must be a valid http or https URL.";
        return null;
    }

    function next() {
        const error = validateCurrentStep();
        setLocalError(error);
        if (error) return;
        setStep?.(Math.min(3, step + 1));
    }
    function back() {
        setLocalError(null);
        setStep?.(Math.max(1, step - 1));
    }

    function updateIngredient(index: number, field: "name" | "amount", value: string) {
        setIngredients((prev) => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value };
            return copy;
        });
    }
    function addIngredient() {
        setIngredients((p) => [...p, { name: "", amount: "" }]);
    }
    function removeIngredient(i: number) {
        setIngredients((p) => p.filter((_, idx) => idx !== i));
    }

    function updateStep(index: number, value: string) {
        setStepsList((prev) => {
            const copy = [...prev];
            copy[index] = value;
            return copy;
        });
    }
    function addStep() {
        setStepsList((p) => [...p, ""]);
    }
    function removeStep(i: number) {
        setStepsList((p) => p.filter((_, idx) => idx !== i));
    }

    async function handleSubmit(e?: React.FormEvent) {
        e?.preventDefault();
        const error = validateBeforeSubmit();
        setLocalError(error);
        if (error) return;

        const payload = {
            title: title.trim(),
            description: description.trim() || null,
            diet_tags: selectedTags,
            cook_time: Number(cookTime) || 0,
            servings: Number(servings) || 1,
            image_url: imageUrl || null,
            ingredients: normalizeIngredients(),
            steps: stepsList.map((s) => s.trim()).filter(Boolean),
            tips: tips.trim() || null,
        };

        await onSubmit?.(payload);
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="recipe-form-card">
                {localError && <p className="recipe-form-error">{localError}</p>}

                {step === 1 && (
                    <div className="recipe-form-section">
                        <label className="recipe-form-field">
                            <span>Title</span>
                            <input
                                className="recipe-form-input"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </label>

                        <label className="recipe-form-field">
                            <span>Description</span>
                            <textarea
                                className="recipe-form-input recipe-form-textarea"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </label>

                        <label className="recipe-form-field">
                            <span>Image URL</span>
                            <input
                                className="recipe-form-input"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                            />
                        </label>
                    </div>
                )}

                {step === 2 && (
                    <div className="recipe-form-section">
                        <h4 className="recipe-form-subtitle">Ingredients</h4>
                        {ingredients.map((ing, i) => (
                            <div className="recipe-form-row" key={i}>
                                <div className="recipe-form-row-grid">
                                    <input
                                        className="recipe-form-input"
                                        value={ing.name}
                                        onChange={(e) => updateIngredient(i, "name", e.target.value)}
                                        placeholder={`Ingredient ${i + 1}`}
                                    />
                                    <input
                                        className="recipe-form-input"
                                        value={ing.amount}
                                        onChange={(e) => updateIngredient(i, "amount", e.target.value)}
                                        placeholder="Amount"
                                    />
                                </div>
                                <button className="recipe-form-button" type="button" onClick={() => removeIngredient(i)}>
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button className="recipe-form-button" type="button" onClick={addIngredient}>
                            Add ingredient
                        </button>

                        <h4 className="recipe-form-subtitle">Steps</h4>
                        {stepsList.map((st, i) => (
                            <div className="recipe-form-row" key={i}>
                                <textarea
                                    className="recipe-form-input recipe-form-textarea"
                                    value={st}
                                    onChange={(e) => updateStep(i, e.target.value)}
                                    placeholder={`Step ${i + 1}`}
                                />
                                <button className="recipe-form-button" type="button" onClick={() => removeStep(i)}>
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button className="recipe-form-button" type="button" onClick={addStep}>
                            Add step
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className="recipe-form-section">
                        <label className="recipe-form-field">
                            <span>Tags</span>
                            <select
                                className="recipe-form-input recipe-form-select"
                                multiple
                                value={selectedTags}
                                onChange={handleTagChange}
                            >
                                {DietList.map((diet) => (
                                    <option key={diet} value={diet}>
                                        {diet}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="recipe-form-field">
                            <span>Cook time (minutes)</span>
                            <input
                                className="recipe-form-input"
                                type="number"
                                value={cookTime}
                                onChange={(e) => setCookTime(Number(e.target.value))}
                                min={0}
                            />
                        </label>

                        <label className="recipe-form-field">
                            <span>Servings</span>
                            <input
                                className="recipe-form-input"
                                type="number"
                                value={servings}
                                onChange={(e) => setServings(Number(e.target.value))}
                                min={1}
                            />
                        </label>

                        <label className="recipe-form-field">
                            <span>Tips</span>
                            <textarea
                                className="recipe-form-input recipe-form-textarea"
                                value={tips}
                                onChange={(e) => setTips(e.target.value)}
                            />
                        </label>
                    </div>
                )}

                <div className="recipe-form-actions">
                    {step > 1 && (
                        <button className="recipe-form-button" type="button" onClick={back} disabled={loading}>
                            Back
                        </button>
                    )}

                    {step < 3 && (
                        <button
                            className="recipe-form-button"
                            type="button"
                            onClick={next}
                            disabled={loading}
                        >
                            Next
                        </button>
                    )}

                    {step === 3 && (
                        <button className="recipe-form-button" type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Recipe"}
                        </button>
                    )}
                </div>

                {message && <p className="recipe-form-message">{message}</p>}
            </div>
        </form>
    );
}