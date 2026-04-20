import React from "react";

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <input
      className="search-bar"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  );
};

export default SearchBar;
