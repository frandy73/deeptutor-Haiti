import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

interface Props {
  animationData: object;
  className?: string;
}

export default function LottiePlayer({ animationData, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const anim = lottie.loadAnimation({
      container: ref.current,
      renderer: 'svg',
      animationData,
      loop: true,
      autoplay: true,
    });
    return () => anim.destroy();
  }, [animationData]);

  return <div ref={ref} className={className} />;
}
