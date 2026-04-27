import { useParams } from "react-router-dom";

export function useLang(): string {
  const { lang } = useParams<{ lang: string }>();
  return lang || "ru";
}
