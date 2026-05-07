import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const AdminRevenue = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-yellow-500 mb-6 transition-smooth">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="font-serif text-4xl mb-4">Revenue & Analytics</h1>
        <p className="text-muted-foreground mb-8">Track revenue, financial reports, and analytics.</p>
        
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">Revenue analytics page - Coming soon</p>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenue;
