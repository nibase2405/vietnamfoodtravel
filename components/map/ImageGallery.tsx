import Image from "next/image";

export function ImageGallery({ images }: { images: string[] }) {
  return (
    <div className="grid gap-2 md:grid-cols-4">
      {images.slice(0, 5).map((src, index) => (
        <div key={`${src}-${index}`} className={index === 0 ? "relative h-72 overflow-hidden rounded-lg bg-muted md:col-span-2 md:row-span-2" : "relative h-36 overflow-hidden rounded-lg bg-muted"}>
          <Image
            src={src}
            alt=""
            fill
            priority={index === 0}
            sizes={index === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
