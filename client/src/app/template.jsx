// A template (unlike a layout) remounts on every navigation, so the
// `.sd-page` entrance animation in globals.css replays per route.
export default function Template({ children }) {
  return <div className="sd-page">{children}</div>;
}
