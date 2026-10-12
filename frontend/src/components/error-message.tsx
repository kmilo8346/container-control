export function ErrorMessage({ message }: { message?: string }) {
  return message ? (
    <p role="alert" className="text-destructive">
      {message}
    </p>
  ) : null
}
