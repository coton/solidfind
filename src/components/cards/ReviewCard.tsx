import { Star } from "lucide-react";

interface ReviewCardProps {
  userName: string;
  rating: number;
  content: string;
  date: string;
}

export function ReviewCard({ userName, rating, content, date }: ReviewCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">{userName}</span>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i < rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-200"
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-3 mb-2">{content}</p>
      <span className="text-xs text-zinc-400">{date}</span>
    </div>
  );
}
