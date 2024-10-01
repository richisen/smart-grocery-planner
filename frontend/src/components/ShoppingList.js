import React from 'react';

function ShoppingList({ shoppingList }) {
    return (
        <div className="shopping-list">
            <h2>Your Shopping List</h2>
            <ul>
                {shoppingList.map((item, index) => (
                    <li key={index}>
                        {item.ingredient}
                        {item.product && (
                            <span>
                                {' '}
                                - {item.product.description || 'No description available'}
                                {item.product.items && item.product.items[0] && item.product.items[0].price ? (
                                    ` ($${item.product.items[0].price.regular})`
                                ) : (
                                    ' (Price not available)'
                                )}
                            </span>
                        )}
                        {item.error && <span className="error"> - {item.error}</span>}
                        {item.message && <span className="message"> - {item.message}</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ShoppingList;