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
  } finally {
    // If the user is not logged in, redirect to the home page
    if (!loggedIn) {
      redirect("/", RedirectType.replace);
    }
  }

  // Fetch the restored images from the storage
  const { data: restoredImages, error } = await supabase.storage
    .from(process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER)
    .list(process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER_RESTORED, {
      limit: 12,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });

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
              <TabsTrigger value="documents" disabled>Documents</TabsTrigger>
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
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
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
