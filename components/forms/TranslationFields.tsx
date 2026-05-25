import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function TranslationFields({ language = "zh-TW" }: { language?: string }) {
  return (
    <div className="grid gap-3">
      <div className="text-sm font-medium">{language}</div>
      <Input name={`translations.${language}.title`} placeholder="標題" />
      <Textarea name={`translations.${language}.description`} placeholder="描述" />
    </div>
  );
}
