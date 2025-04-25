import React, { createContext, useState, useContext, useEffect } from 'react';

// Создаем контекст
const CartContext = createContext();

// Кастомный хук для использования контекста корзины
export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  // Инициализация состояния корзины из localStorage, если оно есть
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Сохранение корзины в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Добавление товара в корзину
  const addToCart = (product) => {
    setCart(prevItems => {
      // Проверяем, есть ли товар уже в корзине
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);

      if (existingItemIndex > -1) {
        // Если товар уже в корзине, увеличиваем количество
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        return updatedItems;
      } else {
        // Если товара нет в корзине, добавляем его с количеством 1
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  // Удаление товара из корзины
  const removeFromCart = (productId) => {
    setCart(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Изменение количества товара
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setCart(prevItems => 
      prevItems.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };

  // Очистка корзины
  const clearCart = () => {
    setCart([]);
  };

  // Подсчет общего количества товаров в корзине
  const getItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Подсчет общей стоимости корзины
  const getTotalPrice = () => {
    return cart.reduce(
      (total, item) => total + item.price * item.quantity, 
      0
    );
  };

  // Значение контекста, которое будет доступно компонентам
  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemCount,
    getTotalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext; 