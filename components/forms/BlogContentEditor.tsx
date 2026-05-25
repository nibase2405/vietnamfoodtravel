"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Block = { type: "heading" | "paragraph" | "list"; text: string };

export function BlogContentEditor({ name = "content" }: { name?: string }) {
  const [blocks, setBlocks] = useState<Block[]>([{ type: "paragraph", text: "" }]);
  const value = useMemo(() => JSON.stringify({ blocks }), [blocks]);

  return (
    <div className="grid gap-3">
      <input type="hidden" name={name} value={value} />
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Content blocks</div>
        <Button type="button" variant="outline" size="sm" onClick={() => setBlocks((current) => [...current, { type: "paragraph", text: "" }])}><Plus className="h-4 w-4" />Add block</Button>
      </div>
      {blocks.map((block, index) => (
        <div key={index} className="grid gap-2 rounded-lg border p-3">
          <div className="grid gap-2 md:grid-cols-[160px_1fr_auto]">
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={block.type}
              onChange={(event) => setBlocks((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, type: event.target.value as Block["type"] } : item))}
            >
              <option value="heading">heading</option>
              <option value="paragraph">paragraph</option>
              <option value="list">list</option>
            </select>
            <Input value={block.type === "paragraph" ? "" : block.text} onChange={(event) => setBlocks((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, text: event.target.value } : item))} placeholder={block.type === "paragraph" ? "Use textarea below" : "Text"} disabled={block.type === "paragraph"} />
            <Button type="button" variant="ghost" size="icon" onClick={() => setBlocks((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-4 w-4" /></Button>
          </div>
          {block.type === "paragraph" ? <Textarea value={block.text} onChange={(event) => setBlocks((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, text: event.target.value } : item))} placeholder="Paragraph text" /> : null}
        </div>
      ))}
    </div>
  );
}
