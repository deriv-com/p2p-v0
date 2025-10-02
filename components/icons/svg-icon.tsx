interface SvgIconProps {
  fill?: string
  width?: number | string
  height?: number | string
  src?: string
}

export function SvgIcon({
  fill = "currentColor",
  width = 20,
  height = 20,
  src,
}: SvgIconProps) {
  return (
    <div style={{ width, height }}>
      <SVGComponent style={{ fill, width: "100%", height: "100%" }} />
    </div>
  );
}
