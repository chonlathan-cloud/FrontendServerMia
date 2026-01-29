import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Store, Search } from "lucide-react";
import { toast } from "sonner";
import { getAdminShops, createAdminShop, AdminShop } from "@/lib/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [shops, setShops] = useState<AdminShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // State สำหรับสร้างร้าน
  const [openCreate, setOpenCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [creating, setCreating] = useState(false);

  // โหลดข้อมูลร้านค้า
  async function loadShops() {
    setLoading(true);
    try {
      const data = await getAdminShops();
      // รองรับทั้งแบบ array ตรงๆ หรือ { data: [...] }
      const list = Array.isArray(data) ? data : (data as any).data || [];
      setShops(list);
    } catch (err) {
      console.error(err);
      toast.error("โหลดข้อมูลร้านค้าไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadShops();
  }, []);

  // ฟังก์ชันสร้างร้าน
  async function handleCreate() {
    if (!newName.trim() || !newOwner.trim()) {
      toast.error("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    setCreating(true);
    try {
      await createAdminShop(newName, newOwner);
      toast.success("สร้างร้านค้าสำเร็จ");
      setOpenCreate(false);
      setNewName("");
      setNewOwner("");
      loadShops(); // โหลดข้อมูลใหม่
    } catch (err: any) {
      toast.error(err?.message || "สร้างร้านไม่สำเร็จ");
    } finally {
      setCreating(false);
    }
  }

  // กรองร้านค้าตามคำค้นหา
  const filteredShops = shops.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ร้านค้าทั้งหมด</h1>
          <p className="text-muted-foreground">จัดการร้านค้าและตั้งค่า LINE OA</p>
        </div>

        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="mr-2 h-4 w-4" /> เพิ่มร้านค้าใหม่
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>สร้างร้านค้าใหม่</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ชื่อร้าน</label>
                <Input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="เช่น My Coffee Shop"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Owner ID / Email</label>
                <Input
                  value={newOwner}
                  onChange={e => setNewOwner(e.target.value)}
                  placeholder="ระบุ Email เจ้าของร้าน"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenCreate(false)}>ยกเลิก</Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? "กำลังสร้าง..." : "ยืนยัน"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              placeholder="ค้นหาชื่อร้าน หรือ ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อร้าน</TableHead>
                  <TableHead>Shop ID</TableHead>
                  <TableHead>แพ็คเกจ</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">กำลังโหลด...</TableCell>
                  </TableRow>
                ) : filteredShops.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">ไม่พบร้านค้า</TableCell>
                  </TableRow>
                ) : (
                  filteredShops.map((shop) => (
                    <TableRow
                      key={shop.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/shops/${shop.shop_id || shop.id}`)} // 👉 คลิกแล้วไปหน้า ShopManage
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-emerald-100 flex items-center justify-center text-emerald-700">
                            <Store size={16} />
                          </div>
                          {shop.name}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {shop.shop_id || shop.id}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{shop.tier || "Free"}</Badge>
                      </TableCell>
                      <TableCell>
                        {/* เช็คเบื้องต้นว่ามี config ไหม (ต้องปรับตาม data จริง) */}
                        {(shop as any).line_config ? (
                          <Badge className="bg-green-600">LINE Connected</Badge>
                        ) : (
                          <Badge variant="outline">No Integration</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">ตั้งค่า</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}