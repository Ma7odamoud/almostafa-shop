"use client";
import React from "react";
import Link from "next/link";
import { useLang } from "@/lib/preferences/preferences";
import { t } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import type { Fabric } from "@/features/catalog/types";

interface Props {
  fabric: Fabric;
}

export default function FabricCard({ fabric }: Props) {
  const { locale } = useLang();
  const [hovered, setHovered] = React.useState(false);

  const name = locale === "ar" ? fabric.nameAr : fabric.nameEn;
  const imgSrc =
    hovered && fabric.photos[1]
      ? fabric.photos[1].src
      : fabric.photos[0]?.src ?? "/demo/fabric-draped-placeholder.svg";
  const imgAlt =
    hovered && fabric.photos[1]
      ? fabric.photos[1].alt
      : fabric.photos[0]?.alt ?? name;

  const hasPrice = fabric.pricePerMeter > 0;
  const material = locale === "ar" ? fabric.materialLabel.ar : fabric.materialLabel.en;
  const pattern = locale === "ar" ? fabric.patternLabel.ar : fabric.patternLabel.en;

  return (
    <Link
      href={`/fabrics/${fabric.id}`}
      style={{ textDecoration: "none", display: "block" }}
      className="fabric-card-link"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <article
        className="fabric-card"
        style={{
          backgroundColor: "transparent",
          overflow: "hidden",
          transition: "transform 0.35s ease",
        }}
      >
        {/* Borderless Editorial Image */}
        <div
          style={{
            position: "relative",
            paddingTop: "125%",
            overflow: "hidden",
            backgroundColor: "var(--bg-card)",
            borderRadius: "var(--radius-sm)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={imgAlt}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "opacity 0.5s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
              opacity: hovered ? 0.96 : 1,
              transform: hovered ? "scale(1.04)" : "scale(1)",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/demo/fabric-draped-placeholder.svg";
            }}
          />

          {/* Subtle Category Pill */}
          <span
            style={{
              position: "absolute",
              top: 10,
              right: locale === "ar" ? "auto" : 10,
              left: locale === "ar" ? 10 : "auto",
              background: "var(--bg)",
              color: "var(--fg)",
              fontSize: "0.65rem",
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: "2px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              opacity: 0.92,
            }}
          >
            {locale === "ar" ? fabric.categoryLabel.ar : fabric.categoryLabel.en}
          </span>
        </div>

        {/* Clean Editorial Info */}
        <div style={{ padding: "0.75rem 0.15rem 0.25rem" }}>
          <h3
            style={{
              fontSize: "0.98rem",
              color: "var(--fg)",
              marginBottom: "0.25rem",
              fontWeight: 500,
              lineHeight: 1.35,
            }}
          >
            {name}
          </h3>
          <p
            style={{
              color: "var(--fg-muted)",
              fontSize: "0.78rem",
              marginBottom: "0.35rem",
              letterSpacing: "0.02em",
            }}
          >
            {material} · {pattern}
          </p>
          <p
            style={{
              color: "var(--price)",
              fontSize: "0.86rem",
              fontWeight: 500,
            }}
          >
            {hasPrice
              ? `${formatPrice(fabric.pricePerMeter, locale)} — ${t(locale, "pricePerMeter")}`
              : t(locale, "demoPrice")}
          </p>
        </div>
      </article>
    </Link>
  );
}
