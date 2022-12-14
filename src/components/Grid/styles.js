import { css } from '@emotion/react'
import styled from 'styled-components'

export const Container = styled.div`
    display: flex;
    justify-content: ${(props) =>
        props.left
            ? 'flex-start'
            : props.right
            ? 'flex-end'
            : props.center
            ? 'center'
            : props.spaceBetween
            ? 'space-between'
            : props.spaceAround
            ? 'space-around'
            : 'none'};
    flex-direction: ${(props) => (props.column ? 'column' : 'row')};
    ${(props) =>
        props.alignItems &&
        css`
            align-items: ${props.alignItems};
        `};
`

export const Item = styled.div`
    flex: ${(props) => props.flex || 'none'};
    ${(props) =>
        props.center &&
        css`
            margin: 0 auto;
        `};
`
