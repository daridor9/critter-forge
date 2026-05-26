import { useMemo, useState } from 'react';
import type { Creature } from '../types';
import type { MakerStamp } from '../data/family';
import { buildShareLink } from '../utils/shareLink';
import { generateQrSvg } from '../utils/qr';
import { CreatureSVG } from './CreatureSVG';
import { VENUE_META } from '../data/battle';
import type { Venue } from '../data/battle';

interface Props {
  creature: Creature;
  maker: MakerStamp | null;
  onClose: () => void;
  onCopied?: () => void;
}

export function ShareModal({ creature, maker, onClose, onCopied }: Props) {
  const [asChallenge, setAsChallenge] = useState(false);
  const [venue, setVenue] = useState<Venue>('brawl');
  const [copied, setCopied] = useState(false);

  const url = useMemo(
    () => buildShareLink(creature, maker, asChallenge ? venue : undefined),
    [creature, maker, asChallenge, venue],
  );

  const qrSvg = useMemo(() => {
    try {
      return generateQrSvg(url, 6, 2);
    } catch {
      return null;
    }
  }, [url]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      onCopied?.();
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt('Copy this link:', url);
    }
  }

  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="about-modal share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="about-head">
          <h2>🔗 Share creature</h2>
          <button className="about-close" type="button" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="about-content">
          <div className="share-creature-row">
            <div className="share-thumb"><CreatureSVG creature={creature} /></div>
            <div className="share-meta">
              <h3 className="share-name">{creature.name}</h3>
              {maker && (
                <div className="album-maker share-maker" style={{ background: maker.color, borderColor: maker.color }}>
                  <span className="album-maker-emoji">{maker.emoji}</span>
                  <span className="album-maker-name">by {maker.name}</span>
                </div>
              )}
              {!maker && (
                <p className="share-no-maker">No family player active — link won't carry a maker tag. Add one in 👥 Family.</p>
              )}
            </div>
          </div>

          <label className="share-challenge-toggle">
            <input
              type="checkbox"
              checked={asChallenge}
              onChange={(e) => setAsChallenge(e.target.checked)}
            />
            <span>⚔️ Send as a battle challenge</span>
          </label>

          {asChallenge && (
            <div className="share-venue-row">
              <span className="share-venue-label">Venue:</span>
              {(['brawl', 'race', 'maze', 'dive'] as Venue[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`pill${venue === v ? ' active' : ''}`}
                  onClick={() => setVenue(v)}
                >
                  {VENUE_META[v].emoji} {VENUE_META[v].label}
                </button>
              ))}
            </div>
          )}

          <div className="share-payload">
            <div className="share-qr">
              {qrSvg ? (
                <div
                  className="share-qr-svg"
                  // qr.ts returns a sanitized inline SVG with no scripts
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              ) : (
                <div className="share-qr-fail">QR too large — use the link instead.</div>
              )}
              <p className="share-qr-help">Point another iPad's camera at this code</p>
            </div>
            <div className="share-url-block">
              <textarea
                readOnly
                value={url}
                className="share-url"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
              <button className="btn" type="button" onClick={copy}>
                {copied ? '✓ Copied!' : '📋 Copy link'}
              </button>
              <p className="share-url-help">
                {asChallenge
                  ? `Opens the receiver's app straight into a ${VENUE_META[venue].label} match.`
                  : 'Opens the receiver\'s app and auto-saves the creature to their album.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
