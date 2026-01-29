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
import { ArrowLeft, Save, RefreshCw } from "lucide-react";
import {
    getAdminShopDetail,
    updateShopIntegration,
    updateShopTier,
    AdminShop
} from "@/lib/api";

// ✅ 1. เพิ่ม Type ให้ครบถ้วน เพื่อไม่ให้ TypeScript ฟ้องแดง
type ShopDetail = AdminShop & {
    lineConfig?: {
        channelAccessToken?: string;
        channelSecret?: string;
        botBasicId?: string; // เพิ่มตัวนี้ (U...)
        basicId?: string;    // เพิ่มตัวนี้ (@...)
        lineUserId?: string; // ตัวเก่า (เผื่อมี)
        displayName?: string;
        pictureUrl?: string;
    };
    public_url?: string;
};

export default function ShopManage() {
    const { shopId } = useParams<{ shopId: string }>();
    const navigate = useNavigate();
    const [shop, setShop] = useState<ShopDetail | null>(null);
    const [loading, setLoading] = useState(true);

    // Integration State
    const [channelAccessToken, setChannelAccessToken] = useState("");
    const [channelSecret, setChannelSecret] = useState("");
    const [savingIntegration, setSavingIntegration] = useState(false);

    // Plan State
    const [tier, setTier] = useState<"Free" | "Pro">("Free");
    const [savingTier, setSavingTier] = useState(false);

    useEffect(() => {
        async function load() {
            if (!shopId) return;
            try {
                setLoading(true);
                const data: any = await getAdminShopDetail(shopId);
                const shopData = data?.data || data;

                setShop(shopData);
                if (shopData) {
                    // Init Integration Inputs
                    const line = shopData.lineConfig || {};
                    setChannelAccessToken(line.channelAccessToken || "");
                    setChannelSecret(line.channelSecret || "");

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
            // ✅ ส่งแค่ Token กับ Secret ก็พอ Backend จะจัดการดึง BotID ให้เอง
            await updateShopIntegration(shopId, {
                channelAccessToken: channelAccessToken,
                channelSecret: channelSecret,
            });

            toast.success("บันทึกสำเร็จ! ระบบกำลังดึงข้อมูล LINE OA...");

            // Reload เพื่อแสดงผลข้อมูลที่ Auto-detect มาได้
            setTimeout(() => window.location.reload(), 1500);

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

    // Helper เพื่อดึงค่า ID ที่มีอยู่ (Prioritize: botBasicId -> basicId -> lineUserId)
    const displayBotId = shop?.lineConfig?.botBasicId || shop?.lineConfig?.basicId || shop?.lineConfig?.lineUserId;
    const publicUrl = shop?.public_url;

    const copyText = async (label: string, value?: string | null) => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            toast.success(`คัดลอก ${label} แล้ว`);
        } catch (error) {
            console.error("copy failed", error);
            toast.error("คัดลอกไม่สำเร็จ");
        }
    };

    return (
        <div className="p-8 space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{shop.name}</h1>
                    <p className="text-muted-foreground">Shop ID: {shop.shop_id || shop.id}</p>
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
                                ใส่ Channel Access Token และ Secret เพื่อเชื่อมต่อ (ระบบจะดึงข้อมูลบอทให้อัตโนมัติ)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* รูปโปรไฟล์บอท (ถ้ามี) */}
                            {shop?.lineConfig?.pictureUrl && (
                                <div className="flex justify-center mb-4">
                                    <img
                                        src={shop.lineConfig.pictureUrl}
                                        alt="Bot Profile"
                                        className="w-20 h-20 rounded-full border shadow-sm"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Channel Access Token <span className="text-red-500">*</span></Label>
                                <Input
                                    value={channelAccessToken}
                                    onChange={(e) => setChannelAccessToken(e.target.value)}
                                    placeholder="Enter Channel Access Token"
                                    className="font-mono text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Channel Secret <span className="text-red-500">*</span></Label>
                                <Input
                                    value={channelSecret}
                                    onChange={(e) => setChannelSecret(e.target.value)}
                                    placeholder="Enter Channel Secret"
                                    type="password"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-2">
                                    <Label>LINE User ID (Bot ID)</Label>
                                    <Input
                                        value={displayBotId || "รอการเชื่อมต่อ..."}
                                        disabled={true}
                                        className="bg-slate-100 text-slate-600 font-mono"
                                    />
                                    <p className="text-[11px] text-muted-foreground">
                                        *ระบบดึงให้อัตโนมัติ (ใช้สำหรับ Webhook)
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Display Name</Label>
                                    <Input
                                        value={shop?.lineConfig?.displayName || "-"}
                                        disabled={true}
                                        className="bg-slate-100 text-slate-600"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <Label>Public Website URL</Label>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <Input
                                        value={publicUrl || "รอการเชื่อมต่อ..."}
                                        disabled={true}
                                        className="bg-slate-100 text-slate-600 font-mono"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => copyText("ลิงก์เว็บไซต์", publicUrl)}
                                        disabled={!publicUrl}
                                    >
                                        คัดลอกลิงก์
                                    </Button>
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    ใช้ลิงก์นี้สำหรับ Rich Menu ของร้าน
                                </p>
                            </div>

                            <div className="pt-6 flex justify-end">
                                <Button onClick={handleSaveIntegration} disabled={savingIntegration} className="w-full sm:w-auto">
                                    {savingIntegration ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Save & Connect
                                        </>
                                    )}
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
