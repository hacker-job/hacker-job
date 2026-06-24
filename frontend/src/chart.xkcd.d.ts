// chart.xkcd ships no types; we only use the XY chart + config enum.
declare module 'chart.xkcd' {
  const chartXkcd: {
    XY: new (svg: SVGSVGElement, config: unknown) => unknown
    config: { positionType: { upLeft: unknown; upRight: unknown; downLeft: unknown; downRight: unknown } }
    [key: string]: unknown
  }
  export default chartXkcd
}
