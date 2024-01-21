// Import necessary components and libraries
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { RedirectType, redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import ImageUploadPlaceholder from "@/components/user-app/img-upload-placeholder";
import { UserAppImage } from "@/components/user-app/user-app-image";

/**
 * Renders the page component.
 * This component is responsible for displaying the user's photo collection and other content.
 * It checks if the user is logged in and redirects to the home page if not.
 * It also fetches the restored images from the storage and displays them in a grid.
 */
export default async function page() {
  let loggedIn = false;

  // Create a Supabase client using server-side authentication
  const supabase = createServerComponentClient({ cookies });

  try {
    // Check if there is an active session for the user
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      loggedIn = true;
    }
  } catch (error) {
    // Handle error if authentication session cannot be retrieved
    throw new Error("Error retrieving authentication session");
  } finally {
    // If the user is not logged in, redirect to the home page
    if (!loggedIn) {
      redirect("/", RedirectType.replace);
    }
  }
  // Cleaning the prossing folder
  // const { data: processingImages } = await supabase.storage
  //   .from(process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER)
  //   .list(process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER_PROCESSING, {
  //     limit: 100,
  //     offset: 0,
  //     sortBy: { column: "name", order: "asc" },
  //   });
  // if(processingImages){
  //   if(processingImages.length > 10){
  //     const sortedProcessingImages = processingImages.sort((a, b) =>
  //     new Date(b.created_at).getTime() -
  //     new Date(a.created_at).getTime()
  //     );
  //     sortedProcessingImages.slice(10, 100).forEach(async (image) => {
  //       await supabase.storage
  //       .from(process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER)
  //       .remove(
  //         // @ts-expect-error
  //        `${process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER_PROCESSING}/${image.name}`
  //       );
  //     });
  //     console.log("Processing images deleted");
  //   } else {
  //     console.log('Nothing to delete!')
  //   }

  // }
    

  // Fetch the restored images from the storage
  const { data: restoredImages, error } = await supabase.storage
    .from(process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER)
    .list(process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER_RESTORED, {
      limit: 100,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });
    // Deleting images under the size off 4000bytes from the folder restored
  //   if(restoredImages) {
  //     restoredImages.forEach(async (image) => {
  //       if(image.metadata.size < 4000){
  //         await supabase.storage
  //         .from(process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER)
  //         .remove(
  //           // @ts-ignore
  //          `${process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER_RESTORED}/${image.name}`
  //         );
  //       }
  //     });
  //     console.log("Small images deleted");
  //   }
  // // Deleting images over than 60 from the folder restored
  //   if(restoredImages){
  //     if(restoredImages.length > 60) {
  //       const sortedRestoredImages = restoredImages.sort((a, b) =>
  //       new Date(b.created_at).getTime() -
  //       new Date(a.created_at).getTime()
  //       );
  //       sortedRestoredImages.slice(60, 100).forEach(async (image) => {
  //         await supabase.storage
  //         .from(process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER)
  //         .remove(
  //           // @ts-ignore
  //          `${process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER_RESTORED}/${image.name}`
  //         );
  //       });
  //       console.log("Restored images deleted");
  //     }
  //   }
  // Get the public URL of the restored images
  const {
    data: { publicUrl },
  } = await supabase.storage
    .from(process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER)
    .getPublicUrl(
      process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER_RESTORED
    );

  const imageUrl = publicUrl;

  // Render the page component
  return (
    <div className="flex flex-col w-full mt-0 z-0">
      <div className="h-full w-full px-4 py-6 lg:px-8">
        <Tabs defaultValue="photos" className="h-full space-y-6">
          <div className="space-between flex items-center">
            <TabsList>
              <TabsTrigger value="photos" className="relative">
                Photos
              </TabsTrigger>
              <TabsTrigger value="documents" disabled>
                Documents
              </TabsTrigger>
              <TabsTrigger value="other" disabled>
                Other
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="photos" className="border-none p-0 outline-none ">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Photo collection
                </h2>
                <p className="text-sm text-muted-foreground">
                  The photos you already enhanced
                </p>
              </div>
            </div>
            <Separator className="my-4 border border-slate-300" />
            <div className="flex flex-col items-center justify-center">
              <ImageUploadPlaceholder />
              <div className="flex flex-wrap max-w-7xl space-x-4 pb-4 justify-around">
                {restoredImages
                  ? restoredImages
                      .sort(
                        (a, b) =>
                          new Date(b.created_at).getTime() -
                          new Date(a.created_at).getTime()
                      )
                      .slice(0, 12)
                      .map((restoredImage) => (
                        <UserAppImage
                          key={restoredImage.name}
                          image={restoredImage}
                          publicUrl={imageUrl}
                          className="w-[150px] m-3 shrink"
                          aspectRatio="square"
                          width={150}
                          height={270}
                        />
                      ))
                  : null}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
