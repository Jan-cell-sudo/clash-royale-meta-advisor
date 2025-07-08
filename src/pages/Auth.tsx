import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, signIn, signUp } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        if (isLogin) {
          toast({
            title: "Success",
            description: "Signed in successfully!",
          });
        } else {
          toast({
            title: "Success", 
            description: "Account created! Please check your email to verify your account.",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-md mx-auto py-12 space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-game-title text-game-title text-foreground animate-bounce-subtle">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </h1>
          <p className="text-xl font-game-body text-foreground/90">
            {isLogin ? 'Welcome back, Commander!' : 'Join the Meta Analytics Community'}
          </p>
        </div>

        <Card className="game-card">
          <CardHeader style={{
            background: 'var(--gradient-silver)',
            borderBottom: '4px solid hsl(var(--accent))'
          }}>
            <CardTitle className="font-game-title text-xl text-foreground">
              {isLogin ? 'Sign In' : 'Create Account'}
            </CardTitle>
            <CardDescription className="font-game text-foreground/80">
              {isLogin ? 'Enter your email and password' : 'Create your account to contribute to the meta'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-game text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="font-game"
                  placeholder="commander@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="font-game text-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="font-game"
                  placeholder="Enter your password"
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full font-game-title"
              >
                {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-game text-accent hover:text-accent/80 transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Auth;