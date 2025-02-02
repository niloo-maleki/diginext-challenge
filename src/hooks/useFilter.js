import { createSearchParams, useLocation, useNavigate } from "react-router-dom";
import FormType from "../constants/FormType";
import { useState, useEffect } from "react";
export const EQUAL_SIGN = "~";
export const AND_SIGN = "+";
export const ARRAY_SEPARATOR = "--";

function parseUrl(url) {
  if (!url) return {};
  url = url.replace(/^\?/, "").replace(/=$/, "");

  return Object.fromEntries(
    decodeURIComponent(url)
      .split(AND_SIGN)
      .map((pair) => {
        let [key, value] = pair.split(EQUAL_SIGN);
        if (key === "seller-type" || key === "brand") {
          return [
            key,
            value
              ? [...new Set(value.split(ARRAY_SEPARATOR).map((v) => Number(v)))]
              : [],
          ];
        }
        return [key, value];
      })
      .filter(Boolean)
  );
}

function stringifyUrl(data) {
  return Object.entries(data)
    .map(([key, value]) =>
      Array.isArray(value)
        ? `${key}${EQUAL_SIGN}${value.join(ARRAY_SEPARATOR)}`
        : `${key}${EQUAL_SIGN}${value}`
    )
    .join(AND_SIGN);
}

// TODO: complete this hook
function useFilter(formData) {
  const [filterState, setFilterState] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = parseUrl(location.search);
    setFilterState(params || {});
  }, [location.search]);

  function onChange(e, name, type) {
    const value = isNaN(e.target.value)
      ? e.target.value
      : Number(e.target.value);
    const isChecked = e.target.checked;

    setFilterState((prevState) => {
      const newState = { ...prevState };

      switch (type) {
        case FormType.CHECKBOX_GROUP:
          return handleCheckboxGroup(newState, name, value, isChecked);

        case FormType.CHECKBOX:
          return handleCheckbox(newState, name, value, isChecked);

        default:
          newState[name] = value || "";
          navigate({
            pathname: "/",
            search: `?${createSearchParams(stringifyUrl(newState))}`,
          });
          return newState;
      }
    });
  }

  function handleCheckboxGroup(newState, name, value, isChecked) {
    const prevValues = Array.isArray(newState[name]) ? newState[name] : [];
    const valueNumber = Number(value);
    const updatedValues = isChecked
      ? [...prevValues, valueNumber]
      : prevValues.filter((v) => v !== valueNumber);

    updatedValues.length
      ? (newState[name] = updatedValues)
      : delete newState[name];

    navigate({
      pathname: "/",
      search: `?${createSearchParams(stringifyUrl(newState))}`,
    });
    return newState;
  }

  function handleCheckbox(newState, name, value, isChecked) {
    const valueNumber = Number(value); 
    isChecked ? (newState[name] = valueNumber) : delete newState[name];
    navigate({
      pathname: "/",
      search: `?${createSearchParams(stringifyUrl(newState))}`,
    });
    return newState;
  }

  function onClear(name) {
    setFilterState((prevState) => {
      const newState = { ...prevState };

      formData.forEach((field) => {
        if (field.parent === name) {
          delete newState[field.name];
        }
      });

      delete newState[name];

      navigate({
        pathname: "/",
        search: `?${createSearchParams(stringifyUrl(newState))}`,
      });

      return newState;
    });
  }

  function onClearAll() {
    setFilterState({});
  }

  console.log("filterState", filterState);
  return { filterState, setFilterState, onChange, onClear, onClearAll };
}

export default useFilter;
