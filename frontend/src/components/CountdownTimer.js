import React, { useEffect, useState } from 'react';

function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  function calculateTimeLeft() {
    const difference = new Date(targetDate) - new Date();
    if (difference <= 0) return null;

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  if (!timeLeft) {
    return <div>Time's up!</div>;
  }

  return (
    <div>
      {timeLeft.days > 0 ? <span>{timeLeft.days}d&nbsp;</span> : <></>}
      {timeLeft.hours > 0 ? <span>{timeLeft.hours}h&nbsp;</span> : <></>}
      {timeLeft.minutes > 0 ? <span>{timeLeft.minutes}m</span> : <></>}
    </div>
  );
}

export default CountdownTimer;
