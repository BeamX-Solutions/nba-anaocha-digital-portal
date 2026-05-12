import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, FileText, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Step4DocumentSavedProps {
  referenceNumber: string;
  documentTitle: string;
  onCreateNew?: () => void;
}

export const Step4DocumentSaved = ({
  referenceNumber,
  documentTitle,
  onCreateNew,
}: Step4DocumentSavedProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-green-900">Document Saved Successfully!</CardTitle>
          <CardDescription className="text-green-700">
            Your document has been saved and is ready for the next steps.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Reference Number:</p>
            <p className="font-mono text-lg font-semibold text-green-700 break-all">
              {referenceNumber}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Document Title:</p>
            <p className="font-medium text-slate-900">{documentTitle}</p>
          </div>

          <div className="border-l-4 border-blue-500 bg-blue-50 rounded p-4 mt-6">
            <h4 className="font-semibold text-blue-900 mb-2">Next Steps:</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">1.</span>
                <span><strong>Review:</strong> Check the document for accuracy and completeness</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                <span><strong>Edit:</strong> Make any necessary revisions before submission</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">3.</span>
                <span><strong>Submit:</strong> When ready, submit the document for admin approval</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">4.</span>
                <span><strong>Track:</strong> Monitor approval status in your dashboard</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={() => navigate("/anaocha/my-documents")}
          variant="outline"
          className="w-full h-24 flex-col justify-center"
        >
          <FileText className="h-6 w-6 mb-2" />
          <span>View My Documents</span>
        </Button>

        <Button
          onClick={() => navigate("/anaocha/dashboard")}
          variant="outline"
          className="w-full h-24 flex-col justify-center"
        >
          <Home className="h-6 w-6 mb-2" />
          <span>Back to Dashboard</span>
        </Button>
      </div>

      {onCreateNew && (
        <div className="pt-4 border-t">
          <Button
            onClick={onCreateNew}
            variant="secondary"
            className="w-full"
          >
            Create Another Document
          </Button>
        </div>
      )}
    </div>
  );
};
