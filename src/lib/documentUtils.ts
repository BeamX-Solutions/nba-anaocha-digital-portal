import { supabase } from "@/integrations/supabase/client";

/**
 * Save a new version of a document
 * Called when document is updated or saved
 */
export const saveDocumentVersion = async (
  documentId: string,
  userId: string,
  content: string,
  formData: any
) => {
  try {
    // Get the next version number
    const { data: versions } = await (supabase as any)
      .from("document_versions")
      .select("version_number")
      .eq("document_id", documentId)
      .order("version_number", { ascending: false })
      .limit(1);

    const nextVersion = (versions?.[0]?.version_number ?? 0) + 1;

    // Save the new version
    const { error } = await (supabase as any).from("document_versions").insert({
      document_id: documentId,
      version_number: nextVersion,
      content,
      form_data: formData,
      created_by: userId,
    });

    if (error) throw error;
    return { success: true, versionNumber: nextVersion };
  } catch (error: any) {
    console.error("Error saving document version:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all versions of a document
 */
export const getDocumentVersions = async (documentId: string) => {
  try {
    const { data, error } = await (supabase as any)
      .from("document_versions")
      .select("*, created_by:profiles(first_name, surname)")
      .eq("document_id", documentId)
      .order("version_number", { ascending: false });

    if (error) throw error;
    return { success: true, versions: data || [] };
  } catch (error: any) {
    console.error("Error fetching document versions:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get a specific version of a document
 */
export const getDocumentVersion = async (documentId: string, versionNumber: number) => {
  try {
    const { data, error } = await (supabase as any)
      .from("document_versions")
      .select("*")
      .eq("document_id", documentId)
      .eq("version_number", versionNumber)
      .single();

    if (error) throw error;
    return { success: true, version: data };
  } catch (error: any) {
    console.error("Error fetching document version:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Restore a document to a previous version
 */
export const restoreDocumentVersion = async (
  documentId: string,
  versionNumber: number,
  userId: string
) => {
  try {
    // Get the version to restore
    const versionResponse = await getDocumentVersion(documentId, versionNumber);
    if (!versionResponse.success) throw new Error("Version not found");

    const version = versionResponse.version;

    // Create a new version with the restored content
    const { success, error } = await saveDocumentVersion(
      documentId,
      userId,
      version.content,
      version.form_data
    );

    if (!success) throw new Error(error);

    // Update the main document
    const { error: updateError } = await supabase
      .from("documents")
      .update({
        content: version.content,
        form_data: version.form_data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId);

    if (updateError) throw updateError;

    return { success: true, message: "Document restored successfully" };
  } catch (error: any) {
    console.error("Error restoring document version:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Submit document for approval
 */
export const submitDocumentForApproval = async (documentId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from("documents")
      .update({
        approval_status: "submitted",
        submitted_at: new Date().toISOString(),
        submitted_by: userId,
      })
      .eq("id", documentId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error submitting document for approval:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Approve a document
 */
export const approveDocument = async (
  documentId: string,
  adminId: string,
  comments?: string
) => {
  try {
    const { error } = await supabase
      .from("documents")
      .update({
        approval_status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: adminId,
        approver_comments: comments || "",
      })
      .eq("id", documentId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error approving document:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Reject a document with reason
 */
export const rejectDocument = async (
  documentId: string,
  adminId: string,
  reason: string
) => {
  try {
    const { error } = await supabase
      .from("documents")
      .update({
        approval_status: "rejected",
        rejected_at: new Date().toISOString(),
        rejected_by: adminId,
        rejection_reason: reason,
      })
      .eq("id", documentId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error rejecting document:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get pending documents for approval
 */
export const getPendingDocuments = async () => {
  try {
    const { data, error } = await supabase
      .from("documents")
      .select("*, created_by:profiles(first_name, surname)")
      .eq("approval_status", "submitted")
      .order("submitted_at", { ascending: true });

    if (error) throw error;
    return { success: true, documents: data || [] };
  } catch (error: any) {
    console.error("Error fetching pending documents:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get approval history of a document
 */
export const getApprovalHistory = async (documentId: string) => {
  try {
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("approval_status, approved_at, approved_by, rejected_at, rejected_by, rejection_reason, approver_comments")
      .eq("id", documentId)
      .single();

    if (docError) throw docError;
    return { success: true, history: doc };
  } catch (error: any) {
    console.error("Error fetching approval history:", error);
    return { success: false, error: error.message };
  }
};
