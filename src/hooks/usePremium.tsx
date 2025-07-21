
import { useState, useEffect } from 'react';

export const usePremium = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPremiumStatus = () => {
      // Set premium status for user
      localStorage.setItem('premiumUser', 'true');
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year premium
      localStorage.setItem('premiumExpiry', expiryDate.toISOString());
      setIsPremium(true);
      setIsLoading(false);
    };

    checkPremiumStatus();
  }, []);

  return { isPremium, isLoading };
};
