import React, { useState } from 'react';
import axios from 'axios';

function MealPlan({ mealPlan, onRefinementRequest }) {
    const [refinementInput, setRefinementInput] = useState('');
    const [isRefining, setIsRefining] = useState(false);

    const handleRefinementRequest = async () => {
        if (refinementInput.trim() === '') return;

        setIsRefining(true);

        try {
            const response = await axios.post('/api/refine-meal-plan', {
                mealPlan,
                refinementRequest: refinementInput
            });
            setRefinementInput('');
            onRefinementRequest(response.data.refinedMealPlan, response.data.shoppingList);
        } catch (error) {
            console.error('Error refining meal plan:', error);
            alert('Sorry, there was an error refining your meal plan. Please try again.');
        } finally {
            setIsRefining(false);
        }
    };

    return (
        <div className="meal-plan">
            <h2>Your Meal Plan</h2>
            {mealPlan.meals.map((meal, index) => (
                <div key={index} className="meal">
                    <h3>{meal.name}</h3>
                    <ul>
                        {meal.ingredients.map((ingredient, idx) => (
                            <li key={idx}>{ingredient}</li>
                        ))}
                    </ul>
                </div>
            ))}
            <div className="refinement-input">
                <input
                    type="text"
                    value={refinementInput}
                    onChange={(e) => setRefinementInput(e.target.value)}
                    placeholder="Request changes to your meal plan..."
                    disabled={isRefining}
                />
                <button onClick={handleRefinementRequest} disabled={isRefining}>
                    {isRefining ? 'Refining...' : 'Refine Plan'}
                </button>
            </div>
        </div>
    );
}

export default MealPlan;