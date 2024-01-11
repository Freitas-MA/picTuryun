import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { RedirectType, redirect } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import ImageUploadPlaceholder from "@/components/user-app/img-upload-placeholder";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { UserAppImage } from "@/components/user-app/user-app-image";
export default async function page() {
  let loggedIn = false;
  const supabase = createServerComponentClient({ cookies });
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      loggedIn = true;
    }
  } catch (error) {
  } finally {
    if (!loggedIn) {
      redirect("/", RedirectType.replace);
    }
  }

  const { data: restoredImages, error } = await supabase.storage
    .from(process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER)
    .list(process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER_RESTORED, {
      limit: 10,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });

  const {
    data: { publicUrl },
  } = await supabase.storage
    .from(process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER)
    .getPublicUrl(
      process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER_RESTORED
    );

  const imageUrl = publicUrl;

  // console.log("Public Url pageApp", publicUrl);
  // console.log("image Url pageApp", imageUrl);

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
              <div className="flex flex-wrap space-x-4 pb-4 justify-evenly">
                {restoredImages
                  ? restoredImages?.map((restoredImage) => (
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
            {/* <div className="mt-6 space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                Made for You
              </h2>
              <p className="text-sm text-muted-foreground">
                Your personal playlists. Updated daily.
              </p>
            </div>
            <Separator className="my-4 border border-slate-300" />
            <div className="relative">Lista 2</div> */}
          </TabsContent>
          {/* <TabsContent
            value="documents"
            className="h-full flex-col border-none p-0 data-[state=active]:flex"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">
                  New Episodes
                </h2>
                <p className="text-sm text-muted-foreground">
                  Your favorite podcasts. Updated daily.
                </p>
              </div>
            </div>
            <Separator className="my-4 shadow-sm" />
          </TabsContent> */}
        </Tabs>
      </div>
    </div>
  );
}
