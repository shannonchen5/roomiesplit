interface PersonAvatarProps {
  name: string
  color: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
}

export function PersonAvatar({ name, color, size = 'md' }: PersonAvatarProps) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${sizes[size]}`}
      style={{ backgroundColor: color }}
      title={name}
    >
      {initial}
    </span>
  )
}
