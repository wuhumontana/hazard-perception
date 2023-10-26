import { ClickScrollPlugin, OverlayScrollbars } from "overlayscrollbars";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useEffect, useState } from "react";
import "../styles/bubble.css";

/**
 *
 * @param {{
 *    tail: "left" | "right",
 *    percentOffset: number,
 *    absoluteOffset: string,
 *    innerHtml: string
 * }} props
 * @returns {React.JSX.Element}
 */
function TextBubble(props) {
  const [innerText, setInnerText] = useState("");

  OverlayScrollbars.plugin(ClickScrollPlugin);

  function readInstructions() {
    if (!innerText) {
      console.log("No instructions to read!");
      return;
    }
    const instructions = new SpeechSynthesisUtterance(innerText);
    instructions.voice = speechSynthesis.getVoices()[3];
    speechSynthesis.speak(instructions);
  }

  useEffect(() => {
    // console.log(innerText);
  }, [innerText]);

  return (
    <div className="text-bubble-container">
      <div className="text-bubble">
        <OverlayScrollbarsComponent
          options={{
            scrollbars: {
              clickScroll: true,
              autoHide: "move",
            },
          }}
        >
          <div
            className="text-bubble-content"
            dangerouslySetInnerHTML={{ __html: props.innerHtml }}
            ref={(element) => setInnerText(element && element.innerText)}
            onClick={readInstructions}
          />
        </OverlayScrollbarsComponent>
      </div>
      <div
        className={`text-bubble-triangle-${props.tail || "left"}`}
        style={{
          "--percent-offset": props.percentOffset,
          "--raw-tail-offset": props.absoluteOffset,
        }}
      />
    </div>
  );
}

export default TextBubble;
