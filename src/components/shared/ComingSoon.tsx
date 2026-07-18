interface ComingSoonProps {
  title: string
  description: string
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-2 px-8 text-center">
      <h2 className="text-2xl text-text">{title}</h2>
      <p className="max-w-xs text-sm text-muted">{description}</p>
    </div>
  )
}
