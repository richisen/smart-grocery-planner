import React, { useState } from 'react';
import './App.css';
import UserInputForm from './components/UserInputForm';
import MealPlan from './components/MealPlan';
import ShoppingList from './components/ShoppingList';

function App() {
  const [mealPlan, setMealPlan] = useState(null);
  const [shoppingList, setShoppingList] = useState(null);

  const handleMealPlanGenerated = (generatedMealPlan) => {
    setMealPlan(generatedMealPlan);
    setShoppingList(null);
  };

  const handleShoppingListGenerated = (generatedShoppingList) => {
    setShoppingList(generatedShoppingList);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Smart Grocery Planner</h1>
      </header>
      <main>
        <UserInputForm onMealPlanGenerated={handleMealPlanGenerated} />
        {mealPlan && (
          <MealPlan
            mealPlan={mealPlan}
            onShoppingListGenerated={handleShoppingListGenerated}
          />
        )}
        {shoppingList && <ShoppingList shoppingList={shoppingList} />}
      </main>
    </div>
  );
}

export default App;