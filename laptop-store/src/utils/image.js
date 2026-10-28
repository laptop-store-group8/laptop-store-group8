export const FALLBACK_IMAGE = '/no-image.svg';

export const handleImageError = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = FALLBACK_IMAGE;
};
