import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
// Extend the default NextRequest to include the image
interface NextRequestWithImage extends NextRequest {
  image: string;
}

export async function POST(req: NextRequestWithImage, res: NextResponse) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) {
      throw new Error("Image URL is missing");
    }

    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (!session || error) new NextResponse("Unauthorized", { status: 500 });

    const replicateApiToken = process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN;
    if (!replicateApiToken) {
      throw new Error("Replicate API token is missing");
    }

    const version =
      "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3";
    const scale = 2;
    const API_URL = "https://api.replicate.com/v1/predictions";

    const startRestoreProcess = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + replicateApiToken,
      },
      body: JSON.stringify({
        version: version,
        input: {
          img: imageUrl,
          version: "v1.4",
          scale: scale,
        },
      }),
    });

    let jsonStartProcessResponse = await startRestoreProcess.json();

    let endpointUrl = jsonStartProcessResponse.urls.get;

    let restoredImage: string | null = null;
    while (!restoredImage) {
      console.log("Pooling...");
      let finalResponse = await fetch(endpointUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Token " + replicateApiToken,
        },
      });
      let jsonFinalResponse = await finalResponse.json();
      if (jsonFinalResponse.status === "succeeded") {
        restoredImage = jsonFinalResponse.output;
      } else if (jsonFinalResponse.status === "failed") {
        break;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      // console.log('Restored Image', restoredImage)
    }

    return NextResponse.json(
      { data: restoredImage ? restoredImage : "Failed to restore Image." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
