import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaDiscord, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import Header from './Header';
import LiveChatPanel from '../chat/LiveChatPanel';
import { useGame } from '../../context/GameContext';
import pkgJson from '../../../package.json';

const APP_VERSION = pkgJson.version;

export default function MainLayout({
  children,
  user,
  onLogout,
  credits,
  onLoginTrigger,
}) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { gameInfo } = useGame();

  return (
    <div className="relative min-h-screen w-full flex flex-col font-sans text-theme-text transition-colors duration-500">
      {/* Background that spans the entire app, can be covered by views */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center pointer-events-none opacity-[0.12] transition-all duration-500"
        style={{
          backgroundImage: (() => {
            const bg =
              gameInfo?.assets?.portada ||
              gameInfo?.assets?.heroBackground ||
              "none";
            return bg === "none" ? "none" : `url('${bg}')`;
          })(),
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-t from-theme-dark via-theme-dark/85 to-theme-dark/30 pointer-events-none transition-colors duration-500" />

      {/* Main UI Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          user={user}
          onLogout={onLogout}
          onToggleChat={() => setIsChatOpen(!isChatOpen)}
          credits={credits}
          onLoginTrigger={onLoginTrigger}
        />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-theme-neon/20 bg-theme-dark/80 backdrop-blur-md py-6 text-center text-sm text-theme-muted transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">

            {/* Version Badge */}
            <span className="text-[10px] font-mono tracking-widest text-theme-muted/60 uppercase">
              DeathCloud v{APP_VERSION}
            </span>

            {/* Social Media Links */}
            <div className="flex items-center gap-4 text-theme-muted">
              <a
                href="https://discord.gg"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-theme-neon hover:scale-110 transition-all"
                title="Discord Oficial"
              >
                <FaDiscord size={18} />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-theme-neon hover:scale-110 transition-all"
                title="Twitter/X Oficial"
              >
                <FaTwitter size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-theme-neon hover:scale-110 transition-all"
                title="Instagram Oficial"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-theme-neon hover:scale-110 transition-all"
                title="Canal de YouTube"
              >
                <FaYoutube size={18} />
              </a>
            </div>
          </div>
        </footer>
      </div>

      <LiveChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        user={user}
        onLoginTrigger={onLoginTrigger}
      />


    </div>
  );
}

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
  user: PropTypes.object,
  onLogout: PropTypes.func.isRequired,
  credits: PropTypes.number,
  onLoginTrigger: PropTypes.func.isRequired,
};
