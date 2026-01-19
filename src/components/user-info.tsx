import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/app/types';

interface UserInfoProps {
  user: User;
  showEmail?: boolean;
}

export function UserInfo({ user, showEmail = false }: UserInfoProps) {
  const getInitials = useInitials();

  const displayName = user.name || user.user_metadata?.full_name || 'User';
  const avatarUrl = user.avatar || user.user_metadata?.avatar_url;

  return (
    <div className="flex items-center space-x-2">
      <Avatar className="h-8 w-8 overflow-hidden rounded-full">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={displayName} />
        ) : (
          <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
            {getInitials(displayName)}
          </AvatarFallback>
        )}
      </Avatar>

      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{displayName}</span>
        {showEmail && (
          <span className="truncate text-xs text-muted-foreground">
            {user.email || user.user_metadata?.email || '—'}
          </span>
        )}
      </div>
    </div>
  );
}
