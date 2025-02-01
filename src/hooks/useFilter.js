import { createSearchParams, useLocation, useNavigate } from "react-router-dom";
import FormType from "../constants/FormType";
import { useState, useEffect } from "react";
export const EQUAL_SIGN = "~";
export const AND_SIGN = "+";
export const ARRAY_SEPARATOR = "--";

function parseUrl(query) {
  if (!query) return {};
  query = query.replace(/^\?/, "").replace(/=$/, "");

  return Object.fromEntries(
    decodeURIComponent(query)
      .split(AND_SIGN)
      .map((pair) => {
        let [key, value] = pair.split(EQUAL_SIGN);
        if (key === "seller-type") {
          let values = value ? value.split(ARRAY_SEPARATOR) : [];
          values = [...new Set(values)];
          return [key, values];
        } else {
          return [key, value];
        }
      })
      .filter(Boolean)
  );
}

function stringifyUrl(data) {
  const queryString = Object.keys(data)
    .map((key) => {
      const value = data[key];
      if (Array.isArray(value)) {
        return `${key}${EQUAL_SIGN}${value.join(ARRAY_SEPARATOR)}`;
      }
      return `${key}${EQUAL_SIGN}${value}`;
    })
    .join(AND_SIGN);
  return queryString;
}

// TODO: complete this hook
function useFilter(formData) {
  const [filterState, setFilterState] = useState({});

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = parseUrl(location.search);
    setFilterState(params);
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
          return handleCheckboxGroup(newState, prevState, name, value);

        case FormType.CHECKBOX:
          return handleCheckbox(newState, name, value, isChecked);

        default:
          if (value === "" || value === null) {
            delete newState[name];
            return newState;
          }
          navigate({
            pathname: "/",
            search: `?${createSearchParams(stringifyUrl(newState))}`,
          });
          return { ...prevState, [name]: value };
      }
    });
  }

  function handleCheckboxGroup(newState, prevState, name, value) {
    const prevValues = Array.isArray(prevState[name]) ? prevState[name] : [];

    const valueString = String(value);

    const newValues = prevValues.includes(valueString)
      ? prevValues.filter((v) => String(v) !== valueString)
      : [...prevValues, valueString];

    const uniqueValues = [...new Set(newValues)];

    if (uniqueValues.length === 0) {
      delete newState[name];
    } else {
      newState[name] = uniqueValues;
    }

    navigate({
      pathname: "/",
      search: `?${createSearchParams(stringifyUrl(newState))}`,
    });

    return newState;
  }

  function handleCheckbox(newState, name, value, isChecked) {
    if (isChecked) {
      newState[name] = value;
    } else {
      delete newState[name];
    }

    navigate({
      pathname: "/",
      search: `?${createSearchParams(stringifyUrl(newState))}`,
    });
    return newState;
  }

  function onClear(name) {
    setFilterState((prevState) => {
      const newState = { ...prevState };
      delete newState[name];
      return newState;
    });
  }

  function onClearAll() {
    setFilterState({});
  }

  return { filterState, setFilterState, onChange, onClear, onClearAll };
}

export default useFilter;
