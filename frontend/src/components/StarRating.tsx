import { Star } from 'lucide-react';
import { cn } from '../lib/utils';

interface StarRatingProps {
  rating: number;
  max?: number;
  onRate?: (rating: number) => void;
  className?: string;
  starClassName?: string;
  readonly?: boolean;
}

export default function StarRating({
  rating,
  max = 5,
  onRate,
  className,
  starClassName,
  readonly = true,
}: StarRatingProps) {
  return (
    <div className={cn('flex gap-1', className)}>
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= rating;
        const isHalf = !isFilled && starValue - 0.5 <= rating;

        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            onClick={() => onRate?.(starValue)}
            className={cn(
              'transition-transform focus:outline-none',
              !readonly && 'hover:scale-110 active:scale-95',
              readonly && 'cursor-default'
            )}
          >
            <Star
              className={cn(
                'w-5 h-5',
                isFilled ? 'fill-primary text-primary' : isHalf ? 'fill-primary/30 text-primary' : 'text-slate-300',
                starClassName
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
