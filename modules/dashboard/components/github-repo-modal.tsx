"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lock, Search, Download } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import {
  getGithubConnectionStatus,
  importGithubRepository,
  listGithubRepositories,
} from "../actions/github";
import type { GithubRepoSummary } from "@/lib/github";
import { signIn } from "next-auth/react";

interface GithubRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GithubRepoModal = ({ isOpen, onClose }: GithubRepoModalProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [repos, setRepos] = useState<GithubRepoSummary[]>([]);
  const [search, setSearch] = useState("");
  const [importingRepoId, setImportingRepoId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      const status = await getGithubConnectionStatus();
      if (cancelled) return;

      if (!status.connected) {
        setIsConnected(false);
        setIsLoading(false);
        return;
      }

      setIsConnected(true);
      const { repos, error } = await listGithubRepositories();
      if (cancelled) return;

      if (error) {
        toast.error("Couldn't load your GitHub repositories. Try again.");
      } else {
        setRepos(repos);
      }
      setIsLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const handleConnectGithub = () => {
    signIn("github", { callbackUrl: "/dashboard" });
  };

  const handleImport = async (repo: GithubRepoSummary) => {
    setImportingRepoId(repo.id);
    try {
      const playground = await importGithubRepository({
        owner: repo.owner,
        repo: repo.name,
        branch: repo.defaultBranch,
      });

      toast.success(`Imported ${repo.fullName}`);
      onClose();
      router.push(`/playground/${playground.id}`);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to import repository",
      );
    } finally {
      setImportingRepoId(null);
    }
  };

  const filteredRepos = repos.filter((repo) =>
    repo.fullName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FaGithub className="h-5 w-5" />
            Import from GitHub
          </DialogTitle>
          <DialogDescription>
            Pick a repository to open in a new playground.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !isConnected ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-10 text-center">
            <p className="text-sm text-muted-foreground max-w-sm">
              Connect your GitHub account to browse and import your
              repositories.
            </p>
            <Button onClick={handleConnectGithub} className="gap-2">
              <FaGithub className="h-4 w-4" />
              Connect GitHub
            </Button>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search repositories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-2">
              {filteredRepos.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No repositories found.
                </p>
              )}

              {filteredRepos.map((repo) => (
                <div
                  key={repo.id}
                  className="flex items-center justify-between gap-3 border rounded-lg px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {repo.fullName}
                      </span>
                      {repo.private && (
                        <Badge variant="outline" className="gap-1 shrink-0">
                          <Lock className="h-3 w-3" />
                          Private
                        </Badge>
                      )}
                    </div>
                    {repo.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {repo.description}
                      </p>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1.5"
                    disabled={importingRepoId !== null}
                    onClick={() => handleImport(repo)}
                  >
                    {importingRepoId === repo.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    Import
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GithubRepoModal;
