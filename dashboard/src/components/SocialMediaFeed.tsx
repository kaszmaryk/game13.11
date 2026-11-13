import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { SocialMediaPost } from '@/types/game';
import { Heart, Repeat2, MessageCircle, Share } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialMediaFeedProps {
  posts: SocialMediaPost[];
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}


function formatNumber(num: number) {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

const PostCard = memo(function PostCard({ post }: { post: SocialMediaPost }) {
  return (
    <article className="flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50">
      {/* Avatar column */}
      <Avatar size="lg" className="shrink-0">
        {post.avatar ? (
          <AvatarImage src={post.avatar} alt={post.author} />
        ) : null}
        <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
          {getInitials(post.author)}
        </AvatarFallback>
      </Avatar>

      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {/* Author line */}
        <div className="flex items-baseline gap-1.5 text-sm leading-tight">
          <span className="font-bold text-foreground truncate">
            {post.author}
          </span>
          <span className="text-muted-foreground truncate">
            @{post.handle}
          </span>
          <span className="text-muted-foreground shrink-0">·</span>
          <time className="text-muted-foreground shrink-0 whitespace-nowrap">
            {new Date(post.timestamp).toLocaleDateString('ru-RU')}
          </time>
        </div>

        {/* Post body */}
        <p className="text-[15px] leading-relaxed text-foreground whitespace-pre-wrap break-words">
          {post.content}
        </p>

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {post.hashtags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs font-medium">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Engagement actions */}
        <div className="flex items-center gap-6 pt-1 text-muted-foreground">
          <button
            type="button"
            className="group/action flex items-center gap-1.5 text-xs transition-colors hover:text-foreground"
          >
            <MessageCircle className="size-4 transition-colors group-hover/action:text-foreground" />
            <span>Ответить</span>
          </button>
          <button
            type="button"
            className="group/action flex items-center gap-1.5 text-xs transition-colors hover:text-foreground"
          >
            <Repeat2 className="size-4 transition-colors group-hover/action:text-foreground" />
            <span>{formatNumber(post.retweets)}</span>
          </button>
          <button
            type="button"
            className="group/action flex items-center gap-1.5 text-xs transition-colors hover:text-foreground"
          >
            <Heart className="size-4 transition-colors group-hover/action:text-destructive" />
            <span>{formatNumber(post.likes)}</span>
          </button>
          <button
            type="button"
            className="group/action flex items-center gap-1.5 text-xs transition-colors hover:text-foreground"
          >
            <Share className="size-4 transition-colors group-hover/action:text-foreground" />
          </button>
        </div>
      </div>
    </article>
  );
});

const STAGGER_CLASSES = [
  'stagger-1', 'stagger-2', 'stagger-3', 'stagger-4', 'stagger-5',
];

export const SocialMediaFeed = memo(function SocialMediaFeed({ posts }: SocialMediaFeedProps) {
  const { t } = useTranslation();

  // Sort posts by timestamp (newest first)
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <section className="flex w-full flex-col">
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 pb-3">
        <MessageCircle className="size-5 text-muted-foreground" />
        <h2 className="text-lg font-bold">{t('socialMedia.title')}</h2>
      </div>

      {sortedPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <MessageCircle className="size-10 opacity-40" />
          <p className="text-sm">Пока нет постов в социальных сетях</p>
        </div>
      ) : (
        <div className="flex flex-col max-w-2xl mx-auto w-full rounded-xl border border-border bg-card overflow-hidden">
          {sortedPosts.map((post, index) => (
            <div
              key={post.id}
              className={cn("animate-slide-up", STAGGER_CLASSES[index % STAGGER_CLASSES.length])}
            >
              <PostCard post={post} />
              {index < sortedPosts.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      )}
    </section>
  );
});
