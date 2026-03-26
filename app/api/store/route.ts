import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const { data: restaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .select("*")
      .eq("slug", slug)
      .single();

    if (restaurantError || !restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const { data: menu, error: menuError } = await supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: true });

    if (menuError) {
      return NextResponse.json({ error: "Menu not found" }, { status: 500 });
    }

    return NextResponse.json({
      restaurant,
      menu: menu || [],
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}