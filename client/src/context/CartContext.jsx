import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';


const CartContext = createContext();

export function CartProvider({ children }) {

    const { user } = useAuth();

    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });


    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);


    useEffect(() => {
        if (!user) {
            setCart([]);
        }
    }, [user]);


    const addToCart = (productToAdd) => {
        setCart(currentCartItems => {
            let productAlreadyInCart = false;
            const newListOfCartItems = [];

            for (let i = 0; i < currentCartItems.length; i++) {
                const existingItem = currentCartItems[i];

                if (existingItem.id === productToAdd.id) {
                    productAlreadyInCart = true;

                    const updatedItem = {
                    ...existingItem,
                    quantity: existingItem.quantity + 1
                    };
                    newListOfCartItems.push(updatedItem);
                } else {
                    newListOfCartItems.push(existingItem);
                }
            }

            if (!productAlreadyInCart) {
                const newItem = {
                    ...productToAdd,
                    quantity: 1
                };
                newListOfCartItems.push(newItem);
            }

            return newListOfCartItems;
        });
    };

    const removeFromCart = (productIdToRemove) => {
        setCart(currentCartItems => {
            const newListOfCartItems = [];

            for (let i = 0; i < currentCartItems.length; i++) {
                const currentItem = currentCartItems[i];

                if (currentItem.id !== productIdToRemove) {
                    newListOfCartItems.push(currentItem);
                }
            }

            return newListOfCartItems;
        });
    };

    const updateQuantity = (productIdToUpdate, newQuantity) => {
        if (newQuantity < 1) {
            return;
        }

        setCart(currentCartItems => {
            const newListOfCartItems = [];

            for (let i = 0; i < currentCartItems.length; i++) {
                const currentItem = currentCartItems[i];

                if (currentItem.id === productIdToUpdate) {
                    const updatedItem = {
                    ...currentItem,
                    quantity: newQuantity
                    };
                    newListOfCartItems.push(updatedItem);
                } else {
                    newListOfCartItems.push(currentItem);
                }
            }

            return newListOfCartItems;
        });
    };

    const clearCart = () => {
        setCart([]);
    };

    const value = {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    return useContext(CartContext);
};