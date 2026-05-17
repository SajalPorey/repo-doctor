import ReportDashboard from "@/components/ReportDashboard";

interface ReportPageProps {
  searchParams: {
    repo?: string;
  };
}

export default function ReportPage({ searchParams }: ReportPageProps) {
  return <ReportDashboard initialRepo={searchParams.repo ?? ""} />;
}
