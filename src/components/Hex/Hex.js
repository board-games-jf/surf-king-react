import React from 'react'
import Hexagon from 'react-hexagon'
import { seaColor } from '../../constants/Colors'
import { strokeWidth } from './'

const Hex = ({ children, style, ...rest }) => (
    <Hexagon style={{ stroke: seaColor, strokeWidth, ...style }} {...rest}>
        {children}
    </Hexagon>
)

export default Hex
