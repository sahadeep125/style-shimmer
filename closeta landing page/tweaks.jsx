/* global React, ReactDOM, TweaksPanel, useTweaks, TweakSection, TweakRadio */
const { useEffect } = React;

function ClosetaTweaks() {
  const defaults = window.__TWEAKS__ || { palette: "coral", display: "default", heroLayout: "tilted" };
  const [tweaks, setTweak] = useTweaks(defaults);

  // Apply live to DOM
  useEffect(() => {
    document.body.dataset.palette = tweaks.palette;
    document.body.dataset.display = tweaks.display;
    document.body.dataset.heroLayout = tweaks.heroLayout;
    const f = document.querySelector(".phone-frame");
    if (f) f.style.transform = tweaks.heroLayout === "straight" ? "rotate(0deg)" : "";
  }, [tweaks]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection title="Palette">
        <TweakRadio
          value={tweaks.palette}
          onChange={(v) => setTweak("palette", v)}
          options={[
            { value: "coral", label: "Coral" },
            { value: "muted", label: "Muted" },
            { value: "forest", label: "Forest" },
          ]}
        />
      </TweakSection>

      <TweakSection title="Display type">
        <TweakRadio
          value={tweaks.display}
          onChange={(v) => setTweak("display", v)}
          options={[
            { value: "default", label: "Bricolage" },
            { value: "serif", label: "Cabinet" },
          ]}
        />
      </TweakSection>

      <TweakSection title="Hero phone">
        <TweakRadio
          value={tweaks.heroLayout}
          onChange={(v) => setTweak("heroLayout", v)}
          options={[
            { value: "tilted", label: "Tilted" },
            { value: "straight", label: "Straight" },
          ]}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

const root = document.createElement("div");
document.body.appendChild(root);
ReactDOM.createRoot(root).render(<ClosetaTweaks />);
