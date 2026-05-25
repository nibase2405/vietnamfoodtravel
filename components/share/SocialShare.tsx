"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Link2, MessageCircle, Send, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SocialShare({ title, text, url }: { title: string; text?: string; url?: string }) {
  const [currentUrl, setCurrentUrl] = useState(url ?? "");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!url) setCurrentUrl(window.location.href);
  }, [url]);

  const links = useMemo(() => {
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedText = encodeURIComponent(text ? `${title} - ${text}` : title);
    return {
      line: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      zalo: `https://zalo.me/share?u=${encodedUrl}`
    };
  }, [currentUrl, text, title]);

  async function copyLink() {
    await navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function nativeShare() {
    if (!navigator.share) {
      await copyLink();
      return;
    }
    await navigator.share({ title, text, url: currentUrl });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={nativeShare}>
        <Share2 className="h-4 w-4" />
        Share
      </Button>
      <Button asChild variant="ghost" size="sm">
        <a href={links.line} target="_blank" rel="noreferrer">
          <Send className="h-4 w-4" />
          LINE
        </a>
      </Button>
      <Button asChild variant="ghost" size="sm">
        <a href={links.facebook} target="_blank" rel="noreferrer">
          <Share2 className="h-4 w-4" />
          Facebook
        </a>
      </Button>
      <Button asChild variant="ghost" size="sm">
        <a href={links.whatsapp} target="_blank" rel="noreferrer">
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
      </Button>
      <Button asChild variant="ghost" size="sm">
        <a href={links.zalo} target="_blank" rel="noreferrer">
          <Link2 className="h-4 w-4" />
          Zalo
        </a>
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={copyLink}>
        <Copy className="h-4 w-4" />
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}
