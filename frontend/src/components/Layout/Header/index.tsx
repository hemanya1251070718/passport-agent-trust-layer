"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Signin from "@/components/Auth/SignIn";
import SignUp from "@/components/Auth/SignUp";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  NavbarWithCenteredLinks,
  NavbarErrorBoundary,
  DEFAULT_NAV_LINKS,
} from "@/components/wensity/blocks/navbar-with-centered-links";

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);

  return (
    <>
      <NavbarErrorBoundary>
        <NavbarWithCenteredLinks
          links={DEFAULT_NAV_LINKS}
          user={user}
          onSignOut={signOut}
          onSignInClick={() => setSignInOpen(true)}
          onSignUpClick={() => setSignUpOpen(true)}
          systemStatus={{
            label: "Zero-Trust Active",
            status: "operational",
          }}
          sticky={true}
          variant="glass"
        />
      </NavbarErrorBoundary>

      {/* Sign In Modal */}
      <Dialog open={signInOpen} onOpenChange={setSignInOpen}>
        <DialogContent className="bg-background border-border max-w-md w-full overflow-y-auto max-h-screen">
          <Signin />
        </DialogContent>
      </Dialog>

      {/* Sign Up Modal */}
      <Dialog open={signUpOpen} onOpenChange={setSignUpOpen}>
        <DialogContent className="bg-background border-border max-w-md w-full overflow-y-auto max-h-screen">
          <SignUp />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
