import { useState } from "react";
import { Link } from "react-router";
// import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { GraduationCap, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // const { error } = await supabase.auth.resetPasswordForEmail(email, {
    //   redirectTo: `${window.location.origin}/reset-password`,
    // });
    // setLoading(false);
    // if (error) {
    //   toast.error(error.message);
    // } else {
    //   setSent(true);
    // }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 animate-in">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Reset password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            We'll send you a reset link
          </p>
        </div>

        {sent ? (
          <div className="glass-card p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6 text-success" />
            </div>
            <p className="text-sm text-foreground">
              Check your email for a password reset link.
            </p>
            <Link
              to="/login"
              className="text-primary text-sm hover:underline font-medium"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="glass-card p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="you@school.edu"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full rounded-lg"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}

        <p className="text-center text-sm">
          <Link
            to="/login"
            className="text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" /> Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
