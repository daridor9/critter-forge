export function AchievementToast({ name, emoji }: { name: string; emoji: string }) {
  return (
    <div className="ach-toast">
      <div className="ach-toast-emoji">{emoji}</div>
      <div>
        <div className="ach-toast-title">Achievement unlocked!</div>
        <div className="ach-toast-name">{name}</div>
      </div>
    </div>
  );
}
