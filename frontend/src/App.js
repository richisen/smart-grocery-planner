import React, { useState } from 'react';
import './App.css';
import ChatInterface from './components/ChatInterface';
import MealPlan from './components/MealPlan';
import ShoppingList from './components/ShoppingList';

function App() {
  const [mealPlan, setMealPlan] = useState(null);
  const [shoppingList, setShoppingList] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  const handleMealPlanGenerated = (generatedMealPlan, generatedShoppingList) => {
    setMealPlan(generatedMealPlan);
    setShoppingList(generatedShoppingList);
  };

  const handleChatMessage = (message, isUser) => {
    setChatHistory(prev => [...prev, { text: message, isUser }]);
  };

  const handleRefinementRequest = (refinedMealPlan, refinedShoppingList) => {
    setMealPlan(refinedMealPlan);
    setShoppingList(refinedShoppingList);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Smart Grocery Planner</h1>
      </header>
      <main>
        {!mealPlan ? (
          <ChatInterface
            onMealPlanGenerated={handleMealPlanGenerated}
            onChatMessage={handleChatMessage}
          />
        ) : (
          <>
            <MealPlan
              mealPlan={mealPlan}
              onRefinementRequest={handleRefinementRequest}
            />
            <ShoppingList shoppingList={shoppingList} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;