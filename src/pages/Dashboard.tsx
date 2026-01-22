// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { getAdminShops, AdminShop } from "@/lib/api";
import { CheckCircle2, XCircle, Search, Settings } from "lucide-react";
import { useStore } from "@/store/useStore";

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [shops, setShops] = useState<AdminShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        setLoading(true);
        const data = await getAdminShops();
        setShops(data || []);
      } catch (err) {
        console.error("Failed to load shops", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const filteredShops = shops.filter((shop) =>
    shop.name.toLowerCase().includes(search.toLowerCase()) ||
    shop.ownerEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-muted-foreground mt-1">
            Manage all shops and subscriptions across the platform.
          </p>
        </div>
        {/* Potentially add "Create Shop" or other top-level actions here */}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Shops ({shops.length})</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search shops or emails..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shop Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-center">LINE Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredShops.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No shops found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredShops.map((shop) => (
                    <TableRow key={shop.id}>
                      <TableCell className="font-medium">{shop.name}</TableCell>
                      <TableCell>{shop.ownerEmail}</TableCell>
                      <TableCell>
                        <Badge
                          variant={shop.tier === "Pro" ? "default" : "secondary"}
                          className={shop.tier === "Pro" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                        >
                          {shop.tier}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {shop.lineConnected ? (
                          <div className="flex items-center justify-center gap-1 text-emerald-600">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-xs font-medium">Connected</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1 text-gray-400">
                            <XCircle className="h-4 w-4" />
                            <span className="text-xs font-medium">Disconnected</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/shops/${shop.id}`)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
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
