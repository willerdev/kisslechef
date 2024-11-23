import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        console.log("User signed in:", session?.user?.id);
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sage-50 to-white p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center text-sage-600 hover:text-sage-700 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        <Card className="p-8 space-y-6 glass-card fade-in">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your KissleChef account</p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Continue with</span>
            </div>
          </div>

          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#16a34a',
                    brandAccent: '#15803d',
                    defaultButtonBackground: '#ffffff',
                    defaultButtonBackgroundHover: '#f9fafb',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '0.5rem',
                    inputBorderRadius: '0.5rem',
                  },
                },
              },
              className: {
                container: 'space-y-4',
                button: 'hover-scale',
                input: 'rounded-lg border-gray-200',
              },
            }}
            providers={[]}
            theme="light"
          />

          <div className="mt-4 text-center">
            <Link to="/admin/login" className="text-sm text-sage-600 hover:text-sage-700">
              Admin Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;