
import { useState, useEffect } from 'react';

export const usePremium = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPremiumStatus = () => {
      const premiumUser = localStorage.getItem('premiumUser');
      const premiumExpiry = localStorage.getItem('premiumExpiry');
      
      if (premiumUser === 'true' && premiumExpiry) {
        const expiryDate = new Date(premiumExpiry);
        const now = new Date();
        
        if (expiryDate > now) {
          setIsPremium(true);
        } else {
          // Premium expired
          localStorage.removeItem('premiumUser');
          localStorage.removeItem('premiumExpiry');
          setIsPremium(false);
        }
      } else {
        setIsPremium(false);
      }
      
      setIsLoading(false);
    };

    checkPremiumStatus();
  }, []);

  return { isPremium, isLoading };
};
