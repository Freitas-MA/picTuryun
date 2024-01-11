"use client";
import Image from "next/image";
import { PlusCircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { RestoredImage } from "@/types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

interface AlbumArtworkProps extends React.HTMLAttributes<HTMLDivElement> {
  image: RestoredImage;
  aspectRatio?: "portrait" | "square";
  width?: number;
  height?: number;
  publicUrl?: string;
  metadata?: string;
}

export function UserAppImage({
  image,
  aspectRatio = "portrait",
  width,
  height,
  publicUrl,
  metadata,
  className,
  ...props
}: AlbumArtworkProps) {
  const downloadImage = async (image: string) => {
    const supabase = createClientComponentClient();

    const { data, error } = await supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER)
      .download(
        `${process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER_RESTORED}/${image}`
      );

    if (data) {
      var a = document.createElement("a");
      document.body.appendChild(a);
      let url = window.URL.createObjectURL(data);
      a.href = url;
      a.download = image;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={cn("space-y-3", className)} {...props}>
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="overflow-hidden rounded-md flex flex-row flex-wrap">
            {publicUrl ? (
              <Image
                src={publicUrl + "/" + image.name}
                alt={image.name}
                width={width}
                height={height}
                className={cn(
                  "h-auto w-auto object-cover transition-all hover:scale-105",
                  aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
                )}
              />
            ) : null}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-40">
          <ContextMenuItem>Add to Collection</ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>Add to Photos</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem>
                <PlusCircleIcon className="mr-2 h-4 w-4" />
                New Collection
              </ContextMenuItem>
              <ContextMenuSeparator />
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuItem>Delete</ContextMenuItem>
          <ContextMenuItem>Duplicate</ContextMenuItem>
          <ContextMenuItem>Create Station</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => downloadImage(image.name)}>
            Download
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>Like</ContextMenuItem>
          <ContextMenuItem>Share</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <div className="space-y-1 text-sm">
        <p className="text-xs text-muted-foreground">{image.name}</p>
      </div>
    </div>
  );
}
