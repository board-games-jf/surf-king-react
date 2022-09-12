import React from "react";
import Hexagon from "react-hexagon";
import { seaColor } from "../../constants/Colors";
import { strokeWidth } from "../../constants/Hex";

const Hex = ({ children, style, coord, position, ...rest }) => (
    <Hexagon
        style={{ fill: seaColor, stroke: seaColor, strokeWidth, ...style }}
        {...rest}
    >
        {children}
    </Hexagon>
);

export default Hex;