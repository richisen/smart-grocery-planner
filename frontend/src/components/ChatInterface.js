import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const INITIAL_PROMPT = `You are an AI assistant helping to plan meals. Start by asking the user about the number of meals, number of people, and any dietary restrictions. Then, ask follow-up questions based on their responses. Explore topics like cuisine preferences, cooking skill level, time constraints for meal preparation, and any other factors you think are important for meal planning. Ask one question at a time and wait for the user's response before asking the next question. Once you have gathered sufficient information, say "Thank you for providing all this information. I'll now generate a meal plan for you."`;

function ChatInterface({ onMealPlanGenerated, onChatMessage }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isWaitingForAI, setIsWaitingForAI] = useState(true);

    const getAIResponse = useCallback(async (userInput, isInitial = false) => {
        try {
            const response = await axios.post('/api/chat', {
                message: userInput,
                history: messages,
                isInitial: isInitial
            });
            handleChatMessage(response.data.message, false);
            setIsWaitingForAI(false);

            if (response.data.message.includes("I'll now generate a meal plan for you.")) {
                await generateMealPlan();
            }
        } catch (error) {
            console.error('Error getting AI response:', error);
            handleChatMessage('Sorry, there was an error. Please try again.', false);
            setIsWaitingForAI(false);
        }
    }, [messages]);

    useEffect(() => {
        if (messages.length === 0) {
            getAIResponse(INITIAL_PROMPT, true);
        }
    }, []); // Remove getAIResponse from the dependency array

    const handleUserInput = async () => {
        if (input.trim() === '') return;

        handleChatMessage(input, true);
        setInput('');
        setIsWaitingForAI(true);
        await getAIResponse(input);
    };

    const handleChatMessage = (message, isUser) => {
        setMessages(prev => [...prev, { text: message, isUser }]);
        onChatMessage(message, isUser);
    };

    const generateMealPlan = async () => {
        try {
            const response = await axios.post('/api/generate-meal-plan', { chatHistory: messages });
            onMealPlanGenerated(response.data.mealPlan, response.data.shoppingList);
        } catch (error) {
            console.error('Error generating meal plan:', error);
            handleChatMessage('Sorry, there was an error generating your meal plan. Please try again.', false);
        }
    };

    return (
        <div className="chat-interface">
            <div className="chat-messages">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.isUser ? 'user' : 'bot'}`}>
                        {message.text}
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isWaitingForAI && handleUserInput()}
                    disabled={isWaitingForAI}
                />
                <button onClick={handleUserInput} disabled={isWaitingForAI}>Send</button>
            </div>
        </div>
    );
}

export default ChatInterface;