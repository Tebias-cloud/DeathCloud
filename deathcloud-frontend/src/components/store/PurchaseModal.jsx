import React from 'react';
import PropTypes from 'prop-types';
import { FiX, FiCheckCircle, FiShoppingBag, FiAlertTriangle } from 'react-icons/fi';

export default function PurchaseModal({ 
  selectedItem, 
  purchaseSuccess, 
  purchaseError, 
  user, 
  credits, 
  isProcessing, 
  onClose, 
  onPurchase 
}) {
  if (!selectedItem) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel border border-theme-neon/40 shadow-neon-strong p-6 rounded-2xl relative text-center">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-theme-muted hover:text-white transition-colors"
        >
          <FiX size={20} />
        </button>

        {purchaseSuccess ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <FiCheckCircle className="text-theme-success animate-bounce" size={56} />
            <h3 className="font-display font-bold text-xl text-white uppercase tracking-wider">¡COMPRA EXITOSA!</h3>
            <p className="text-xs text-theme-muted leading-relaxed">
              Has adquirido correctamente la <strong>{selectedItem.title}</strong>.<br/>
              Se han descontado {selectedItem.price} EP de tu cuenta.
            </p>
            <button 
              onClick={onClose}
              className="mt-4 neon-button border border-theme-neon rounded-lg px-8 py-2 bg-theme-neon text-theme-dark font-bold hover:shadow-neon transition-all"
            >
              ACEPTAR
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-2">
            <FiShoppingBag className="text-theme-neon" size={48} />
            <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">CONFIRMAR ADQUISICIÓN</h3>
            
            <div className="bg-black/40 border border-white/5 p-4 rounded-xl w-full text-left my-2">
              <div className="flex justify-between font-bold text-sm text-white">
                <span>{selectedItem.title}</span>
                <span className="text-theme-neon">{selectedItem.price} EP</span>
              </div>
              <p className="text-[11px] text-theme-muted mt-2 leading-relaxed">{selectedItem.description}</p>
            </div>

            {purchaseError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-center gap-2 w-full text-left font-semibold">
                <FiAlertTriangle size={16} className="flex-shrink-0" />
                <span>{purchaseError}</span>
              </div>
            )}

            <div className="text-xs text-theme-muted my-1">
              Saldo actual: <span className="font-bold text-white">{user ? (credits?.toLocaleString() ?? '0') : '—'} EP</span>
            </div>

            <div className="flex gap-4 w-full mt-2">
              <button 
                onClick={onClose}
                className="flex-1 border border-white/10 hover:border-white/35 rounded-lg py-2.5 text-xs font-bold text-theme-muted transition-colors"
              >
                CANCELAR
              </button>
              <button 
                onClick={onPurchase}
                disabled={isProcessing}
                className={`flex-1 neon-button border border-theme-neon rounded-lg py-2.5 text-xs font-bold transition-all shadow-neon-sm ${isProcessing ? 'bg-theme-neon/50 text-theme-dark cursor-wait' : 'bg-theme-neon/15 text-theme-neon hover:bg-theme-neon hover:text-theme-dark'}`}
              >
                {isProcessing ? 'PROCESANDO...' : 'ADQUIRIR'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

PurchaseModal.propTypes = {
  selectedItem: PropTypes.object,
  purchaseSuccess: PropTypes.bool.isRequired,
  purchaseError: PropTypes.string,
  user: PropTypes.object,
  credits: PropTypes.number,
  isProcessing: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onPurchase: PropTypes.func.isRequired
};
