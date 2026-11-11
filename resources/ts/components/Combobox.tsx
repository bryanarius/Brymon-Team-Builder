import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

/*
|--------------------------------------------------------------------------
| Combobox
|--------------------------------------------------------------------------
|
| A searchable single-select: the React version of public/js/combobox.js,
| with the same markup, classes, and keyboard behaviour, so it shares that
| file's CSS. The input shows a label ("Hisuian Samurott") while `value`
| stays the underlying option ("Samurott-Hisui").
|
*/

type ComboboxProps = {
  id: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  listLabel: string;
  formatLabel?: (value: string) => string;
  placeholder?: string;
  ariaLabel?: string;
  maxResults?: number;
};

type Option = {
  value: string;
  label: string;
  search: string;
};

const showValue = (value: string) => value;

// Every word typed must appear in the label or value, in any order.
function findMatches(options: Option[], query: string, maxResults: number) {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

  const allMatches = options.filter((option) =>
    tokens.every((token) => option.search.includes(token)),
  );

  return {
    matches: allMatches.slice(0, maxResults),
    hiddenCount: Math.max(allMatches.length - maxResults, 0),
  };
}

export function Combobox({
  id,
  value,
  options,
  onChange,
  listLabel,
  formatLabel = showValue,
  placeholder,
  ariaLabel,
  maxResults = 60,
}: ComboboxProps) {
  const listboxId = useId();
  const listRef = useRef<HTMLUListElement>(null);

  const preparedOptions = useMemo(
    () =>
      options
        .map((option) => {
          const label = formatLabel(option);

          return {
            value: option,
            label,
            search: `${label} ${option}`.toLowerCase(),
          };
        })
        .sort((first, second) => first.label.localeCompare(second.label)),
    [options, formatLabel],
  );

  // Values outside the option list (e.g. from a saved team) still display.
  const label = value
    ? (preparedOptions.find((option) => option.value === value)?.label ??
      formatLabel(value))
    : "";

  const [text, setText] = useState(label);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // The value can change from outside (a saved Pokémon loaded, sides
  // swapped), so the text follows it. Adjusting state during render is
  // React's recommended alternative to an effect for this.
  const [shownLabel, setShownLabel] = useState(label);

  if (label !== shownLabel) {
    setShownLabel(label);
    setText(label);
  }

  const { matches, hiddenCount } = useMemo(
    () => findMatches(preparedOptions, query, maxResults),
    [preparedOptions, query, maxResults],
  );

  // Keep the highlighted option in view while arrowing through the list.
  useEffect(() => {
    if (isOpen && activeIndex >= 0) {
      listRef.current?.children[activeIndex]?.scrollIntoView?.({
        block: "nearest",
      });
    }
  }, [isOpen, activeIndex]);

  // A box showing its chosen value lists every option, not just that one.
  const currentQuery = () => (value && text === label ? "" : text);

  function open(nextQuery: string, nextActiveIndex: number) {
    setQuery(nextQuery);
    setActiveIndex(nextActiveIndex);
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function revertText() {
    setText(label);
  }

  function commit(option: Option | undefined) {
    if (!option) {
      return;
    }

    setText(option.label);
    close();

    if (option.value !== value) {
      onChange(option.value);
    }
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    const nextText = event.target.value;

    setText(nextText);

    if (nextText.trim() === "" && value !== "") {
      onChange("");
    }

    const next = findMatches(preparedOptions, nextText, maxResults);

    open(nextText, next.matches.length > 0 ? 0 : -1);
  }

  function moveActive(delta: number) {
    if (matches.length > 0) {
      setActiveIndex(
        (index) => (index + delta + matches.length) % matches.length,
      );
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();

        if (isOpen) {
          moveActive(1);
        } else {
          const nextQuery = currentQuery();
          const next = findMatches(preparedOptions, nextQuery, maxResults);

          open(nextQuery, next.matches.length > 0 ? 0 : -1);
        }

        break;
      }

      case "ArrowUp":
        event.preventDefault();

        if (isOpen) {
          moveActive(-1);
        }

        break;

      case "Enter":
        if (isOpen && activeIndex >= 0) {
          event.preventDefault();
          commit(matches[activeIndex]);
        }

        break;

      case "Escape":
        if (isOpen) {
          event.preventDefault();
          revertText();
          close();
        }

        break;

      case "Tab":
        revertText();
        close();
        break;
    }
  }

  const optionId = (index: number) => `${listboxId}-option-${index}`;

  return (
    <div className="combobox">
      <input
        type="text"
        id={id}
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={
          isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined
        }
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={text}
        onChange={handleInput}
        onFocus={() => open(currentQuery(), -1)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          revertText();
          close();
        }}
      />

      <ul
        ref={listRef}
        className="combobox-list"
        role="listbox"
        id={listboxId}
        aria-label={listLabel}
        hidden={!isOpen}
        // Clicks inside the list (options, scrollbar) keep the input focused.
        onMouseDown={(event) => event.preventDefault()}
      >
        {isOpen && matches.length === 0 && (
          <li className="combobox-empty">No matches</li>
        )}

        {isOpen &&
          matches.map((option, index) => (
            <li
              key={option.value}
              id={optionId(index)}
              role="option"
              aria-selected={index === activeIndex}
              className={
                index === activeIndex
                  ? "combobox-option is-active"
                  : "combobox-option"
              }
              onMouseDown={() => commit(option)}
            >
              {option.label}
            </li>
          ))}

        {/* Say when the list is cut short, so it doesn't look like everything. */}
        {isOpen && hiddenCount > 0 && (
          <li className="combobox-more">
            Showing {matches.length} of {matches.length + hiddenCount}. Type to
            narrow the list.
          </li>
        )}
      </ul>
    </div>
  );
}
