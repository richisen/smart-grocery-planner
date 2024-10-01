import React from 'react';
import axios from 'axios';

function MealPlan({ mealPlan, onShoppingListGenerated }) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    const handleGenerateShoppingList = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/generate-shopping-list`, { mealPlan });
            onShoppingListGenerated(response.data.shoppingList);
        } catch (error) {
            setError('Failed to generate shopping list. Please try again.');
            console.error('Error generating shopping list:', error);
        } finally {
            setIsLoading(false);
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
            <button onClick={handleGenerateShoppingList} disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Generate Shopping List'}
            </button>
            {error && <p className="error">{error}</p>}
        </div>
    );
}

export default MealPlan;