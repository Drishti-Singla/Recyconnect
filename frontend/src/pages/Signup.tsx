import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Recycle, Eye, EyeOff, CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/services/api";

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [invalidEmailCount, setInvalidEmailCount] = useState(0);
  const [showMeme, setShowMeme] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    collegeCode: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validCollegeCodes = ["CHIT01", "CHIT02", "UNIV03", "COL004", "EDU005"];

  const validateField = (name: string, value: string) => {
    let error = "";
    
    switch (name) {
      case "username":
        if (!value.trim()) error = "Username is required";
        else if (value.length < 3) error = "Username must be at least 3 characters";
        break;
      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!value.endsWith("@chitkara.edu.in")) {
          error = "Email must end with @chitkara.edu.in";
          setInvalidEmailCount((prev) => {
            const newCount = prev + 1;
            if (newCount >= 3) setShowMeme(true);
            return newCount;
          });
        }
        break;
      case "collegeCode":
        if (!value.trim()) error = "College code is required";
        else if (value.length !== 6) error = "College code must be 6 characters";
        else if (!validCollegeCodes.includes(value.toUpperCase())) error = "Invalid college code";
        break;
      case "phone":
        if (!value.trim()) error = "Phone number is required";
        else if (!/^\d{10}$/.test(value)) error = "Phone must be exactly 10 digits";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 8) error = "Password must be at least 8 characters";
        break;
      case "confirmPassword":
        if (!value) error = "Please confirm your password";
        else if (value !== formData.password) error = "Passwords do not match";
        break;
    }
    
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const isFormValid = () => {
    return (
      formData.username.trim().length >= 3 &&
      formData.email.endsWith("@chitkara.edu.in") &&
      validCollegeCodes.includes(formData.collegeCode.toUpperCase()) &&
      /^\d{10}$/.test(formData.phone) &&
      formData.password.length >= 8 &&
      formData.password === formData.confirmPassword
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });
    
    setErrors(newErrors);
    setTouched({
      username: true,
      email: true,
      collegeCode: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);

    try {
      await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        collegeCode: formData.collegeCode
      });

      toast({
        title: "Account created successfully!",
        description: "Welcome to Recyconnect. Please login to continue.",
      });

      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }

  };

  const getFieldStatus = (name: string) => {
    if (!touched[name]) return null;
    return errors[name] ? "error" : "success";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted via-background to-muted py-12 px-4">
      {/* Meme Modal */}
      {showMeme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-card rounded-2xl p-8 max-w-md mx-4 text-center shadow-elevated animate-scale-in">
            <div className="text-6xl mb-4">🤔</div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-2">
              Having trouble?
            </h3>
            <p className="text-muted-foreground mb-4">
              Remember: Only @chitkara.edu.in emails are allowed!
            </p>
            <img 
              src="https://i.imgflip.com/1p7d8g.jpg" 
              alt="Thinking meme"
              className="w-full max-w-xs mx-auto rounded-lg mb-4"
            />
            <Button onClick={() => setShowMeme(false)}>
              Got it!
            </Button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Back to Home</span>
        </Link>

        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
            <Recycle className="w-7 h-7 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-2xl text-foreground">
            RecyConnect
          </span>
        </Link>

        {/* Form Card */}
        <div className="bg-card rounded-2xl p-8 shadow-elevated border border-border/50">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Create Account
            </h1>
            <p className="text-muted-foreground">
              Join our sustainable community today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username / Profile Name</Label>
              <div className="relative">
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`pr-10 ${
                    getFieldStatus("username") === "error" ? "border-destructive" : 
                    getFieldStatus("username") === "success" ? "border-secondary" : ""
                  }`}
                />
                {getFieldStatus("username") && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {getFieldStatus("username") === "error" ? (
                      <XCircle className="w-5 h-5 text-destructive" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-secondary" />
                    )}
                  </div>
                )}
              </div>
              {errors.username && touched.username && (
                <p className="text-sm text-destructive">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="yourname@chitkara.edu.in"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`pr-10 ${
                    getFieldStatus("email") === "error" ? "border-destructive" : 
                    getFieldStatus("email") === "success" ? "border-secondary" : ""
                  }`}
                />
                {getFieldStatus("email") && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {getFieldStatus("email") === "error" ? (
                      <XCircle className="w-5 h-5 text-destructive" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-secondary" />
                    )}
                  </div>
                )}
              </div>
              {errors.email && touched.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* College Code */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="collegeCode">College Code</Label>
                <span className="text-xs text-muted-foreground" title="Enter the unique code provided by your college">
                  ℹ️
                </span>
              </div>
              <div className="relative">
                <Input
                  id="collegeCode"
                  name="collegeCode"
                  type="text"
                  placeholder="e.g., CHIT01"
                  value={formData.collegeCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={6}
                  className={`pr-10 uppercase ${
                    getFieldStatus("collegeCode") === "error" ? "border-destructive" : 
                    getFieldStatus("collegeCode") === "success" ? "border-secondary" : ""
                  }`}
                />
                {getFieldStatus("collegeCode") && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {getFieldStatus("collegeCode") === "error" ? (
                      <XCircle className="w-5 h-5 text-destructive" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-secondary" />
                    )}
                  </div>
                )}
              </div>
              {errors.collegeCode && touched.collegeCode && (
                <p className="text-sm text-destructive">{errors.collegeCode}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="10-digit phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={10}
                  className={`pr-10 ${
                    getFieldStatus("phone") === "error" ? "border-destructive" : 
                    getFieldStatus("phone") === "success" ? "border-secondary" : ""
                  }`}
                />
                {getFieldStatus("phone") && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {getFieldStatus("phone") === "error" ? (
                      <XCircle className="w-5 h-5 text-destructive" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-secondary" />
                    )}
                  </div>
                )}
              </div>
              {errors.phone && touched.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`pr-20 ${
                    getFieldStatus("password") === "error" ? "border-destructive" : 
                    getFieldStatus("password") === "success" ? "border-secondary" : ""
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {getFieldStatus("password") && (
                    getFieldStatus("password") === "error" ? (
                      <XCircle className="w-5 h-5 text-destructive" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-secondary" />
                    )
                  )}
                </div>
              </div>
              {errors.password && touched.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`pr-20 ${
                    getFieldStatus("confirmPassword") === "error" ? "border-destructive" : 
                    getFieldStatus("confirmPassword") === "success" ? "border-secondary" : ""
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {getFieldStatus("confirmPassword") && (
                    getFieldStatus("confirmPassword") === "error" ? (
                      <XCircle className="w-5 h-5 text-destructive" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-secondary" />
                    )
                  )}
                </div>
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!isFormValid() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-center text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Login
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-muted/50 rounded-xl border border-border/50">
          <p className="text-sm font-semibold text-foreground mb-3 text-center">Demo Credentials:</p>
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Admin:</span> admin@chitkara.edu.in | CHIT01 | admin@chitkara.edu.in
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">User:</span> user@chitkara.edu.in | CHIT01 | user@chitkara.edu.in
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
