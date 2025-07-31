import React from "react";

type PropsTypes = {
    label: string,
    value: number
}
export const ItemContent: React.FC<PropsTypes> = ({label, value}) => (
  <div id="item" className="flex flex-col m-auto items-center mb-2">
    <div id="label">
        <h2>{label}</h2>
    </div>
    <div id="value">
        <span>{value}</span>
    </div>
  </div>
);