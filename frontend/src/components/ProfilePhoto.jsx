import { isFunc, keyEnter } from "../Utils";
import "../styles/button.css";

/**
 * Profile Picture button
 * @param {{
 *    source: string,
 *    onClick: function,
 *    style: React.CSSProperties,
 * }} props
 * @returns
 */
function ProfilePhoto(props) {
  function handleClick(event) {
    event.preventDefault();
    isFunc(props.onClick) && props.onClick(event);
  }

  return (
    <button
      className="pfp"
      onClick={handleClick}
      onKeyDown={(event) => keyEnter(event, props.onClick)}
      style={props.style}
      disabled={!props.onClick}
      tabIndex={0}
    >
      <img src={props.source} alt="Profile Photo" />
    </button>
  );
}

export default ProfilePhoto;
