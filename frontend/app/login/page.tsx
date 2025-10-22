"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Building2, Sparkles, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "../types";
import "../globals.css";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("pb");
  const [isLoading, setIsLoading] = useState(false);

  // Default credentials for each role
  const defaultCredentials: Record<UserRole, { username: string; password: string }> = {
    pb: { username: "PB", password: "pb123400" },
    spu: { username: "SPU", password: "spu123400" },
    spu_officer: { username: "SPU_OFFICER", password: "spu_officer123400" },
    cops: { username: "COPS", password: "cops123400" },
    eamvu: { username: "EAMVU", password: "eamvu123400" },
    eamvu_officer: { username: "EAMVU_OFFICER", password: "eamvu_officer123400" },
    ciu: { username: "CIU", password: "ciu123400" },
    rru: { username: "RRU", password: "rru123400" },
    risk: { username: "RISK", password: "risk123400" },
    compliance: { username: "COMPLIANCE", password: "compliance123400" },
  };

  // Auto-fill credentials on page load for default role
  useEffect(() => {
    const credentials = defaultCredentials[role];
    setUsername(credentials.username);
    setPassword(credentials.password);
  }, []);

  // Handle role change and auto-fill credentials
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    const credentials = defaultCredentials[newRole];
    setUsername(credentials.username);
    setPassword(credentials.password);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      localStorage.setItem("userRole", role);

      if (role === "pb") {
        router.push(`/dashboard/${role}/applications`);
      } else {
        router.push(`/dashboard/${role}`);
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-emerald-50/30 to-teal-50" />
      
      {/* Decorative Blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000" />

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col space-y-6 text-center lg:text-left animate-fade-in-up">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                ILOS
              </h1>
              <p className="text-sm text-muted-foreground font-medium">Intelligent Loan Origination</p>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-foreground leading-tight">
            Modern Loan
            <br />
            Management Platform
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-md">
            Streamline your loan origination process with AI-powered decision making, 
            automated workflows, and comprehensive analytics.
          </p>

          <div className="grid grid-cols-1 gap-4 mt-8">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-teal-100">
              <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">AI-Powered Decisions</h3>
                <p className="text-sm text-muted-foreground">Smart risk assessment and instant approvals</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-emerald-100">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Bank-Grade Security</h3>
                <p className="text-sm text-muted-foreground">Enterprise-level data protection</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-green-100">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Real-Time Analytics</h3>
                <p className="text-sm text-muted-foreground">Track performance and optimize workflows</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-xl animate-fade-in">
          <CardHeader className="space-y-3 pb-6">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center shadow-md">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  ILOS
                </h1>
              </div>
            </div>

            <CardTitle className="text-2xl font-bold text-center text-foreground">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-5">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-foreground">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    className="pl-10 h-11 border-border focus:ring-2 focus:ring-primary/20 transition-all"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10 h-11 border-border focus:ring-2 focus:ring-primary/20 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Role Selector */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-foreground">
                  Department / Role
                </Label>
                <Select
                  value={role}
                  onValueChange={(value) => handleRoleChange(value as UserRole)}
                >
                  <SelectTrigger className="h-11 border-border focus:ring-2 focus:ring-primary/20 transition-all">
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pb">Personal Banking (PB)</SelectItem>
                    <SelectItem value="spu">
                      Sales Processing Unit (SPU)
                    </SelectItem>
                    <SelectItem value="spu_officer">
                      SPU Officer
                    </SelectItem>
                    <SelectItem value="cops">Consumer Operations (COPS)</SelectItem>
                    <SelectItem value="eamvu">
                      External Asset Management Head
                    </SelectItem>
                    <SelectItem value="eamvu_officer">
                      EAM Officer
                    </SelectItem>
                    <SelectItem value="ciu">
                      Central Investigation Unit (CIU)
                    </SelectItem>
                    <SelectItem value="rru">Rejection Review Unit (RRU)</SelectItem>
                    <SelectItem value="risk">Risk Management</SelectItem>
                    <SelectItem value="compliance">
                      Compliance Department
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>

            {/* Login Button */}
            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                Protected by enterprise-grade security
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} ILOS Platform — Intelligent Loan Origination System
        </p>
      </div>
    </div>
  );
}
