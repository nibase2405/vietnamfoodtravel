import { Input } from "@/components/ui/input";

export function DatePickerField({ name, label }: { name: string; label: string }) {
  return (
    <label className="grid gap-1 text-sm">
      {label}
      <Input name={name} type="date" />
    </label>
  );
}
