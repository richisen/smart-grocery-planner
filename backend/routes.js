const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { searchProducts } = require('./krogerApi');

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Function to generate meal plan using Gemini API
async function generateMealPlan(userInput) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `Generate a meal plan based on the following preferences: ${userInput}. Please provide the response in JSON format without any markdown formatting or code block syntax. The JSON should have this structure:
    {
      "meals": [
        {
          "name": "Meal Name",
          "ingredients": ["ingredient 1", "ingredient 2", ...]
        },
        ...
      ]
    }
    Ensure all ingredient lists are properly formatted arrays.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        console.log('Gemini API Response:', text);

        // Clean up the JSON
        text = text.replace(/\n/g, '').replace(/\r/g, '').trim();
        text = text.replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
        text = text.replace(/,\s*}/g, '}'); // Remove trailing commas in objects

        try {
            return JSON.parse(text);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            // If parsing fails, attempt to extract JSON using regex
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Failed to parse Gemini API response');
            }
        }
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw new Error(`Failed to generate meal plan: ${error.message}`);
    }
}

// Route to handle meal plan generation
router.post('/generate-meal-plan', async (req, res) => {
    try {
        const { userInput } = req.body;
        const mealPlan = await generateMealPlan(userInput);
        res.json({ mealPlan });
    } catch (error) {
        console.error('Error in generate-meal-plan route:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route to handle shopping list generation
router.post('/generate-shopping-list', async (req, res) => {
    try {
        const { mealPlan } = req.body;
        const shoppingList = [];

        for (const meal of mealPlan.meals) {
            for (const ingredient of meal.ingredients) {
                try {
                    const products = await searchProducts(ingredient);
                    if (products && products.length > 0) {
                        shoppingList.push({
                            ingredient,
                            product: products[0],
                        });
                    } else {
                        shoppingList.push({
                            ingredient,
                            product: null,
                            message: 'No products found'
                        });
                    }
                } catch (error) {
                    console.error(`Error searching for product: ${ingredient}`, error);
                    shoppingList.push({
                        ingredient,
                        product: null,
                        error: 'Product search failed'
                    });
                }
            }
        }

        res.json({ shoppingList });
    } catch (error) {
        console.error('Error in generate-shopping-list route:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;