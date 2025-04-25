/**
 * Выбирает подходящий плейсхолдер для изображения в зависимости от категории техники
 * @param {string} categoryName - Название категории техники
 * @returns {string} - Путь к изображению-плейсхолдеру
 */
export const getPlaceholderImage = (categoryName) => {
  if (!categoryName) return '/images/placeholders/vehicle.svg';
  
  const categoryLower = categoryName.toLowerCase();
  
  if (categoryLower.includes('груз') || categoryLower.includes('самосвал')) {
    return '/images/placeholders/truck.svg';
  } else if (categoryLower.includes('экскаватор')) {
    return '/images/placeholders/excavator.svg';
  } else if (categoryLower.includes('кран')) {
    return '/images/placeholders/crane.svg';
  }
  
  // Возвращаем общий плейсхолдер, если категория не соответствует ни одному из специальных
  return '/images/placeholders/vehicle.svg';
}; 