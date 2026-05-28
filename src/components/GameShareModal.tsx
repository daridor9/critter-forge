import { useMemo, useState } from 'react';
import { generateQrSvg } from '../utils/qr';

interface Props {
  onClose: () => void;
}

// The deployed game URL. Hardcoded so the QR/copy always points at the
// hosted version (not at a local dev port the kid happens to be testing on).
const GAME_URL = 'https://daridor9.github.io/critter-forge/';

export function GameShareModal({ onClose }: Props) {
  const [copied, setCopied] = useState(false);

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
