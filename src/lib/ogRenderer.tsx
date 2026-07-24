import type { RenderFunction } from "astro-takumi";

export const renderOgImage: RenderFunction = async ({ title, description, pathname }) => {
  const isHome = pathname === "/";
  const isBlogPost = pathname.startsWith("/blog/") && pathname !== "/blog/";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#09090b",
        backgroundImage:
          "radial-gradient(ellipse 800px 500px at 15% 0%, rgba(247, 81, 146, 0.22), transparent), radial-gradient(ellipse 700px 500px at 90% 100%, rgba(147, 104, 181, 0.18), transparent), radial-gradient(ellipse 400px 300px at 85% 10%, rgba(245, 158, 11, 0.08), transparent)",
        padding: "56px 64px",
        fontFamily: "Space Grotesk",
      }}
    >
      {/* Top row: identity */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <img
          src="avatar"
          width={88}
          height={88}
          style={{
            borderRadius: "9999px",
            border: "3px solid rgba(247, 81, 146, 0.6)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "14px" }}>
            <span style={{ fontSize: "34px", fontWeight: 700, color: "#fafafa" }}>Saku Shiina</span>
            <span
              lang="ja"
              style={{
                fontSize: "24px",
                fontWeight: 400,
                color: "#ae87cb",
                fontFamily: "Noto Sans JP",
              }}
            >
              椎名 朔
            </span>
          </div>
          <span style={{ fontSize: "20px", color: "#a1a1aa" }}>Full-Stack Engineer</span>
        </div>
      </div>

      {/* Middle: title + description */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "8px" }}>
        <span
          style={{
            fontSize: "15px",
            fontWeight: 700,
            letterSpacing: "0.22em",
            color: "#f75192",
            textTransform: "uppercase",
          }}
        >
          {isHome ? "Portfolio" : isBlogPost ? "Essay" : "shiina.xyz"}
        </span>
        <span
          style={{
            fontSize: isHome ? "72px" : "56px",
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            color: "#fafafa",
            maxWidth: "1000px",
          }}
        >
          {title}
        </span>
        {description ? (
          <span
            style={{
              fontSize: "26px",
              lineHeight: 1.45,
              color: "#a1a1aa",
              maxWidth: "920px",
            }}
          >
            {description.length > 140 ? `${description.slice(0, 137)}...` : description}
          </span>
        ) : null}
      </div>

      {/* Bottom row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "24px", fontWeight: 700, color: "#f75192" }}>shiina.xyz</span>
        <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
          <span style={{ fontSize: "20px", color: "#71717a" }}>github.com/shiinasaku</span>
          <span style={{ fontSize: "20px", color: "#71717a" }}>x.com/saku_shiina</span>
        </div>
      </div>
    </div>
  );
};
