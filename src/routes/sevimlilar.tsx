import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, FolderPlus, Folder, MoreVertical, Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/uyjoy/site-header";
import { SiteFooter } from "@/components/uyjoy/site-footer";
import { PropertyCard } from "@/components/uyjoy/property-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/i18n";
import { listings } from "@/data/listings";

export const Route = createFileRoute("/sevimlilar")({
  head: () => ({
    meta: [
      { title: "Sevimlilar — UyJoy.uz" },
      { name: "description", content: "Saqlangan e'lonlaringiz" },
    ],
  }),
  component: FavoritesPage,
});

// Mock folders for demo
const mockFolders = [
  { id: "all", name: "Barchasi", count: 3 },
  { id: "tashkent", name: "Toshkentdagi uylar", count: 2 },
  { id: "investment", name: "Investitsiya uchun", count: 1 },
];

function FavoritesPage() {
  const { t } = useTranslation();
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Mock favorites - in real app, these would come from API
  const favoriteListings = listings.slice(0, 3);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      // In real app, call API to create folder
      setNewFolderName("");
      setIsCreateDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold md:text-4xl">
              {t.favorites.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {favoriteListings.length} ta saqlangan e'lon
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="soft">
                <FolderPlus className="mr-2 size-4" />
                {t.favorites.createFolder}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.favorites.createFolder}</DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder={t.favorites.folderName}
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)}>
                    {t.common.cancel}
                  </Button>
                  <Button onClick={handleCreateFolder}>{t.common.save}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Folders sidebar */}
          <aside className="h-fit space-y-2 rounded-2xl border border-border bg-card p-4 shadow-card lg:sticky lg:top-24">
            <p className="mb-3 flex items-center gap-2 px-2 text-sm font-semibold text-muted-foreground">
              <Folder className="size-4" />
              {t.favorites.folders}
            </p>
            {mockFolders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  selectedFolder === folder.id
                    ? "bg-secondary font-medium"
                    : "hover:bg-secondary/50"
                }`}
              >
                <span>{folder.name}</span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {folder.count}
                  </span>
                  {folder.id !== "all" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="rounded p-1 hover:bg-muted"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="size-4 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>{t.common.edit}</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 size-4" />
                          {t.common.delete}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </button>
            ))}
          </aside>

          {/* Listings */}
          <section>
            {favoriteListings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-16 text-center">
                <Heart className="mx-auto size-12 text-muted-foreground/40" />
                <p className="mt-4 font-semibold">{t.favorites.empty}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t.favorites.emptyDesc}</p>
                <Button variant="soft" className="mt-6" asChild>
                  <Link to="/elonlar">{t.listings.allListings}</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {favoriteListings.map((listing) => (
                  <PropertyCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
