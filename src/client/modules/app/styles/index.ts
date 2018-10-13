import styled from 'styled-components'

export const App = styled.div`
  width: 100%;
  height: 100%;
`

export const Main = styled.div`
  width: 100%;
  max-width: 100%;
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  @media (min-width: 1000px) {
    overflow-y: visible;
  }
`

export const Logo = styled.div`
  font-size: 44px;
  text-align: center;
  box-shadow: 0px 10px 20px 0px rgba(0,0,0,0.3);
  z-index: 1;
  flex: 0 0;
  margin: 5px 0;
  color: #000;
  white-space: nowrap;
`

export const Footer = styled.div`
  padding: 4px 0;
  font-size: 11px;
  text-align: center;
  background: rgba(44, 44, 44, 0.3);
  font-family: Consolas, "courier new", serif;
  font-weight: bold;
  color: #000;

  @media (min-width: 1000px) {
    padding: auto;
    height: 39px;
    display: flex;
    align-items: center;
  }
`
