import { useState, useEffect, useCallback } from 'react';

const getApiUrl = (path) => {
  const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/api$/, '');
  return `${base}/api${path}`;
};

export const useInventory = (user, gameId) => {
  const [credits, setCredits] = useState(0);
  const [purchasedSkins, setPurchasedSkins] = useState([]);

  const fetchGameUserData = useCallback(async () => {
    if (!user?.token) {
      // Async defer to avoid sync setState in effect warning
      Promise.resolve().then(() => {
        setCredits(0);
        setPurchasedSkins([]);
      });
      return;
    }

    try {
      const headers = { 'Authorization': `Bearer ${user.token}` };
      
      // 1. Get global credits
      const credRes = await fetch(getApiUrl('/credits'), { headers });
      const credData = await credRes.json();
      if (credData.success) {
        setCredits(credData.credits);
      }

      // 2. Get purchased skins (Global Inventory)
      const skinsRes = await fetch(getApiUrl('/inventory'), { headers });
      const skinsData = await skinsRes.json();
      if (skinsData.success) {
        setPurchasedSkins(skinsData.skins);
      }
    } catch (err) {
      console.error("Error fetching game user data from backend:", err);
    }
  }, [user?.token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGameUserData();
  }, [fetchGameUserData, gameId]); // Re-fetch when user or active game changes

  const buySkin = useCallback(async (currentGameId, skinId, price) => {
    if (!user) return { success: false, message: "Inicia sesión para realizar la compra." };
    
    try {
      const res = await fetch(getApiUrl(`/game/${currentGameId}/skins/buy`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ skinId, price })
      });
      
      const data = await res.json();
      if (data.success) {
        // Optimize: Update local state without triggering a new fetch
        setCredits(data.credits);
        setPurchasedSkins(prev => [...prev, skinId]);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error("Error buying skin:", err);
      return { success: false, message: "Error de red al procesar la compra." };
    }
  }, [user]);

  return {
    credits,
    purchasedSkins,
    buySkin,
    refreshInventory: fetchGameUserData
  };
};
