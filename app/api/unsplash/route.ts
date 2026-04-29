import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "technology";

    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
      return NextResponse.redirect("https://placehold.co/600x400/png?text=API+Key+Missing");
    }

    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=${accessKey}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
        // Fallback to placehold.co if Unsplash rate limits or errors
        return NextResponse.redirect(`https://placehold.co/600x400/png?text=${encodeURIComponent(query)}`);
    }

    const data = await response.json();
    
    // Redirect directly to the image URL so it can be used in an <img> tag
    if (data && data.urls && data.urls.regular) {
      return NextResponse.redirect(data.urls.regular);
    }

    return NextResponse.redirect(`https://placehold.co/600x400/png?text=${encodeURIComponent(query)}`);
  } catch (error) {
    console.error("Unsplash Proxy Error:", error);
    return NextResponse.redirect("https://placehold.co/600x400/png?text=Error");
  }
}
