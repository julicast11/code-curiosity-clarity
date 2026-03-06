export default function PlaceholderSection({ emoji, name }) {
  return (
    <div className="placeholder-section">
      <div className="placeholder-emoji">{emoji}</div>
      <div className="placeholder-name">{name}</div>
      <div className="placeholder-soon">Coming soon</div>
    </div>
  );
}
