import React from "react";

type PropsTypes = {
    label: string,
    value: number
}
export const ItemContent: React.FC<PropsTypes> = ({label, value}) => (
  <div id="item" className="flex flex-col items-center">
    <div id="label" >
        <span>{label}</span>
    </div>
    <div id="value">
        <span>{value}</span>
    </div>
  </div>
);