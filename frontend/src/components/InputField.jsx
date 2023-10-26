import {
  IconAlertCircleFilled,
  IconChevronDown,
  IconEye,
  IconEyeClosed,
  IconLock,
} from "@tabler/icons-react";
import Tippy from "@tippyjs/react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { animateTooltip, isFunc, pause } from "../Utils";
import "../styles/input.css";

/**
 * @typedef {{
 *    id: string,
 *    className: string,
 *    label: string,
 *    type: string,
 *    placeholder: string,
 *    value: string,
 *    hideValue: boolean,
 *    defaultValue: string,
 *    autoComplete: string,
 *    onChange: function,
 *    disabled: boolean,
 *    readOnly: boolean,
 *    textArea: boolean,
 *    fieldRef: function,
 *    error: string
 * }} InputFieldProps
 * @param {InputFieldProps} props
 * @returns {React.JSX.Element}
 */
function InputField(props) {
  const [pwType, setPwType] = useState("password");
  const [eyeVisible, setEyeVisible] = useState(false);
  const [eyeClosed, setEyeClosed] = useState(false);
  const pwField = props.type === "password";
  const [iconPadding, setIconPadding] = useState(0);
  const [iconsRef, setIconsRef] = useState(null);
  const iconObserver = new ResizeObserver(getIconPadding);
  const [inputRef, setInputRef] = useState(null);

  const inputFieldProps = {
    id: props.id,
    type: pwField ? pwType : props.type || "text",
    className: clsx(props.className, props.hideValue && "hide-value"),
    value: props.value,
    defaultValue: props.defaultValue,
    placeholder: props.placeholder,
    autoComplete: props.autoComplete,
    disabled: props.disabled,
    readOnly: props.readOnly,
    onChange: handleInputChange,
    tag: pwField ? "password" : "",
    onMouseDown: checkRightClick,
    ref: setInputRef,
    style: {
      paddingRight: !props.textArea && iconPadding,
    },
  };

  useEffect(() => {
    if (!iconsRef) return;
    iconObserver.observe(iconsRef);
  }, [iconsRef]);

  useEffect(() => {
    if (!inputRef) return;
    if (props.readOnly && props.value) {
      pause(10).then(() => {
        const event = new Event("change");
        inputRef.dispatchEvent(event);
        handleInputChange(event);
      });
    }
  }, [props.value]);

  function getIconPadding(observer) {
    const iconsBox = observer[0].borderBoxSize[0];
    const iconsRect = observer[0].contentRect;
    if (!iconsRect.width) {
      setIconPadding("0.5rem");
    } else {
      setIconPadding(`calc(${iconsBox.inlineSize}px + 0.5rem)`);
    }
  }

  function toggleVisibility(event) {
    event.preventDefault();
    if (event.type === "mousedown" && event.button !== 0) return;
    const targetClass = event.target.classList;
    const field = event.target.parentNode.parentNode;
    const input = field.querySelector("input");
    if (input) {
      input.style.setProperty("--text-security", targetClass[2]);
    }
    const toggle = targetClass[0] === "toggle-pw-visible";
    if (toggle) {
      setEyeClosed(!eyeClosed);
      pwField && setPwType(targetClass[1]);
    }
  }

  function handleInputChange(event) {
    setEyeVisible(!!event.target.value);
    isFunc(props.onChange) && props.onChange(event);
  }

  function checkRightClick(event) {
    if (event.button !== 0) {
      event.preventDefault();
    }
  }

  function handleClick(event) {
    event.preventDefault();
    isFunc(props.buttonOnClick) && props.buttonOnClick(event);
  }

  return (
    <span
      className={clsx(
        props.textArea ? "textarea-field" : "input-field",
        props.error && "field-error",
        props.disabled && "disabled"
      )}
      ref={props.fieldRef}
    >
      {props.textArea ? (
        <textarea {...inputFieldProps} />
      ) : (
        <input {...inputFieldProps} />
      )}
      <label htmlFor={props.id}>{props.label}</label>
      <span
        className={props.textArea ? "textarea-icons" : "input-icons"}
        ref={setIconsRef}
      >
        <Tippy
          className="tooltip err-tooltip"
          content={props.error || "--"}
          onShow={animateTooltip}
          onHide={animateTooltip}
          disabled={!props.error}
          hideOnClick={false}
          delay={[250, null]}
          duration={150}
        >
          <IconAlertCircleFilled
            className="error-info"
            onMouseDown={(event) => event.preventDefault()}
            display={props.error ? "block" : "none"}
            tabIndex={-1}
          />
        </Tippy>
        {!props.disabled && props.toggle}
        {props.button && (
          <button className="autofill-button" onClick={handleClick}>
            {props.buttonLabel}
          </button>
        )}
        {(pwField || props.hideValue) && eyeVisible && (
          <>
            <IconEye
              className="toggle-pw-visible text none"
              onMouseDown={toggleVisibility}
              display={!eyeClosed ? "block" : "none"}
            />
            <IconEyeClosed
              className="toggle-pw-visible password disc"
              onMouseDown={toggleVisibility}
              display={eyeClosed ? "block" : "none"}
            />
          </>
        )}
        {props.disabled && <IconLock className="input-locked" />}
      </span>
    </span>
  );
}

