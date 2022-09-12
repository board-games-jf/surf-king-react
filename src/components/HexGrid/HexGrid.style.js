import styled from "styled-components";

// defaultGridWidth -> hexWidth = 600 -> 64; 800 -> 94
export const defaultGridWidth = 800;
export const hexWidth = 94;

export const Wrapper = styled.div`
  min-height: 100vh;
  padding: 40px;
  // background-color: #606f7d;

  svg {
    width: ${hexWidth}px;
  }
`;

export const Row = styled.div`
  > * {
    &:not(:last-child) {
      margin-right: 4px;
    }
  }

  &:nth-child(1n + 2) {
    margin-top: calc((${hexWidth}px * 0.375 * -1) + ${hexWidth / 12}px);
  }

  &:nth-child(even) :first-child {
    // margin-left: calc((${hexWidth}px / 20) - 3px);
  }
`;