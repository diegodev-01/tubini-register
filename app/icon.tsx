import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export function generateImageMetadata() {
  return [
    { id: "192", size: { width: 192, height: 192 }, contentType: "image/png" },
    { id: "512", size: { width: 512, height: 512 }, contentType: "image/png" },
  ];
}

export default async function Icon({ id }: { id: Promise<string> }) {
  const iconSize = Number(await id);

  const logoBuffer = await readFile(join(process.cwd(), "public/Tubini_logo.png"));
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1e2b27", 
        }}
      >
        <img
          src={logoSrc}
          alt=""
          width={iconSize * 0.7}
          height={iconSize * 0.7}
        />
      </div>
    ),
    { width: iconSize, height: iconSize },
  );
}