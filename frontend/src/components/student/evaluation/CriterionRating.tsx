import StarRating from '../../../components/ui/StarRating';

interface Props {
  rating: number;
  maxRating: number;
  onRate: (rating: number) => void;
  readonly?: boolean;
}

export function CriterionRating({ 
  rating, 
  maxRating, 
  onRate, 
  readonly = false 
}: Props) {
  return (
    <div className="space-y-3">
      <label className="block text-lg md:text-[22px] font-black text-slate-900 tracking-tight text-center md:text-left">
        How would you rate yourself?
      </label>
      <div className="flex justify-center md:justify-start">
        <StarRating 
          readonly={readonly}
          rating={rating}
          max={maxRating}
          onRate={onRate}
          starClassName="size-8 md:size-10"
        />
      </div>
    </div>
  );
}

