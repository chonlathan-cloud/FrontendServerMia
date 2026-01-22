// src/pages/admin/ShopManage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import {
    getAdminShopDetail,
    updateShopIntegration,
    updateShopTier,
    AdminShop
} from "@/lib/api";

type ShopDetail = AdminShop & {
    lineConfig?: {
        channelAccessToken?: string;
        channelSecret?: string;
        lineUserId?: string;
        displayName?: string;
    };
};

export default function ShopManage() {
    const { shopId } = useParams<{ shopId: string }>();
    const navigate = useNavigate();
    const [shop, setShop] = useState<ShopDetail | null>(null);
    const [loading, setLoading] = useState(true);

    // Integration State
    const [channelAccessToken, setChannelAccessToken] = useState("");
    const [channelSecret, setChannelSecret] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [lineUserId, setLineUserId] = useState("");
    const [savingIntegration, setSavingIntegration] = useState(false);

    // Plan State
    const [tier, setTier] = useState<"Free" | "Pro">("Free");
    const [savingTier, setSavingTier] = useState(false);

    useEffect(() => {
        async function load() {
            if (!shopId) return;
            try {
                setLoading(true);
                // Note: You might need to adjust this if getAdminShopDetail returns something different
                // Assuming it returns { id, name, ... lineConfig: { ... } }
                const data: any = await getAdminShopDetail(shopId);

                // Handle wrapping if API returns { success: true, data: ... }
                const shopData = data?.data || data;

                setShop(shopData);
                if (shopData) {
                    // Init Integration
                    const line = shopData.lineConfig || {};
                    setChannelAccessToken(line.channelAccessToken || "");
                    setChannelSecret(line.channelSecret || "");
                    setDisplayName(line.displayName || "");
                    setLineUserId(line.lineUserId || "");

                    // Init Plan
                    setTier(shopData.tier || "Free");
                }
            } catch (err) {
                console.error("Failed to load shop detail", err);
                toast.error("Failed to load shop details");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [shopId]);

    async function handleSaveIntegration() {
        if (!shopId) return;
        setSavingIntegration(true);
        try {
            await updateShopIntegration(shopId, {
                channelAccessToken,
                channelSecret,
                lineUserId,
                displayName,
            });
            toast.success("Integration settings saved");
        } catch (err: any) {
            console.error("Save integration failed", err);
            toast.error(err?.message || "Failed to save integration");
        } finally {
            setSavingIntegration(false);
        }
    }

    async function handleSaveTier() {
        if (!shopId) return;
        setSavingTier(true);
        try {
            await updateShopTier(shopId, tier);
            toast.success("Shop tier updated");
            // Update local state if needed
            if (shop) setShop({ ...shop, tier });
        } catch (err: any) {
            console.error("Save tier failed", err);
            toast.error(err?.message || "Failed to update tier");
        } finally {
            setSavingTier(false);
        }
    }

    if (loading) {
        return <div className="p-8 text-center">Loading shop details...</div>;
    }

    if (!shop) {
        return <div className="p-8 text-center">Shop not found</div>;
    }

    return (
        <div className="p-8 space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{shop.name}</h1>
                    <p className="text-muted-foreground">{shop.ownerEmail}</p>
                </div>
            </div>

            <Tabs defaultValue="integration" className="w-full">
                <TabsList>
                    <TabsTrigger value="integration">LINE Integration</TabsTrigger>
                    <TabsTrigger value="plan">Plan & Billing</TabsTrigger>
                </TabsList>

                {/* TAB 1: INTEGRATION */}
                <TabsContent value="integration" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>LINE Official Account Integration</CardTitle>
                            <CardDescription>
                                Configure the Messaging API channel settings for this shop.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Channel Access Token</Label>
                                <Input
                                    value={channelAccessToken}
                                    onChange={(e) => setChannelAccessToken(e.target.value)}
                                    placeholder="Enter Channel Access Token"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Channel Secret</Label>
                                <Input
                                    value={channelSecret}
                                    onChange={(e) => setChannelSecret(e.target.value)}
                                    placeholder="Enter Channel Secret"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>LINE User ID (Bot ID)</Label>
                                    <Input
                                        value={lineUserId}
                                        onChange={(e) => setLineUserId(e.target.value)}
                                        placeholder="@example"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Display Name</Label>
                                    <Input
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Shop Name on LINE"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button onClick={handleSaveIntegration} disabled={savingIntegration}>
                                    <Save className="w-4 h-4 mr-2" />
                                    {savingIntegration ? "Saving..." : "Save Configuration"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 2: PLAN */}
                <TabsContent value="plan" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Subscription Plan</CardTitle>
                            <CardDescription>
                                Manage the subscription tier for this shop.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 max-w-md">
                            <div className="space-y-2">
                                <Label>Current Tier</Label>
                                <Select value={tier} onValueChange={(v: "Free" | "Pro") => setTier(v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a tier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Free">Free</SelectItem>
                                        <SelectItem value="Pro">Pro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-4">
                                <Button onClick={handleSaveTier} disabled={savingTier}>
                                    <Save className="w-4 h-4 mr-2" />
                                    {savingTier ? "Updating..." : "Update Plan"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
