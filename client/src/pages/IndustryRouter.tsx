import { useParams } from "wouter";
import IndustryPage from "./IndustryPage";
import { getIndustryBySlug } from "@/data/industries";
import NotFound from "./NotFound";

export default function IndustryRouter() {
  const params = useParams<{ slug: string }>();
  const data = getIndustryBySlug(params.slug);

  if (!data) return <NotFound />;

  return <IndustryPage data={data} />;
}
