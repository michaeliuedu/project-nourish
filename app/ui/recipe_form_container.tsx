"use client"
import { useState } from "react";
import RecipeForm from "./recipe_form";
import {useRouter} from "next/navigation";
import "./recipe_form_container.css";

export default function RecipeFormContainer() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    async function handleSubmit(data: any) {
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch("/api/recipes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const json = await res.json();
            if (!res.ok) {
                setMessage(json?.error || "Failed to create recipe");
                return;
            }
            setMessage("Recipe created successfully");
            setStep(1);
        } catch (err) {
            setMessage("Network error: could not submit recipe");
        } finally {
            setLoading(false);
            router.push("/home");
        }
    }

    return (
        <div className="recipe-form-container">
            <h2> Create a Recipe (step {step}) </h2>
            <RecipeForm
                step={step}
                setStep={setStep}
                onSubmit={handleSubmit}
                loading={loading}
                message={message}
            />
        </div>
    );
}