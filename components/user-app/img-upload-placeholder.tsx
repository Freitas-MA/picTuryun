"use client";

import { Button } from "@/components/ui/button";
import { IoMdDownload } from "react-icons/io";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import { set } from "zod";

interface FilePreview {
  file: Blob;
  preview: string;
}

export default function ImageUploadPlaceholder() {
  const [isMounted, setIsMounted] = useState(false);

  const [disableEnhanceButton, setDisableEnhanceButton] = useState(true);

  const router = useRouter();

  // * This is the file that will be previewed
  const [file, setFile] = useState<FilePreview | null>();

  // * This is the file that will be processed
  const [fileToProcess, setFileToProcess] = useState<{
    path: string;
  } | null>(null);

  // * This is the file that will be restored
  const [restoredFile, setRestoredFile] = useState<FilePreview | null>();

  // * onDrop is the function that will be called when the user drop the file
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      // Create a new name
      const uuid = uuidv4();
      const newName = `picturyn-${uuid}.${acceptedFiles[0].type.split("/")[1]}`;

      // Create a new file with the new name and the same atributes of the accpedFiles
      const updatedAcceptedFiles = new File([acceptedFiles[0]], newName, {
        type: acceptedFiles[0].type,
        lastModified: acceptedFiles[0].lastModified,
      });

      //   Caputre the file
      const file = updatedAcceptedFiles;
      setFile({
        file,
        preview: URL.createObjectURL(file),
      });

      //   Upload the file to the server
      const supabase = createClientComponentClient();
      const { data, error } = await supabase.storage
        .from(`${process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER}`)
        .upload(
          `${process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER_PROCESSING}/${updatedAcceptedFiles.name}`,
          updatedAcceptedFiles
        );
      if (!error) {
        setFileToProcess(data);
        console.log("acceptedFiles", acceptedFiles[0]);
        console.log("acceptedFiles.Name", acceptedFiles[0].name);
      }
    } catch (error) {
      console.log("onDrop", error);
    }
  }, []);

  /**
   * Renders a placeholder component for image upload.
   * @returns The root props, input props, whether the drag is active, and the open function.
   */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpeg", ".jpg"],
    },
    onDrop,
  });
  // handle dialog open change event is just to track the state of the dialog
  const handlleDialogOpenChange = async (e: boolean) => {
    if (!e) {
      setFile(null);
      setRestoredFile(null);
      router.refresh();
    }
  };

  /**
   * Sets the component as mounted and cleans up any object URLs when unmounting.
   */
  useEffect(() => {
    setIsMounted(true);
    setDisableEnhanceButton(true);
    return () => {
      if (file) URL.revokeObjectURL(file.preview);
      if (restoredFile) URL.revokeObjectURL(restoredFile.preview);
    };
  }, [handlleDialogOpenChange]);

  // handle enhance button click event
  const supabase = createClientComponentClient();

  const handleEnhance = async () => {
    try {
      // set the placeHolder
      //   Upload the file to the server
      setDisableEnhanceButton(false);
      const {
        data: { publicUrl },
      } = supabase.storage
        .from(process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER)
        .getPublicUrl(`${fileToProcess?.path}`);

      const res = await fetch("api/ai/replicate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: publicUrl,
        }),
      });

      const restoredImageUrl = await res.json();

      const readImageRes = await fetch(restoredImageUrl.data);

      const imageBlob = await readImageRes.blob();

      setRestoredFile({
        file: imageBlob,
        preview: URL.createObjectURL(imageBlob),
      });

      const imageFile = new File([imageBlob], "filename.jpeg");
      const { data, error } = await supabase.storage
        .from(process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER)
        .upload(
          // @ts-ignore
          `${process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER_RESTORED}/${file?.file.name}`,
          // * The error of .name is becouse the file does not have the property until finish the process, just ignore!
          imageFile
        );

      if (error) {
        throw error;
        setRestoredFile(null);
      }
    } catch (error) {
      console.log("handleEnhance", error);
      setFile(null);
      setRestoredFile(null);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex h-[200px] w-full max-w-[720px] bg-zinc-100 shadow-sm flex-shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="h-10 w-10 text-muted-foreground"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="11" r="1" />
          <path d="M11 17a1 1 0 0 1 2 0c0 .5-.34 3-.5 4.5a.5.5 0 0 1-1 0c-.16-1.5-.5-4-.5-4.5ZM8 14a5 5 0 1 1 8 0" />
          <path d="M17 18.5a9 9 0 1 0-10 0" />
        </svg>

        <h3 className="mt-4 text-lg font-semibold">Just add your photos</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          The photo you add will be enhanced and stored in your collection
        </p>
        <Dialog onOpenChange={handlleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm" className="relative">
              Add you photos
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bring your past to life!</DialogTitle>
              <DialogDescription>
                Drag a photo in order to Upload & Enhance!
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2 cursor-pointer">
                {!file && (
                  <div id="dropzone" {...getRootProps()}>
                    <input
                      type="file"
                      className="hidden"
                      id="file-input-mobile"
                      accept="image/png, image/jpeg"
                      onChange={(e) => {
                        if (e.target.files) {
                          onDrop(Array.from(e.target.files));
                        }
                      }}
                    />
                    <input
                      className="sr-only absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-50"
                      {...getInputProps}
                    />
                    {isDragActive ? (
                      <p className="flex items-center justify-center bg-blue-100 opacity-70 border border-dashed border-blue-300 p-6 h-36 rounded-md">
                        Drop the files here ...
                      </p>
                    ) : (
                      <span className="flex items-center justify-center bg-blue-100 opacity-70 border border-dashed border-blue-300 p-6 h-36 rounded-md">
                        {/* <p className="hidd md:block">Click!</p> */}
                        <p>Drag and drop some files here!</p>
                      </span>
                    )}
                  </div>

                )}
                <div className="flex flex-col items-center justify-evenly sm:flex-row gap-2">
                  {file && (
                    <div className="flex flex-row flex-wrap drop-shadow-md">
                      <div className="flex w-48 h-48 relative">
                        <img
                          src={file.preview}
                          className="w-48 h-48 object-contain rounded-md"
                          onLoad={() => URL.revokeObjectURL(file.preview)}
                        />
                      </div>
                    </div>
                  )}
                  {restoredFile && (
                    <div className="flex flex-row flex-wrap drop-shadow-md">
                      <div className="flex w-60 h-60 relative">
                        <img
                          src={restoredFile.preview}
                          className="w-60 h-60 object-contain rounded-md"
                          onLoad={() =>
                            URL.revokeObjectURL(restoredFile.preview)
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="flex flex-row justify-end gap-2">
              <Button
                className="bg-green-400 md:hidden"
                variant={"ghost"}
                disabled={file ? true : false}
              >
                <label htmlFor="file-input-mobile">Select File</label>
              </Button>
              <Button
                disabled={file ? (restoredFile ? true : false) : true}
                onClick={handleEnhance}
              >
                Enhance
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
