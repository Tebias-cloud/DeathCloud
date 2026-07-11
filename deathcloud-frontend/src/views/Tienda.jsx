import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiShoppingBag, FiTag } from 'react-icons/fi';
import PurchaseModal from '../components/store/PurchaseModal';

import { useGame } from '../context/GameContext';

export default function Tienda({ user, credits, purchasedSkins, buySkin, onLoginTrigger }) {
  const { gameInfo } = useGame();
  const [activeCategory, setActiveCategory] = useState('todos');
  const [selectedItem, setSelectedItem] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);

  const filteredItems = activeCategory === 'todos' 
    ? gameInfo.store
    : gameInfo.store.filter(item => item.category === activeCategory);

  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    if (!selectedItem || isProcessing) return;
    setPurchaseError(null);
    setIsProcessing(true);

    const balance = credits === undefined ? 0 : credits;
    if (balance < selectedItem.price) {
      setPurchaseError(`E-Points insuficientes. Se requieren ${selectedItem.price} EP y tu saldo es ${balance} EP.`);
      setIsProcessing(false);
      return;
    }

    if (buySkin) {
      const result = await buySkin(gameInfo.id, selectedItem.id, selectedItem.price);
      if (result.success) {
        setPurchaseSuccess(true);
      } else {
        setPurchaseError(result.message || 'Error al procesar la compra.');
      }
    } else {
      setPurchaseSuccess(true);
    }
    setIsProcessing(false);
  };

  return (
    <div className="flex-1 flex flex-col pb-8 pt-4 lg:pt-8 fade-in max-w-6xl mx-auto w-full transition-all duration-500">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-theme-neon/20 pb-6 mb-8 gap-4">
        <div>
          <h1 className="font-display font-black text-4xl text-white tracking-wide uppercase flex items-center gap-3" style={{ textShadow: '0 0 12px var(--theme-neon-glow)' }}>
            <FiShoppingBag className="text-theme-neon" /> Tienda del Sector
          </h1>
          <p className="text-theme-muted uppercase tracking-[0.2em] text-[10px] font-semibold mt-1">
            Adquiere artículos virtuales exclusivos con tus E-Points
          </p>
        </div>

        {user ? (
          <div className="bg-theme-neon/5 border border-theme-neon/30 px-5 py-3 rounded-2xl flex flex-col text-right shadow-neon-sm min-w-[150px]">
            <span className="text-[9px] uppercase tracking-widest font-black text-theme-muted">Tu Saldo Activo</span>
            <span className="text-xl font-black text-theme-neon font-mono mt-0.5">{credits?.toLocaleString() ?? '0'} EP</span>
          </div>
        ) : (
          <div className="bg-black/40 border border-white/5 px-5 py-4 rounded-2xl flex items-center justify-center min-w-[150px] opacity-60">
            <span className="text-[10px] uppercase tracking-widest font-black text-theme-muted">Inicia sesión para ver tu saldo</span>
          </div>
        )}
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex gap-2 mb-8 bg-black/40 p-1.5 rounded-xl border border-white/5 w-fit">
        {['todos', 'aspectos', 'armas', 'iconos'].map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              activeCategory === cat
                ? 'bg-theme-neon text-theme-dark shadow-neon'
                : 'text-theme-muted hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => {
          const isOwned = purchasedSkins?.includes(item.id);
          return (
            <div key={item.id} className="group relative bg-black/40 border border-white/10 rounded-2xl overflow-hidden hover:border-theme-neon/30 transition-all duration-500 hover:shadow-neon flex flex-col">
              {/* Image Area - No nested borders, just a smooth gradient background */}
              <div className="relative w-full h-48 flex items-center justify-center p-6 bg-gradient-to-b from-white/5 to-transparent transition-colors group-hover:from-theme-neon/5">
                <img src={item.image} alt={item.title} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" style={{ filter: 'drop-shadow(0 0 15px var(--theme-neon-glow))' }} />
              </div>

              {/* Content Area */}
              <div className="p-5 flex flex-col flex-1 relative z-10">
                <span className={`text-[10px] ${item.rarityColor} font-black uppercase tracking-widest mb-1`}>{item.rarity}</span>
                <h3 className="font-bold text-base text-white group-hover:text-theme-neon transition-colors cursor-pointer">{item.title}</h3>
                <p className="text-xs text-theme-muted mt-2 leading-relaxed flex-1 opacity-80">{item.description}</p>
                
                <div className="pt-4 mt-4 flex items-center justify-between border-t border-white/5">
                  <span className="text-xs font-black text-white flex items-center gap-1">
                    <FiTag className="text-theme-neon" /> {item.price} EP
                  </span>
                  <button 
                    onClick={() => {
                      if (!user) {
                        if (onLoginTrigger) onLoginTrigger();
                        return;
                      }
                      if (isOwned) return;
                      setSelectedItem(item);
                      setPurchaseSuccess(false);
                      setPurchaseError(null);
                    }}
                    disabled={isOwned}
                    className={`neon-button border rounded-lg px-5 py-2 text-xs font-bold transition-all ${
                      isOwned 
                        ? 'bg-theme-success/10 border-theme-success/30 text-theme-success cursor-default shadow-none' 
                        : 'border-theme-neon/40 bg-theme-neon/10 hover:bg-theme-neon hover:text-theme-dark'
                    }`}
                  >
                    {isOwned ? 'Adquirido' : 'Adquirir'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Purchase Dialog Modal */}
      <PurchaseModal 
        selectedItem={selectedItem}
        purchaseSuccess={purchaseSuccess}
        purchaseError={purchaseError}
        user={user}
        credits={credits}
        isProcessing={isProcessing}
        onClose={() => setSelectedItem(null)}
        onPurchase={handlePurchase}
      />

    </div>
  );
}

Tienda.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    rol: PropTypes.string,
    name: PropTypes.string,
    nickname: PropTypes.string,
    nombre_usuario: PropTypes.string
  }),
  credits: PropTypes.number,
  purchasedSkins: PropTypes.arrayOf(PropTypes.string),
  buySkin: PropTypes.func,
  onLoginTrigger: PropTypes.func
};
