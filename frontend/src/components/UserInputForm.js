import React, { useState } from 'react';
import axios from 'axios';

function UserInputForm({ onMealPlanGenerated }) {
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/generate-meal-plan`, { userInput });
            onMealPlanGenerated(response.data.mealPlan);
        } catch (error) {
            setError('Failed to generate meal plan. Please try again.');
            console.error('Error generating meal plan:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="user-input-form">
            <h2>Enter Your Meal Preferences</h2>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Enter your dietary preferences, restrictions, or any other meal planning criteria..."
                    rows="4"
                    required
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Generate Meal Plan'}
                </button>
            </form>
            {error && <p className="error">{error}</p>}
        </div>
    );
}

export default UserInputForm;