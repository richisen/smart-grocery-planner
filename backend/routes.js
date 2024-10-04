const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { searchProducts } = require('./krogerApi');

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function generateGeminiResponse(prompt, chatHistory, isInitial = false) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    let formattedHistory = chatHistory.map(msg => ({
        role: msg.isUser ? 'user' : 'model',
        parts: [{ text: msg.text }],
    }));

    if (isInitial) {
        formattedHistory = [];
    }

    const chat = model.startChat({
        history: formattedHistory,
    });

    const result = await chat.sendMessage(prompt);
    return result.response.text();
}

router.post('/chat', async (req, res) => {
    try {
        const { message, history, isInitial } = req.body;
        const response = await generateGeminiResponse(message, history || [], isInitial);
        res.json({ message: response });
    } catch (error) {
        console.error('Error in chat route:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/generate-meal-plan', async (req, res) => {
    try {
        const { chatHistory } = req.body;

        const prompt = `Based on the following conversation, generate a meal plan. The meal plan should be in JSON format with the following structure:
    {
      "meals": [
        {
          "name": "Meal Name",
          "ingredients": ["ingredient 1", "ingredient 2", ...]
        },
        ...
      ]
    }`;

        const mealPlanText = await generateGeminiResponse(prompt, chatHistory);
        const mealPlan = JSON.parse(mealPlanText);

        // Generate shopping list using Kroger API
        const shoppingList = await generateShoppingList(mealPlan);

        res.json({ mealPlan, shoppingList });
    } catch (error) {
        console.error('Error in generate-meal-plan route:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/refine-meal-plan', async (req, res) => {
    try {
        const { mealPlan, refinementRequest } = req.body;

        const prompt = `Refine the following meal plan based on this request: "${refinementRequest}". 
    Return the refined meal plan in the same JSON format.
    Current meal plan: ${JSON.stringify(mealPlan)}`;

        const refinedMealPlanText = await generateGeminiResponse(prompt, []);
        const refinedMealPlan = JSON.parse(refinedMealPlanText);

        // Generate updated shopping list using Kroger API
        const shoppingList = await generateShoppingList(refinedMealPlan);

        res.json({ refinedMealPlan, shoppingList });
    } catch (error) {
        console.error('Error in refine-meal-plan route:', error);
        res.status(500).json({ error: error.message });
    }
});

async function generateShoppingList(mealPlan) {
    const ingredients = mealPlan.meals.flatMap(meal => meal.ingredients);
    const shoppingList = [];

    for (const ingredient of ingredients) {
        try {
            const products = await searchProducts(ingredient);
            if (products.length > 0) {
                shoppingList.push({
                    ingredient,
                    product: products[0]
                });
            } else {
                shoppingList.push({
                    ingredient,
                    message: 'No matching product found'
                });
            }
        } catch (error) {
            console.error(`Error searching for product: ${ingredient}`, error);
            shoppingList.push({
                ingredient,
                error: 'Error searching for product'
            });
        }
    }

    return shoppingList;
}

module.exports = router;