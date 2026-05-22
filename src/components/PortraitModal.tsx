import { useState, useEffect } from 'react';
import type { Creature } from '../types';
import { generatePortraitPrompt } from '../utils/portraitPrompt';
import { getPortrait, setPortrait, removePortrait } from '../data/portraits';

interface Props {
  creature: Creature;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────
// PortraitModal — "AI portrait" workflow for a creature.
//
// Today we can't generate images on the GitHub Pages static deploy. What we
// CAN do is hand the user a vivid prompt they paste into any image AI, then
// let them paste the resulting image URL back here so it's saved per-creature
// in localStorage. Portraits persist between sessions in the same browser.
// ─────────────────────────────────────────────────────────────────────────

export function PortraitModal({ creature, onClose }: Props) {
  const [prompt, setPrompt] = useState(() => generatePortraitPrompt(creature));
  const [url, setUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState<string | null>(() => getPortrait(creature));
  const [copied, setCopied] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Regenerate the prompt whenever the creature changes (parent passes a new
  // one if the user closes & reopens after editing).
  useEffect(() => {
    setPrompt(generatePortraitPrompt(creature));
    setSavedUrl(getPortrait(creature));
    setUrl('');
    setPreviewError(false);
  }, [creature]);

  function handleCopy() {
    navigator.clipboard.writeText(prompt).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      },
      () => { /* clipboard blocked; let user copy manually */ }
    );
  }

  function handlePreview() {
    if (!url.trim()) return;
    setPreviewLoading(true);
    setPreviewError(false);
  }

  function handleSave() {
    const trimmed = url.trim();
    if (!trimmed) return;
    setPortrait(creature, trimmed);
    setSavedUrl(trimmed);
    setUrl('');
  }

  function handleRemove() {
    removePortrait(creature);
    setSavedUrl(null);
  }

  const aiOptions = [
    { label: 'Claude', url: 'https://claude.ai' },
    { label: 'ChatGPT', url: 'https://chat.openai.com' },
    { label: 'Bing Image Creator', url: 'https://www.bing.com/images/create' },
    { label: 'Midjourney', url: 'https://www.midjourney.com' },
  ];

  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="about-modal portrait-modal" onClick={(e) => e.stopPropagation()}>
        <div className="about-head">
          <h2>✨ Portrait of {creature.name}</h2>
          <button className="about-close" type="button" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="about-content portrait-content">
          {savedUrl ? (
            <div className="portrait-saved">
              <div className="portrait-saved-image">
                <img
                  src={savedUrl}
                  alt={`Portrait of ${creature.name}`}
                  onError={() => setSavedUrl(null)}
                />
              </div>
              <div className="portrait-saved-actions">
                <p className="portrait-saved-note">
                  Saved to this browser. Looks good?
                </p>
                <button type="button" className="btn btn-secondary" onClick={handleRemove}>
                  🗑 Remove this portrait
                </button>
              </div>
            </div>
          ) : (
            <p className="dedication">
              No portrait yet for this critter. Copy the prompt below, paste it into any AI image generator,
              then paste the resulting image URL back here to save it.
              Portraits live in your browser and persist across sessions.
            </p>
          )}

          <div className="portrait-section">
            <div className="portrait-section-head">
              <h3>1 — Copy the prompt</h3>
              <button
                type="button"
                className={copied ? 'btn btn-secondary' : 'btn'}
                onClick={handleCopy}
              >
                {copied ? '✓ Copied' : '📋 Copy prompt'}
              </button>
            </div>
            <textarea
              className="portrait-prompt-textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={9}
              spellCheck={false}
            />
            <p className="portrait-hint">
              Edit before copying if you want a different style.
              The prompt asks for kawaii Pokémon-style watercolor — change "Style:" to taste.
            </p>
          </div>

          <div className="portrait-section">
            <h3>2 — Generate an image</h3>
            <p className="portrait-hint">
              Open any AI image generator and paste your prompt. Then copy the image's address (right-click → Copy image address).
            </p>
            <div className="portrait-ai-links">
              {aiOptions.map(({ label, url }) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="portrait-ai-link">
                  {label} ↗
                </a>
              ))}
            </div>
          </div>

          <div className="portrait-section">
            <h3>3 — {savedUrl ? 'Replace the saved portrait' : 'Save your portrait'}</h3>
            <div className="portrait-url-row">
              <input
                type="text"
                className="portrait-url-input"
                placeholder="Paste image URL (https://...)"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setPreviewError(false); }}
                onBlur={handlePreview}
              />
              <button type="button" className="btn" onClick={handleSave} disabled={!url.trim()}>
                {savedUrl ? '↻ Replace' : '💾 Save'}
              </button>
            </div>
            {url.trim() && !previewError && (
              <div className="portrait-preview">
                <p className="portrait-hint">Preview:</p>
                <img
                  src={url.trim()}
                  alt="Portrait preview"
                  onLoad={() => { setPreviewLoading(false); setPreviewError(false); }}
                  onError={() => { setPreviewLoading(false); setPreviewError(true); }}
                  style={{ opacity: previewLoading ? 0.5 : 1 }}
                />
              </div>
            )}
            {previewError && (
              <p className="portrait-error">
                Couldn't load that image — check the URL is direct to an image file (ends in .png/.jpg/.webp).
                Some sites block hot-linking; try downloading and re-uploading to a host like Imgur.
              </p>
            )}
          </div>

          <details className="portrait-howto">
            <summary>Tip: where to host images that other devices can see</summary>
            <p>
              Saving the URL only works on the browser you saved it on, and only if the URL stays alive.
              For a portrait you want to keep long-term, upload the image to a free image host
              (Imgur, GitHub user-content, your own static hosting) and use the direct image URL.
              For a portrait that should ship with the game, save the PNG into <code>public/portraits/</code>
              in the repo and reference it as <code>/critter-forge/portraits/your-file.png</code>.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}
