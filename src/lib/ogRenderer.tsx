import type { RenderFunction } from "astro-takumi";

/*
 * Editorial OG cards. Warm paper, ink, one vermilion accent.
 * Ciruela ("Site Sans") carries display type; Zen Maru Gothic ("Site JP") covers Japanese.
 */

const INK = "#1c1917";
const PAPER = "#faf9f5";
const VERMILION = "#d4542f";
const VERMILION_SOFT = "#e27a5f";
const STONE = "#78716c";
const STONE_FAINT = "#a8a29e";
const HAIRLINE = "#e7e5e4";
const GOLD = "#f5c518";

function titleSize(title: string): string {
  if (title.length > 56) return "52px";
  if (title.length > 32) return "64px";
  return "72px";
}

function Chrome({ label, labelJp }: { label: string; labelJp: string }) {
  return (
    <>
      {/* Hairline frame */}
      <div
        style={{
          position: "absolute",
          inset: "28px",
          border: `1px solid ${HAIRLINE}`,
          borderRadius: "24px",
        }}
      />
      {/* Brand — top left */}
      <div
        style={{
          position: "absolute",
          top: "60px",
          left: "72px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <div
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "4px",
            backgroundColor: VERMILION,
          }}
        />
        <span style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "0.18em", color: INK }}>
          {label}
        </span>
        <span
          style={{ fontFamily: "Site JP", fontSize: "18px", fontWeight: 700, color: STONE_FAINT }}
        >
          {labelJp}
        </span>
      </div>
      {/* Kaomoji — top right */}
      <span
        style={{
          position: "absolute",
          top: "56px",
          left: "960px",
          width: "168px",
          textAlign: "right",
          fontSize: "22px",
          color: STONE_FAINT,
        }}
      >
        {"=^o^=\u00A0"}
      </span>
      {/* Domain — bottom left */}
      <span
        style={{
          position: "absolute",
          bottom: "60px",
          left: "72px",
          fontSize: "20px",
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: STONE,
        }}
      >
        shiina.xyz
      </span>
    </>
  );
}

function Sparkles() {
  return (
    <>
      <span
        style={{
          position: "absolute",
          top: "116px",
          right: "180px",
          fontSize: "34px",
          color: GOLD,
        }}
      >
        ＊
      </span>
      <span
        style={{
          position: "absolute",
          bottom: "128px",
          right: "96px",
          fontSize: "26px",
          color: VERMILION_SOFT,
        }}
      >
        ＊
      </span>
      <span
        style={{
          position: "absolute",
          bottom: "96px",
          right: "300px",
          fontSize: "18px",
          color: HAIRLINE,
        }}
      >
        ＊
      </span>
    </>
  );
}

export const renderOgImage: RenderFunction = async ({ title, description, pathname }) => {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const isHome = path === "/";
  const isBlogPost = path.startsWith("/blog/") && path !== "/blog/";

  const cleanTitle = title.replace(/ \| Saku Shiina$/, "");
  const isArticle = isBlogPost || (!isHome && !path.startsWith("/blog"));

  const kicker = isArticle ? "ESSAY — エッセイ" : "FULL-STACK ENGINEER — フルスタックエンジニア";
  const footerJp = isArticle ? "設計・実装、そして改善の記録。" : "速くて、静かなソフトウェア。";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: PAPER,
        overflow: "hidden",
        fontFamily: "Site Sans",
      }}
    >
      <Chrome label="SAKU SHIINA" labelJp="椎名 朔" />
      <Sparkles />

      {/* Center content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          marginTop: "40px",
          padding: "0 96px",
        }}
      >
        <span
          style={{
            fontSize: "19px",
            fontWeight: 700,
            letterSpacing: "0.16em",
            color: VERMILION,
          }}
        >
          {kicker}
        </span>

        {isHome ? (
          <span
            style={{
              fontSize: "104px",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: INK,
            }}
          >
            Saku Shiina
            <span style={{ fontFamily: "Site JP", fontSize: "56px", color: VERMILION }}>
              {" "}
              椎名 朔
            </span>
          </span>
        ) : (
          <span
            style={{
              fontSize: titleSize(cleanTitle),
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: "-0.015em",
              color: INK,
              maxWidth: "960px",
            }}
          >
            {cleanTitle}
          </span>
        )}

        {/* Vermilion rule */}
        <div
          style={{
            width: "72px",
            height: "6px",
            borderRadius: "9999px",
            backgroundColor: VERMILION,
          }}
        />

        {isArticle && description ? (
          <span
            style={{
              fontSize: "23px",
              lineHeight: 1.55,
              color: STONE,
              maxWidth: "880px",
            }}
          >
            {description.length > 140 ? `${description.slice(0, 137)}...` : description}
          </span>
        ) : null}

        {isHome ? (
          <span
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: STONE,
              maxWidth: "880px",
            }}
          >
            Software should feel calm.
          </span>
        ) : null}
      </div>

      {/* JP tagline — bottom right */}
      <span
        style={{
          position: "absolute",
          bottom: "60px",
          left: "620px",
          width: "508px",
          textAlign: "right",
          fontFamily: "Site JP",
          fontSize: "18px",
          fontWeight: 700,
          color: STONE_FAINT,
        }}
      >
        {footerJp}
        {"\u00A0"}
      </span>
    </div>
  );
};
