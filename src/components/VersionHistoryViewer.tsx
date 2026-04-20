import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { getDocumentVersions, restoreDocumentVersion } from "@/lib/documentUtils";
import { History, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VersionHistoryViewerProps {
  documentId: string;
  onRestore?: () => void;
}

interface DocumentVersion {
  id: string;
  version_number: number;
  content: string;
  created_at: string;
  created_by: string;
  created_by_profile?: {
    first_name: string;
    surname: string;
  };
}

export const VersionHistoryViewer = ({ documentId, onRestore }: VersionHistoryViewerProps) => {
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (open) {
      loadVersions();
    }
  }, [open]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const { success, versions: data } = await getDocumentVersions(documentId);
      if (success && data) {
        setVersions(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load version history",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (version: DocumentVersion) => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    
    try {
      const { success, error } = await restoreDocumentVersion(
        documentId,
        version.version_number,
        currentUser.id
      );

      if (success) {
        toast({
          title: "Version Restored",
          description: `Document restored to version ${version.version_number}`,
        });
        setPreviewOpen(false);
        onRestore?.();
        loadVersions();
      } else {
        toast({
          title: "Error",
          description: error || "Failed to restore version",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to restore version",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAuthorName = (version: DocumentVersion) => {
    if (version.created_by_profile) {
      return `${version.created_by_profile.first_name} ${version.created_by_profile.surname}`;
    }
    return "Unknown";
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <History className="h-4 w-4 mr-2" />
        Version History
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Document Version History</DialogTitle>
            <DialogDescription>
              View and restore previous versions of this document
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center py-8">
              <span className="text-muted-foreground">Loading versions...</span>
            </div>
          ) : versions.length === 0 ? (
            <div className="flex justify-center py-8">
              <span className="text-muted-foreground">No versions found</span>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className="border rounded-lg p-4 hover:bg-slate-50 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">v{version.version_number}</Badge>
                        {index === 0 && <Badge>Current</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Created by {getAuthorName(version)} on {formatDate(version.created_at)}
                      </p>
                    </div>

                    {index > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedVersion(version);
                          setPreviewOpen(true);
                        }}
                      >
                        Preview
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview and Restore Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Version {selectedVersion?.version_number} Preview
            </DialogTitle>
            <DialogDescription>
              Review this version before restoring
            </DialogDescription>
          </DialogHeader>

          <div className="border rounded-lg p-4 bg-slate-50 max-h-[50vh] overflow-y-auto">
            <p className="text-sm whitespace-pre-wrap font-mono">
              {selectedVersion?.content?.substring(0, 1000)}
              {(selectedVersion?.content?.length || 0) > 1000 && "..."}
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleRestore(selectedVersion!)}
              variant="default"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore This Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
