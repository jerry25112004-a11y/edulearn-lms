import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ConfirmProvider } from "@/components/ui/confirm-dialog";
import "@fontsource-variable/lora";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "EduLearn — Online Course Learning Management Platform",
    template: "%s | EduLearn",
  },
  description:
    "EduLearn is a complete online course learning management platform: browse courses, enroll, learn at your own pace, join live classes, and track your progress.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ConfirmProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ConfirmProvider>
      </body>
    </html>
  );
}