/**
 *
 * @param {{
 *    options: [str]
 * } & InputFieldProps} props
 * @returns
 */
export function SelectField(props) {
  const { options, ...otherProps } = props;
  const [fieldRef, setFieldRef] = useState(null);
  const [selected, setSelected] = useState(options && options[0]);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [tooltipInst, setTooltipInst] = useState(null);

  function handleSelection(event) {
    if (tooltipInst) {
      tooltipInst.hide();
      pause(tooltipInst.props.duration).then(async () => {
        setOptionsOpen(false);
        await pause(20);
        setSelected(event.target.id);
      });
    }
  }

  function handleInputOnClick(event) {
    if (event.target.nodeName === "INPUT" && !optionsOpen) {
      setOptionsOpen(true);
    } else if (tooltipInst) {
      tooltipInst.hide();
    }
  }

  function handleKeyDownOption(event) {
    if (event.key === "Tab") {
      tooltipInst && tooltipInst.hide();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const element = event.target;
    if (!element) return;
    const parent = element.parentNode;
    switch (event.key) {
      case "Enter":
        element.click();
        fieldRef.firstChild.focus();
        break;
      case "ArrowDown":
        if (parent.lastChild === element) {
          parent.firstChild.focus();
        } else {
          element.nextSibling.focus();
        }
        break;
      case "ArrowUp":
        if (parent.firstChild === element) {
          parent.lastChild.focus();
        } else {
          element.previousSibling.focus();
        }
        break;
      case "Escape":
        tooltipInst && tooltipInst.hide();
        fieldRef.firstChild.focus();
        break;
      default:
        break;
    }
  }

  function handleKeyDownField(event) {
    switch (event.key) {
      case "Enter":
        event.preventDefault();
        event.stopPropagation();
        event.target.click();
        fieldRef.firstChild.focus();
        break;
      case "Escape":
        if (optionsOpen) {
          event.preventDefault();
          event.stopPropagation();
          tooltipInst && tooltipInst.hide();
          fieldRef.firstChild.focus();
          break;
        }
      default:
        break;
    }
  }

  async function focusOnOpen(optionRef) {
    if (optionRef && optionRef.id === selected) {
      await pause(10);
      optionRef.focus();
    }
  }

  return (
    <Tippy
      className="tooltip select-tooltip"
      content={
        <>
          {options instanceof Array &&
            Array.from({ length: options.length }, (_v, key) => {
              return (
                <span
                  key={key}
                  tabIndex={-1}
                  id={options[key]}
                  className={clsx(
                    "option",
                    options[key] === selected && "selected"
                  )}
                  onClick={handleSelection}
                  style={{
                    minWidth:
                      fieldRef && `calc(${fieldRef.clientWidth}px - 0.3rem)`,
                  }}
                  onKeyDown={handleKeyDownOption}
                  ref={focusOnOpen}
                >
                  {options[key]}
                </span>
              );
            })}
        </>
      }
      {...(fieldRef && { appendTo: fieldRef.parentNode })}
      onShow={(instance) => {
        setTooltipInst(instance);
        animateTooltip(instance);
      }}
      onHide={animateTooltip}
      onHidden={() => setOptionsOpen(false)}
      onClickOutside={(instance) => instance.hide()}
      popperOptions={{
        strategy: "fixed",
        placement: "bottom",
        modifiers: [
          {
            name: "flip",
            options: {
              fallbackPlacements: [],
            },
          },
        ],
      }}
      duration={100}
      placement="bottom"
      visible={optionsOpen && !props.disabled}
      arrow={null}
      interactive
      zIndex={-1}
      offset={0}
    >
      <div
        style={{ zIndex: optionsOpen && 10 }}
        onClick={handleInputOnClick}
        onKeyDown={handleKeyDownField}
      >
        <InputField
          className={clsx("select-field", props.className)}
          value={selected || ""}
          {...otherProps}
          fieldRef={setFieldRef}
          readOnly
          toggle={
            <IconChevronDown
              className="select-arrow"
              stroke={2}
              style={{
                rotate: optionsOpen && "180deg",
              }}
            />
          }
        />
      </div>
    </Tippy>
  );
}

/**
 *
 * @param {{
 *    label: string,
 *    className: string,
 *    style: React.CSSProperties
 * }} props
 * @returns
 */
export function InputHeader(props) {
  return (
    <span className={clsx("label", props.className)} style={props.style}>
      <div />
      <h2>{props.label}</h2>
      <div />
    </span>
  );
}

export default InputField;
