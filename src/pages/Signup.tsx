import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

const Signup = () => {
  const navigate = useNavigate();

  // Check if user is already logged in
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN") {
      console.log("User signed in:", session?.user?.id);
      navigate("/");
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sage-50 to-white p-4">
      <Card className="w-full max-w-md p-8 glass-card fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create an account</h1>
          <p className="text-gray-600">Join KissleChef today</p>
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
                },
              },
            },
          }}
          providers={[]}
          view="sign_up"
          theme="light"
        />
      </Card>
    </div>
  );
};

export default Signup;