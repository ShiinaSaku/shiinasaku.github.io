import type { RenderFunction } from "astro-takumi";

interface Dot {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  size: number;
  bg: string;
}

const doodleDots: Dot[] = [
  { top: "128px", left: "520px", size: 24, bg: "#f5c518" },
  { top: "110px", right: "360px", size: 32, bg: "#d4542f" },
  { bottom: "200px", left: "70px", size: 18, bg: "#e27a5f" },
  { bottom: "130px", right: "110px", size: 30, bg: "#f0b8c4" },
  { top: "70px", left: "600px", size: 16, bg: "#4f9dd4" },
  { bottom: "60px", right: "430px", size: 22, bg: "#58a55c" },
  { top: "260px", left: "80px", size: 14, bg: "#d4542f" },
  { bottom: "300px", right: "80px", size: 16, bg: "#d4542f" },
];

export const renderOgImage: RenderFunction = async ({ title, description, pathname }) => {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const isHome = path === "/";
  const isBlogPost = path.startsWith("/blog/") && path !== "/blog/";

  const cleanTitle = title.replace(/ \| Saku Shiina$/, "");

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#faf9f5",
        overflow: "hidden",
        fontFamily: "Site Sans",
      }}
    >
      {/* ── Scattered sticker border ── */}
      <div
        style={{
          position: "absolute",
          top: "44px",
          left: "60px",
          width: "160px",
          height: "112px",
          borderRadius: "58% 42% 55% 45% / 55% 48% 52% 45%",
          backgroundColor: "#d4542f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#faf9f5", fontSize: "24px", fontWeight: 700 }}>=^o^=</span>
      </div>

      <div
        style={{
          position: "absolute",
          top: "40px",
          left: "248px",
          width: "44px",
          height: "14px",
          borderRadius: "9999px",
          backgroundColor: "#d4542f",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "68px",
          left: "262px",
          width: "30px",
          height: "12px",
          borderRadius: "9999px",
          backgroundColor: "#e27a5f",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "96px",
          left: "250px",
          width: "36px",
          height: "12px",
          borderRadius: "9999px",
          backgroundColor: "#1c1917",
        }}
      />

      <span
        style={{
          position: "absolute",
          top: "44px",
          left: "430px",
          fontSize: "30px",
          color: "#1c1917",
        }}
      >
        ( ^o^ )/
      </span>

      <span
        style={{
          position: "absolute",
          top: "168px",
          left: "196px",
          fontSize: "52px",
          color: "#f5c518",
        }}
      >
        ＊
      </span>

      <span
        style={{
          position: "absolute",
          top: "40px",
          right: "70px",
          fontSize: "16px",
          lineHeight: 1.6,
          color: "#1c1917",
          textAlign: "left",
        }}
      >
        {`＊.。＊.。＊.。＊.。
.。＊　　　　＊.。
＊　　.　　＊.。＊
.。＊.。＊.。＊.。＊`}
      </span>

      <span
        style={{
          position: "absolute",
          top: "300px",
          left: "90px",
          fontFamily: "Site JP",
          fontSize: "36px",
          fontWeight: 700,
          color: "#1c1917",
        }}
      >
        にゃ
      </span>

      <span
        style={{
          position: "absolute",
          top: "330px",
          right: "96px",
          fontSize: "46px",
          color: "#1c1917",
        }}
      >
        ＊
      </span>
      <span
        style={{
          position: "absolute",
          bottom: "90px",
          right: "240px",
          fontSize: "36px",
          color: "#e27a5f",
        }}
      >
        ＊
      </span>

      <div
        style={{
          position: "absolute",
          bottom: "132px",
          left: "72px",
          width: "210px",
          height: "18px",
          borderRadius: "9999px",
          backgroundColor: "#d4542f",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "100px",
          left: "102px",
          width: "190px",
          height: "16px",
          borderRadius: "9999px",
          backgroundColor: "#e27a5f",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "70px",
          left: "132px",
          width: "170px",
          height: "14px",
          borderRadius: "9999px",
          backgroundColor: "#d4542f",
        }}
      />

      <span
        style={{
          position: "absolute",
          bottom: "118px",
          left: "330px",
          fontSize: "56px",
          color: "#58a55c",
        }}
      >
        ↑
      </span>

      <span
        style={{
          position: "absolute",
          bottom: "76px",
          right: "130px",
          fontSize: "52px",
          color: "#4f9dd4",
          letterSpacing: "-6px",
        }}
      >
        ~~
      </span>

      {doodleDots.map((dot) => (
        <div
          style={{
            position: "absolute",
            top: dot.top,
            bottom: dot.bottom,
            left: dot.left,
            right: dot.right,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            borderRadius: "9999px",
            backgroundColor: dot.bg,
          }}
        />
      ))}

      {/* ── Center content ── */}
      {isBlogPost ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            padding: "0 140px",
          }}
        >
          <span style={{ fontSize: "22px", fontWeight: 700, color: "#d4542f" }}>
            Essay — Saku Shiina <span style={{ fontFamily: "Site JP" }}>椎名 朔</span>
          </span>
          <span
            style={{
              fontSize: "52px",
              fontWeight: 800,
              lineHeight: 1.15,
              color: "#1c1917",
              textAlign: "center",
              maxWidth: "820px",
            }}
          >
            {cleanTitle}
          </span>
          {description ? (
            <span
              style={{
                fontSize: "22px",
                lineHeight: 1.5,
                color: "#a8a29e",
                textAlign: "center",
                maxWidth: "760px",
              }}
            >
              {description.length > 150 ? `${description.slice(0, 147)}...` : description}
            </span>
          ) : null}
          <span style={{ fontSize: "20px", color: "#78716c", marginTop: "8px" }}>shiina.xyz</span>
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}
        >
          <span
            style={{
              fontSize: "88px",
              fontWeight: 800,
              color: "#1c1917",
              letterSpacing: "-0.02em",
            }}
          >
            Saku Shiina
          </span>
          <span
            style={{ fontFamily: "Site JP", fontSize: "30px", fontWeight: 700, color: "#d4542f" }}
          >
            椎名 朔
          </span>
          <span style={{ fontSize: "22px", color: "#78716c", marginTop: "6px" }}>
            {isHome ? "Full-Stack Engineer — shiina.xyz" : "shiina.xyz"}
          </span>
        </div>
      )}
    </div>
  );
};
