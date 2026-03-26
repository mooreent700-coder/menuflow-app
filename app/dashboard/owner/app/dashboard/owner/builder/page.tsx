"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Restaurant = {
  id: string;
  name: string | null;
  owner_email?: string | null;
  slug: string | null;
  phone: string | null;
  address: string | null;
  hero_image?: string | null;
  logo_image?: string | null;
};

type MenuItem = {
  id: string;
  name: string | null;
  price: number | null;
  description: string | null;
  image_url: string | null;
  created_at?: string | null;
};

export default function OwnerMenuBuilderPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [userEmail, setUserEmail] = useState("");
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [foodFile, setFoodFile] = useState<File | null>(null);
  const [foodPreview, setFoodPreview] = useState("");

  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState("");

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");

  const [addingItem, setAddingItem] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [removingItemId, setRemovingItemId] = useState("");

  const blue = "#2f7ef7";

  const loadBuilder = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      setMessage("Please sign in first.");
      setLoading(false);
      return;
    }

    setUserEmail(user.email);

    const { data: restaurantData, error: restaurantError } = await supabase
      .from("restaurants")
      .select("id, name, owner_email, slug, phone, address, hero_image, logo_image")
      .eq("owner_email", user.email)
      .maybeSingle();

    if (restaurantError) {
      setMessage(restaurantError.message);
      setLoading(false);
      return;
    }

    if (!restaurantData) {
      setRestaurant(null);
      setMenuItems([]);
      setHeroPreview("");
      setLogoPreview("");
      setLoading(false);
      return;
    }

    setRestaurant(restaurantData);
    setHeroPreview(restaurantData.hero_image || "");
    setLogoPreview(restaurantData.logo_image || "");

    const { data: itemsData, error: itemsError } = await supabase
      .from("menu_items")
      .select("id, name, price, description, image_url, created_at")
      .eq("restaurant_id", restaurantData.id)
      .order("created_at", { ascending: false });

    if (itemsError) {
      setMessage(itemsError.message);
      setLoading(false);
      return;
    }

    setMenuItems(itemsData || []);
    setLoading(false);
  };

  useEffect(() => {
    loadBuilder(true);
  }, []);

  useEffect(() => {
    if (!restaurant?.id) return;

    const menuChannel = supabase
      .channel(`builder-menu-${restaurant.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "menu_items",
          filter: `restaurant_id=eq.${restaurant.id}`,
        },
        async () => {
          await loadBuilder(false);
        }
      )
      .subscribe();

    const restaurantChannel = supabase
      .channel(`builder-restaurant-${restaurant.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "restaurants",
          filter: `id=eq.${restaurant.id}`,
        },
        async () => {
          await loadBuilder(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(menuChannel);
      supabase.removeChannel(restaurantChannel);
    };
  }, [restaurant?.id]);

  const storeLink = useMemo(() => {
    if (!restaurant?.slug) return "";
    return `/store/${restaurant.slug}`;
  }, [restaurant?.slug]);

  const handleFoodChoose = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFoodFile(file);

    if (file) {
      setFoodPreview(URL.createObjectURL(file));
    } else {
      setFoodPreview("");
    }
  };

  const handleHeroChoose = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setHeroFile(file);

    if (file) {
      setHeroPreview(URL.createObjectURL(file));
    } else {
      setHeroPreview(restaurant?.hero_image || "");
    }
  };

  const handleLogoChoose = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);

    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setLogoPreview(restaurant?.logo_image || "");
    }
  };

  const uploadFileToBucket = async (bucket: string, restaurantId: string, file: File) => {
    const safeName = file.name.replace(/\s+/g, "-").toLowerCase();
    const filePath = `${restaurantId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error(`No public URL returned from bucket: ${bucket}`);
    }

    return `${data.publicUrl}?v=${Date.now()}`;
  };

  const handleUploadHero = async () => {
    setMessage("");

    if (!restaurant?.id) {
      setMessage("No restaurant found.");
      return;
    }

    if (!heroFile) {
      setMessage("Choose a hero image first.");
      return;
    }

    try {
      setUploadingHero(true);

      const heroUrl = await uploadFileToBucket("heroes", restaurant.id, heroFile);

      const { data: updatedRestaurant, error } = await supabase
        .from("restaurants")
        .update({ hero_image: heroUrl })
        .eq("id", restaurant.id)
        .select("id, name, owner_email, slug, phone, address, hero_image, logo_image")
        .single();

      if (error) throw new Error(error.message);
      if (!updatedRestaurant?.hero_image) {
        throw new Error("Hero image did not save to restaurant record.");
      }

      setRestaurant(updatedRestaurant);
      setHeroPreview(updatedRestaurant.hero_image);
      setHeroFile(null);
      setMessage("Hero image uploaded successfully.");

      await loadBuilder(false);
    } catch (err: any) {
      setMessage(`Hero upload failed: ${err.message}`);
    } finally {
      setUploadingHero(false);
    }
  };

  const handleUploadLogo = async () => {
    setMessage("");

    if (!restaurant?.id) {
      setMessage("No restaurant found.");
      return;
    }

    if (!logoFile) {
      setMessage("Choose a logo image first.");
      return;
    }

    try {
      setUploadingLogo(true);

      const logoUrl = await uploadFileToBucket("logos", restaurant.id, logoFile);

      const { data: updatedRestaurant, error } = await supabase
        .from("restaurants")
        .update({ logo_image: logoUrl })
        .eq("id", restaurant.id)
        .select("id, name, owner_email, slug, phone, address, hero_image, logo_image")
        .single();

      if (error) throw new Error(error.message);

      setRestaurant(updatedRestaurant);
      setLogoPreview(updatedRestaurant.logo_image || logoUrl);
      setLogoFile(null);
      setMessage("Logo image uploaded successfully.");

      await loadBuilder(false);
    } catch (err: any) {
      setMessage(`Logo upload failed: ${err.message}`);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleAddMenuItem = async () => {
    setMessage("");

    if (!restaurant?.id) {
      setMessage("No restaurant found.");
      return;
    }

    if (!itemName.trim()) {
      setMessage("Item name is required.");
      return;
    }

    if (!itemPrice.trim()) {
      setMessage("Item price is required.");
      return;
    }

    const priceNumber = Number(itemPrice);
    if (Number.isNaN(priceNumber)) {
      setMessage("Enter a valid price.");
      return;
    }

    try {
      setAddingItem(true);

      let imageUrl = "";

      if (foodFile) {
        imageUrl = await uploadFileToBucket("menu-items", restaurant.id, foodFile);
      }

      const { error } = await supabase.from("menu_items").insert([
        {
          restaurant_id: restaurant.id,
          name: itemName.trim(),
          price: priceNumber,
          description: itemDescription.trim(),
          image_url: imageUrl || null,
        },
      ]);

      if (error) throw new Error(error.message);

      setItemName("");
      setItemPrice("");
      setItemDescription("");
      setFoodFile(null);
      setFoodPreview("");

      await loadBuilder(false);
      setMessage("Menu item added successfully.");
    } catch (err: any) {
      setMessage(`Add item failed: ${err.message}`);
    } finally {
      setAddingItem(false);
    }
  };

  const handleRemoveItem = async (id: string) => {
    setMessage("");

    try {
      setRemovingItemId(id);

      const { error } = await supabase.from("menu_items").delete().eq("id", id);

      if (error) throw new Error(error.message);

      await loadBuilder(false);
      setMessage("Menu item removed successfully.");
    } catch (err: any) {
      setMessage(`Remove item failed: ${err.message}`);
    } finally {
      setRemovingItemId("");
    }
  };

  if (loading) {
    return (
      <div style={page}>
        <div style={loadingWrap}>Loading menu builder...</div>
      </div>
    );
  }

  return (
    <div style={page}>
      <div style={shell}>
        <div style={layout}>
          <aside style={sidebar}>
            <div style={brand}>MF</div>

            <button style={navButton} onClick={() => router.push("/dashboard/owner")}>
              ⌂
            </button>

            <button style={navButtonActive} onClick={() => router.push("/dashboard/owner/builder")}>
              ☰
            </button>

            <button
              style={navButton}
              onClick={() => {
                if (storeLink) window.location.href = storeLink;
              }}
            >
              ◱
            </button>

            <button style={navButton} onClick={() => loadBuilder(false)}>
              ↻
            </button>
          </aside>

          <main style={main}>
            <section style={heroCard}>
              <div>
                <div style={eyebrow}>MenuFlow Builder</div>
                <h1 style={heroTitle}>Build your store in one place</h1>
                <p style={heroText}>
                  Upload hero image, upload logo, add menu items, and preview everything before your customer sees it.
                </p>
                <div style={emailText}>{userEmail}</div>
              </div>

              <div style={actionPanel}>
                <button style={primaryAction} onClick={() => loadBuilder(false)}>
                  Refresh Builder
                </button>

                <button
                  style={secondaryAction}
                  onClick={() => router.push("/dashboard/owner")}
                >
                  Back to Dashboard
                </button>

                {storeLink ? (
                  <a href={storeLink} style={secondaryActionLink}>
                    Preview Live Store
                  </a>
                ) : (
                  <div style={secondaryActionDisabled}>Preview Live Store</div>
                )}
              </div>
            </section>

            {message ? <div style={messageBox}>{message}</div> : null}

            <section style={contentGrid}>
              <div style={leftColumn}>
                <div style={panel}>
                  <h2 style={panelTitle}>Store Hero Image</h2>

                  {heroPreview ? (
                    <img src={heroPreview} alt="Hero Preview" style={heroPreviewImage} />
                  ) : (
                    <div style={heroEmpty}>No hero image selected yet</div>
                  )}

                  <label style={label}>Choose Hero Image</label>
                  <input type="file" accept="image/*" onChange={handleHeroChoose} style={input} />

                  <button
                    style={blueButton(blue)}
                    onClick={handleUploadHero}
                    disabled={uploadingHero}
                  >
                    {uploadingHero ? "Uploading..." : "Upload Hero Image"}
                  </button>
                </div>

                <div style={panel}>
                  <h2 style={panelTitle}>Store Logo Image</h2>

                  {logoPreview ? (
                    <div style={logoPreviewWrap}>
                      <img src={logoPreview} alt="Logo Preview" style={logoPreviewImage} />
                    </div>
                  ) : (
                    <div style={logoEmpty}>No logo image selected yet</div>
                  )}

                  <label style={label}>Choose Logo Image</label>
                  <input type="file" accept="image/*" onChange={handleLogoChoose} style={input} />

                  <button
                    style={blueButton(blue)}
                    onClick={handleUploadLogo}
                    disabled={uploadingLogo}
                  >
                    {uploadingLogo ? "Uploading..." : "Upload Logo Image"}
                  </button>
                </div>

                <div style={panel}>
                  <h2 style={panelTitle}>Add Menu Item</h2>

                  <label style={label}>Item Name</label>
                  <input
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    style={input}
                    placeholder="Taco Plate"
                  />

                  <label style={label}>Price</label>
                  <input
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    style={input}
                    placeholder="12.99"
                  />

                  <label style={label}>Description</label>
                  <textarea
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    style={textarea}
                    placeholder="Beef taco plate with rice and beans"
                  />

                  <label style={label}>Food Photo</label>
                  <input type="file" accept="image/*" onChange={handleFoodChoose} style={input} />

                  {foodPreview ? (
                    <img src={foodPreview} alt="Food Preview" style={foodPreviewImage} />
                  ) : null}

                  <button
                    style={blueButton(blue)}
                    onClick={handleAddMenuItem}
                    disabled={addingItem}
                  >
                    {addingItem ? "Adding..." : "Add Menu Item"}
                  </button>
                </div>

                <div style={panel}>
                  <div style={panelHeaderRow}>
                    <h2 style={panelTitle}>Saved Menu Items</h2>
                    <div style={panelHeaderMeta}>{menuItems.length} total</div>
                  </div>

                  {menuItems.length === 0 ? (
                    <div style={emptyCard}>No menu items saved yet.</div>
                  ) : (
                    <div style={menuList}>
                      {menuItems.map((item) => (
                        <div key={item.id} style={menuRow}>
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name || "Menu item"}
                              style={menuImage}
                            />
                          ) : (
                            <div style={menuImagePlaceholder}>No Photo</div>
                          )}

                          <div style={{ flex: 1 }}>
                            <div style={menuName}>{item.name || "Untitled Item"}</div>
                            <div style={menuPrice}>
                              ${Number(item.price || 0).toFixed(2)}
                            </div>
                            {item.description ? (
                              <div style={menuDesc}>{item.description}</div>
                            ) : null}
                          </div>

                          <button
                            style={removeButton}
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={removingItemId === item.id}
                          >
                            {removingItemId === item.id ? "Removing..." : "Remove Item"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={rightColumn}>
                <div style={panel}>
                  <div style={panelHeaderRow}>
                    <h2 style={panelTitle}>Live Preview</h2>
                    <div style={panelHeaderMeta}>
                      {restaurant?.slug ? `/store/${restaurant.slug}` : "-"}
                    </div>
                  </div>

                  <div style={previewShell}>
                    <div style={previewTopBar}>
                      <div>
                        <div style={previewLabel}>MenuFlow Store</div>
                        <div style={previewStoreName}>{restaurant?.name || "Store"}</div>
                      </div>

                      {logoPreview ? (
                        <div style={previewLogoFrame}>
                          <img src={logoPreview} alt="Logo" style={previewLogoImage} />
                        </div>
                      ) : null}
                    </div>

                    {heroPreview ? (
                      <div
                        style={{
                          ...previewHero,
                          backgroundImage: `linear-gradient(rgba(15,23,42,0.25), rgba(15,23,42,0.4)), url("${heroPreview}")`,
                        }}
                      >
                        <div style={previewHeroContent}>
                          <div style={previewSlug}>
                            {restaurant?.slug ? `/store/${restaurant.slug}` : ""}
                          </div>
                          <div style={previewHeroTitle}>{restaurant?.name || "Restaurant"}</div>
                          <div style={previewHeroSub}>Fresh food made to order.</div>
                          <div style={previewHeroMeta}>{restaurant?.phone || "-"}</div>
                          <div style={previewHeroMeta}>{restaurant?.address || "-"}</div>
                          <div style={previewHeroButton}>Text to Order</div>
                        </div>
                      </div>
                    ) : (
                      <div style={previewHeroEmpty}>Hero image preview will show here</div>
                    )}

                    <div style={previewSectionTitle}>Menu Preview</div>

                    <div style={previewMenuGrid}>
                      {menuItems.length === 0 &&
                      !itemName.trim() &&
                      !itemPrice.trim() &&
                      !itemDescription.trim() &&
                      !foodPreview ? (
                        <div style={previewEmptyCard}>
                          Your menu preview will show here after you add items.
                        </div>
                      ) : (
                        <>
                          {itemName.trim() || itemPrice.trim() || itemDescription.trim() || foodPreview ? (
                            <div style={previewCardDraft}>
                              {foodPreview ? (
                                <img src={foodPreview} alt="Draft" style={previewCardImage} />
                              ) : (
                                <div style={previewCardImageEmpty}>No Photo</div>
                              )}

                              <div style={previewCardBody}>
                                <div style={previewItemName}>{itemName || "New Menu Item"}</div>
                                <div style={previewItemPrice}>
                                  ${Number(itemPrice || 0).toFixed(2)}
                                </div>
                                <div style={previewItemDesc}>
                                  {itemDescription || "Your item description will appear here."}
                                </div>
                              </div>
                            </div>
                          ) : null}

                          {menuItems.slice(0, 6).map((item) => (
                            <div key={item.id} style={previewCard}>
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.name || "Menu item"} style={previewCardImage} />
                              ) : (
                                <div style={previewCardImageEmpty}>No Photo</div>
                              )}

                              <div style={previewCardBody}>
                                <div style={previewItemName}>{item.name || "Untitled Item"}</div>
                                <div style={previewItemPrice}>
                                  ${Number(item.price || 0).toFixed(2)}
                                </div>
                                <div style={previewItemDesc}>
                                  {item.description || "Featured menu item"}
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function blueButton(color: string): React.CSSProperties {
  return {
    marginTop: "18px",
    width: "100%",
    padding: "16px 18px",
    borderRadius: "16px",
    border: "none",
    background: color,
    color: "#ffffff",
    fontWeight: 800,
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 12px 30px rgba(37, 99, 235, 0.18)",
  };
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f6f9fc",
  padding: "24px",
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  color: "#111827",
};

const shell: React.CSSProperties = {
  maxWidth: "1480px",
  margin: "0 auto",
};

const layout: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "88px 1fr",
  gap: "24px",
  alignItems: "start",
};

const sidebar: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "28px",
  padding: "18px 14px",
  boxShadow: "0 18px 50px rgba(15, 23, 42, 0.08)",
  border: "1px solid rgba(226,232,240,0.8)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "14px",
  minHeight: "840px",
};

const brand: React.CSSProperties = {
  width: "48px",
  height: "48px",
  borderRadius: "16px",
  background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  fontSize: "16px",
  marginBottom: "8px",
};

const navButtonBase: React.CSSProperties = {
  width: "48px",
  height: "48px",
  borderRadius: "16px",
  border: "1px solid #e5e7eb",
  background: "#ffffff",
  color: "#475569",
  cursor: "pointer",
  fontSize: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const navButton: React.CSSProperties = {
  ...navButtonBase,
};

const navButtonActive: React.CSSProperties = {
  ...navButtonBase,
  background: "#eff6ff",
  color: "#2563eb",
  border: "1px solid #bfdbfe",
  boxShadow: "0 8px 22px rgba(37, 99, 235, 0.15)",
};

const main: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "24px",
};

const heroCard: React.CSSProperties = {
  background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
  borderRadius: "32px",
  padding: "30px",
  border: "1px solid rgba(226,232,240,0.9)",
  boxShadow: "0 22px 70px rgba(15, 23, 42, 0.08)",
  minHeight: "210px",
  display: "flex",
  justifyContent: "space-between",
  gap: "24px",
  flexWrap: "wrap",
};

const eyebrow: React.CSSProperties = {
  color: "#3b82f6",
  fontSize: "14px",
  fontWeight: 700,
  marginBottom: "10px",
};

const heroTitle: React.CSSProperties = {
  margin: 0,
  fontSize: "38px",
  lineHeight: 1.05,
  fontWeight: 800,
};

const heroText: React.CSSProperties = {
  marginTop: "10px",
  color: "#64748b",
  fontSize: "17px",
  maxWidth: "760px",
};

const emailText: React.CSSProperties = {
  marginTop: "14px",
  color: "#0f172a",
  fontWeight: 600,
  fontSize: "15px",
};

const actionPanel: React.CSSProperties = {
  width: "280px",
  background: "#ffffff",
  borderRadius: "24px",
  padding: "14px",
  boxShadow: "0 22px 50px rgba(37, 99, 235, 0.18)",
  border: "1px solid #e2e8f0",
  display: "grid",
  gap: "10px",
  alignSelf: "center",
};

const primaryAction: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "16px",
  border: "none",
  background: "#2f7ef7",
  color: "#ffffff",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryAction: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "16px",
  background: "#2f7ef7",
  border: "none",
  color: "#ffffff",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryActionLink: React.CSSProperties = {
  display: "block",
  padding: "14px 16px",
  borderRadius: "16px",
  background: "#2f7ef7",
  border: "none",
  color: "#ffffff",
  fontWeight: 700,
  textDecoration: "none",
  textAlign: "center",
};

const secondaryActionDisabled: React.CSSProperties = {
  display: "block",
  padding: "14px 16px",
  borderRadius: "16px",
  background: "#cbd5e1",
  border: "none",
  color: "#ffffff",
  fontWeight: 700,
  textAlign: "center",
};

const messageBox: React.CSSProperties = {
  padding: "14px 16px",
  borderRadius: "14px",
  background: "#eff6ff",
  color: "#1d4ed8",
  fontWeight: 700,
};

const contentGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "0.95fr 1.05fr",
  gap: "20px",
};

const leftColumn: React.CSSProperties = {
  display: "grid",
  gap: "20px",
};

const rightColumn: React.CSSProperties = {
  display: "grid",
  gap: "20px",
};

const panel: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "28px",
  padding: "26px",
  border: "1px solid rgba(226,232,240,0.9)",
  boxShadow: "0 16px 45px rgba(15, 23, 42, 0.06)",
};

const panelHeaderRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "14px",
  marginBottom: "16px",
};

const panelTitle: React.CSSProperties = {
  margin: 0,
  fontSize: "30px",
  fontWeight: 800,
};

const panelHeaderMeta: React.CSSProperties = {
  color: "#64748b",
  fontWeight: 700,
};

const label: React.CSSProperties = {
  display: "block",
  marginTop: "14px",
  marginBottom: "8px",
  fontWeight: 700,
  color: "#334155",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "16px 18px",
  borderRadius: "16px",
  border: "1px solid #dbe3ee",
  background: "#fbfdff",
  fontSize: "16px",
  color: "#111827",
  boxSizing: "border-box",
  outline: "none",
};

const textarea: React.CSSProperties = {
  width: "100%",
  minHeight: "120px",
  padding: "16px 18px",
  borderRadius: "16px",
  border: "1px solid #dbe3ee",
  background: "#fbfdff",
  fontSize: "16px",
  color: "#111827",
  boxSizing: "border-box",
  outline: "none",
  resize: "vertical",
  fontFamily: "inherit",
};

const removeButton: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: "14px",
  border: "none",
  background: "#ef4444",
  color: "#ffffff",
  fontWeight: 800,
  cursor: "pointer",
};

const heroPreviewImage: React.CSSProperties = {
  width: "100%",
  height: "240px",
  objectFit: "cover",
  borderRadius: "22px",
  border: "1px solid #e2e8f0",
  marginTop: "18px",
  marginBottom: "6px",
};

const heroEmpty: React.CSSProperties = {
  width: "100%",
  height: "240px",
  borderRadius: "22px",
  border: "1px dashed #cbd5e1",
  background: "#f8fafc",
  color: "#94a3b8",
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: "18px",
  marginBottom: "6px",
};

const logoPreviewWrap: React.CSSProperties = {
  width: "100%",
  height: "180px",
  borderRadius: "22px",
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: "18px",
  marginBottom: "6px",
};

const logoPreviewImage: React.CSSProperties = {
  maxWidth: "140px",
  maxHeight: "140px",
  objectFit: "contain",
};

const logoEmpty: React.CSSProperties = {
  width: "100%",
  height: "180px",
  borderRadius: "22px",
  border: "1px dashed #cbd5e1",
  background: "#f8fafc",
  color: "#94a3b8",
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: "18px",
  marginBottom: "6px",
};

const foodPreviewImage: React.CSSProperties = {
  width: "100%",
  height: "220px",
  objectFit: "cover",
  borderRadius: "22px",
  border: "1px solid #e2e8f0",
  marginTop: "18px",
};

const menuList: React.CSSProperties = {
  display: "grid",
  gap: "14px",
};

const menuRow: React.CSSProperties = {
  display: "flex",
  gap: "14px",
  alignItems: "center",
  background: "#ffffff",
  border: "1px solid #edf2f7",
  borderRadius: "18px",
  padding: "12px",
};

const menuImage: React.CSSProperties = {
  width: "76px",
  height: "76px",
  objectFit: "cover",
  borderRadius: "18px",
  border: "1px solid #e2e8f0",
};

const menuImagePlaceholder: React.CSSProperties = {
  width: "76px",
  height: "76px",
  borderRadius: "18px",
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#94a3b8",
  fontSize: "12px",
  fontWeight: 700,
};

const menuName: React.CSSProperties = {
  fontWeight: 800,
  fontSize: "18px",
  color: "#111827",
};

const menuPrice: React.CSSProperties = {
  marginTop: "6px",
  color: "#64748b",
  fontWeight: 700,
};

const menuDesc: React.CSSProperties = {
  marginTop: "6px",
  color: "#94a3b8",
  fontSize: "13px",
};

const previewShell: React.CSSProperties = {
  background: "#f8fbff",
  borderRadius: "24px",
  border: "1px solid #dbeafe",
  padding: "18px",
};

const previewTopBar: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
};

const previewLabel: React.CSSProperties = {
  color: "#3b82f6",
  fontWeight: 700,
  fontSize: "13px",
};

const previewStoreName: React.CSSProperties = {
  marginTop: "6px",
  fontSize: "28px",
  fontWeight: 800,
  color: "#111827",
};

const previewLogoFrame: React.CSSProperties = {
  width: "74px",
  height: "74px",
  borderRadius: "18px",
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const previewLogoImage: React.CSSProperties = {
  maxWidth: "56px",
  maxHeight: "56px",
  objectFit: "contain",
};

const previewHero: React.CSSProperties = {
  marginTop: "18px",
  height: "310px",
  borderRadius: "26px",
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative",
  overflow: "hidden",
};

const previewHeroContent: React.CSSProperties = {
  position: "absolute",
  left: "22px",
  right: "22px",
  bottom: "22px",
  color: "#ffffff",
};

const previewSlug: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  opacity: 0.95,
};

const previewHeroTitle: React.CSSProperties = {
  marginTop: "8px",
  fontSize: "38px",
  fontWeight: 800,
  lineHeight: 1.05,
};

const previewHeroSub: React.CSSProperties = {
  marginTop: "8px",
  fontSize: "16px",
  opacity: 0.95,
};

const previewHeroMeta: React.CSSProperties = {
  marginTop: "6px",
  fontSize: "14px",
  opacity: 0.95,
};

const previewHeroButton: React.CSSProperties = {
  marginTop: "16px",
  display: "inline-block",
  background: "#2f7ef7",
  color: "#ffffff",
  borderRadius: "14px",
  padding: "12px 16px",
  fontWeight: 800,
};

const previewHeroEmpty: React.CSSProperties = {
  marginTop: "18px",
  height: "240px",
  borderRadius: "26px",
  border: "1px dashed #cbd5e1",
  background: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#94a3b8",
  fontWeight: 700,
};

const previewSectionTitle: React.CSSProperties = {
  marginTop: "22px",
  fontSize: "22px",
  fontWeight: 800,
  color: "#111827",
};

const previewMenuGrid: React.CSSProperties = {
  marginTop: "16px",
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "14px",
};

const previewCard: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "22px",
  overflow: "hidden",
};

const previewCardDraft: React.CSSProperties = {
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  borderRadius: "22px",
  overflow: "hidden",
};

const previewCardImage: React.CSSProperties = {
  width: "100%",
  height: "170px",
  objectFit: "cover",
  display: "block",
};

const previewCardImageEmpty: React.CSSProperties = {
  width: "100%",
  height: "170px",
  background: "#f8fafc",
  color: "#94a3b8",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
};

const previewCardBody: React.CSSProperties = {
  padding: "16px",
};

const previewItemName: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 800,
  color: "#111827",
};

const previewItemPrice: React.CSSProperties = {
  marginTop: "8px",
  color: "#475569",
  fontWeight: 700,
};

const previewItemDesc: React.CSSProperties = {
  marginTop: "8px",
  color: "#64748b",
  fontSize: "14px",
  lineHeight: 1.5,
};

const previewEmptyCard: React.CSSProperties = {
  gridColumn: "1 / -1",
  padding: "18px",
  borderRadius: "18px",
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  color: "#64748b",
  fontWeight: 600,
};

const emptyCard: React.CSSProperties = {
  padding: "20px",
  borderRadius: "18px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  color: "#64748b",
  fontWeight: 600,
};

const loadingWrap: React.CSSProperties = {
  minHeight: "80vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "22px",
  fontWeight: 700,
  color: "#334155",
};
