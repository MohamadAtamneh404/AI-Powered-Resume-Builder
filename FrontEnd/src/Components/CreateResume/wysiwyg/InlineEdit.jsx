import React, { useRef, useEffect, useCallback, useState } from "react";

const InlineEdit = ({
  value = "",
  onChange,
  placeholder = "Enter text...",
  tag = "div",
  className = "",
  multiline = false,
  disabled = false,
  type,
  autoComplete,
  name,
  id,
}) => {
  const elementRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Only update the DOM when the component is not focused
    // This prevents the cursor from jumping to the start/end when typing
    if (elementRef.current && !isFocused && !type && tag !== "input") {
      if (elementRef.current.textContent !== value) {
        elementRef.current.textContent = value;
      }
    }
  }, [value, isFocused, type, tag]);

  const handleBlur = useCallback(
    (e) => {
      setIsFocused(false);
      // Extract textContent to prevent XSS (no innerHTML)
      const newValue = e.target.textContent || "";
      if (newValue !== value && onChange) {
        onChange(newValue);
      }
    },
    [value, onChange],
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        if (!multiline) {
          e.preventDefault();
          e.target.blur();
        }
      }
    },
    [multiline],
  );

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    // Get plain text only to strip HTML and prevent XSS
    const text = (e.clipboardData || window.clipboardData).getData(
      "text/plain",
    );
    document.execCommand("insertText", false, text);
  }, []);

  const baseStyles = "outline-none transition-all duration-200";
  const focusStyles = "focus:ring-1 focus:ring-[#9fff00]/40 focus:rounded-sm";
  const placeholderStyles =
    "empty:before:content-[attr(data-placeholder)] empty:before:text-[#8e8e8e] empty:before:italic empty:before:pointer-events-none";
  const disabledStyles = disabled
    ? "cursor-not-allowed opacity-70"
    : "cursor-text";

  const combinedClassName =
    `${baseStyles} ${focusStyles} ${placeholderStyles} ${disabledStyles} ${className}`.trim();

  // If type is specified or tag is 'input', render a real <input> to enable browser autofill (e.g. saved emails)
  if (type || tag === "input") {
    const inputType = type || "text";
    const computedAutoComplete =
      autoComplete || (inputType === "email" ? "email" : undefined);

    return (
      <input
        ref={elementRef}
        type={inputType}
        name={name || inputType}
        id={id || name}
        autoComplete={computedAutoComplete}
        value={value || ""}
        onChange={(e) => onChange && onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: `${Math.max((value || placeholder || "").length + 2, 8)}ch`,
          maxWidth: "100%",
        }}
        className={`bg-transparent inline-block outline-none text-inherit font-inherit text-center placeholder:text-gray-400 placeholder:italic transition-all duration-150 ${focusStyles} ${disabledStyles} ${className}`.trim()}
      />
    );
  }

  return React.createElement(tag, {
    ref: elementRef,
    contentEditable: !disabled,
    suppressContentEditableWarning: true,
    onBlur: handleBlur,
    onFocus: handleFocus,
    onKeyDown: handleKeyDown,
    onPaste: handlePaste,
    "data-placeholder": placeholder,
    className: combinedClassName,
    role: "textbox",
    "aria-multiline": multiline,
    "aria-disabled": disabled,
  });
};

export default InlineEdit;
