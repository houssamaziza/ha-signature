import Image from "next/image";

type Props = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  /** Tailles pour next/image (responsive). */
  sizes?: string;
  priority?: boolean;
  position?: "center" | "top";
};

/** Photo en remplissage d'un bloc ; bloc neutre si aucune image. */
export function Photo({ src, alt, className = "", sizes = "100vw", priority, position = "center" }: Props) {
  return (
    <div className={`relative overflow-hidden bg-photo ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={`object-cover ${position === "top" ? "object-top" : "object-center"}`}
        />
      ) : (
        <span className="absolute bottom-4 left-4 text-xs text-ink-soft">Photo à venir</span>
      )}
    </div>
  );
}
