"use client";
import React from "react";
import Link from "next/link";
import { useLang } from "@/components/Providers";
import { t } from "@/lib/i18n";
import type { Fabric } from "@/lib/demoData";

interface Props {
  fabric: Fabric;
}

export default function FabricCard({ fabric }: Props) {
  const { locale } = useLang();
  const [hovered, setHovered] = React.useState(false);

  const name = locale === "ar" ? fabric.nameAr : fabric.nameEn;
  const imgSrc = hovered && fabric.photos[1] ? fabric.photos[1].src : fabric.photos[0]?.src ?? "/demo/fabric-draped-placeholder.svg";
  const imgAlt = hovered && fabric.photos[1] ? fabric.photos[1].alt : fabric.photos[0]?.alt ?? name;

  const hasPrice = fabric.pricePerMeter > 0;

  return (
    <Link
      href={`/fabrics/${fabric.id}`}
      style={{ textDecoration: "none", display: "block" }}
      className="fabric-card-link"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="fabric-card hover-lift" style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        transition: "border-color 0.35s ease",
      }}>
        {/* Image */}
        <div style={{ position: "relative", paddingTop: "125%", overflow: "hidden", backgroundColor: "var(--bg)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={imgAlt}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover",
              transition: "opacity 0.5s ease, transform 0.5s ease",
              opacity: hovered ? 0.95 : 1,
              transform: hovered ? "scale(1.03)" : "scale(1)",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/demo/fabric-draped-placeholder.svg";
            }}
          />
          {/* Category badge */}
          <span style={{
            position: "absolute", top: 10, right: locale === "ar" ? "auto" : 10, left: locale === "ar" ? 10 : "auto",
            background: "var(--bg)",
            color: "var(--price)",
            fontSize: "0.65rem",
            padding: "3px 8px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            {locale === "ar" ? fabric.categoryLabel.ar : fabric.categoryLabel.en}
          </span>
        </div>

        {/* Info */}
        <div style={{ padding: "1rem" }}>
          <h3 style={{ fontSize: "1rem", color: "var(--fg)", marginBottom: "0.3rem", fontWeight: 400 }}>
            {name}
          </h3>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
            <Tag>{locale === "ar" ? fabric.materialLabel.ar : fabric.materialLabel.en}</Tag>
            <Tag>{locale === "ar" ? fabric.patternLabel.ar : fabric.patternLabel.en}</Tag>
          </div>
          <p style={{ color: hasPrice ? "var(--price)" : "var(--color-warning)", fontSize: "0.9rem", fontWeight: 400 }}>
            {hasPrice
              ? `${fabric.pricePerMeter.toFixed(2)} — ${t(locale, "pricePerMeter")}`
              : t(locale, "demoPrice")}
          </p>
        </div>
      </div>
    </Link>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      background: "rgba(161, 153, 132, 0.15)",
      color: "var(--fg-muted)",
      fontSize: "0.68rem",
      padding: "2px 7px",
      borderRadius: "var(--radius-sm)",
      border: "1px solid var(--border-subtle)",
    }}>
      {children}
    </span>
  );
}
