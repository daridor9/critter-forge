import { useEffect, useMemo, useState } from 'react';
import { generateQrSvg } from '../utils/qr';

interface Props {
  onClose: () => void;
}

// The deployed game URL. Hardcoded so the QR/copy always points at the
// hosted version (not at a local dev port the kid happens to be testing on).
const GAME_URL = 'https://daridor9.github.io/critter-forge/';

// Cross-browser beforeinstallprompt event type. Chrome/Edge fire this when
// the PWA is installable; Safari iOS doesn't fire it (needs manual share→add).
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function GameShareModal({ onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  // Listen for the install prompt — Chrome/Edge fire this when the PWA is
  // installable; we capture it and use it later when the user clicks Install.
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function installApp() {
    if (!installPromptEvent) return;
    await installPromptEvent.prompt();
    const choice = await installPromptEvent.userChoice;
    if (choice.outcome === 'accepted') setInstalled(true);
    setInstallPromptEvent(null);
  }

  // Detect iOS to show the "use Share → Add to Home Screen" hint, since iOS
  // Safari doesn't expose a programmatic install prompt.
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as { standalone?: boolean }).standalone === true;

  const qrSvg = useMemo(() => {
    try {
      // bigger scale = bigger QR squares; chunky margin = safer for cameras
      return generateQrSvg(GAME_URL, 8, 3);
    } catch {
      return null;
    }
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(GAME_URL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt('Copy this link:', GAME_URL);
    }
  }

  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="about-modal share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="about-head">
          <h2>📲 Share the game</h2>
          <button className="about-close" type="button" onClick={onClose} aria-label="Close">×</button>
        </div>
        <p style={{ marginBottom: 16 }}>
          Scan this QR code with a phone camera to open Critter Forge — no install needed.
          Works on any device with a browser. Share it with a friend!
        </p>
        <div className="game-share-qr">
          {qrSvg
            ? <div className="qr-block" dangerouslySetInnerHTML={{ __html: qrSvg }} />
            : <p className="qr-error">(QR code couldn't render — copy the link below instead.)</p>}
        </div>
        <div className="game-share-url">
          <code>{GAME_URL}</code>
        </div>

        {/* Install affordance — Chrome/Edge use beforeinstallprompt;
            iOS Safari needs a manual Share → Add to Home Screen tap. */}
        {!isStandalone && (
          <div className="game-share-install">
            {installed ? (
              <p className="install-installed">✓ Installed! Look for the Critter Forge icon on your home screen.</p>
            ) : installPromptEvent ? (
              <button className="btn install-btn" type="button" onClick={installApp}>
                📲 Install on this device
              </button>
            ) : isIos ? (
              <p className="install-hint">
                <strong>On iPhone/iPad:</strong> tap the Share button <span style={{ fontSize: 18 }}>⎙</span> in
                Safari, then <strong>Add to Home Screen</strong>. The game becomes a real app icon.
              </p>
            ) : (
              <p className="install-hint">
                <strong>Tip:</strong> your browser may offer an Install button in the address bar — look for an
                install icon to add this game as a real app on your device.
              </p>
            )}
          </div>
        )}

        <div className="battle-controls" style={{ marginTop: 12 }}>
          <button className="btn" type="button" onClick={copyLink}>
            {copied ? '✓ Copied!' : '📋 Copy link'}
          </button>
          <button className="btn btn-secondary" type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
