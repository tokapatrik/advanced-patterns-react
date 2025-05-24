import { useEffect, useRef } from "react";

type InfiniteScrollProps = {
  children: React.ReactNode;
  onLoadMore: () => void;
  treshold?: number;
};

const InfiniteScroll = ({
  children,
  onLoadMore,
  treshold = 500,
}: InfiniteScrollProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          onLoadMore();
        }
      },
      {
        rootMargin: `0px 0px ${treshold}px 0px`,
      },
    );

    const currentContainer = containerRef.current;
    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => {
      if (currentContainer) {
        observer.unobserve(currentContainer);
      }
      observer.disconnect();
    };
  }, [onLoadMore, treshold]);

  return (
    <div>
      {children}
      <div ref={containerRef} className="h-1" />{" "}
    </div>
  );
};

export { InfiniteScroll };
