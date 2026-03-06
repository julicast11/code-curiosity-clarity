import { useState, useEffect } from 'react';
import { LogoMark } from './Logo';
import { getLastWeekRange } from '../utils/dates';

export default function SplashScreen({ onDone }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 2000);
    const t2 = setTimeout(() => onDone(), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className={`splash ${fadeOut ? 'fade-out' : ''}`}>
      <div className="splash-logo">
        <LogoMark size={72} animate />
      </div>
      <div className="splash-title">
        <span className="gold">Code</span>, <span className="italic">Curiosity</span> & Clarity
      </div>
      <div className="splash-subtitle">by Julicast</div>
      <div className="splash-week">Week of {getLastWeekRange()}</div>
    </div>
  );
}
