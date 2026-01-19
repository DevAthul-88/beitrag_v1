import HomePage from "@/components/Home/Home";
import Image from "next/image";

export const metadata = {
  title: "Beitrag | Visualize Your GitHub Activity",
  description:
    "Transform your GitHub activity into actionable insights. Track productivity metrics, analyze coding patterns, and monitor contribution trends with real-time analytics and DORA metrics.",
};

export default function Home() {
  return (
    <div>
      <HomePage />
    </div>
  );
}
