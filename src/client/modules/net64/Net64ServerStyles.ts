import styled from 'styled-components'

export const Panel = styled.div`
  font-size: 18px;
  margin: 10px 0;
`

export const Header = styled.div`
  width: 100%;
  padding: 6px 12px;
  background-color: #fff8af;
  border-radius: 6px;
  border: 4px solid #f8ca00;
  box-shadow: 0 0 0 4px black;
  cursor: pointer;
  display: flex;
  flex-wrap: wrap;
`

export const HeaderImg = styled.div`
  height: 18px;
  width: 27px;

  > img {
    height: 100%;
  }
`

export const Country = styled.div`
  flex: 0 0 40px;
`

export const ServerName = styled.div`
  flex: 1 1 auto;
  word-wrap: break-word;
  max-width: calc(100% - 110px);
`

export const Players = styled.div`
  white-space: nowrap;
  flex: 0 0 70px;
  text-align: right;
`

export const DetailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 4px 10px 0 10px;
  width: calc(100% - 20px);
  background-color: rgba(255,255,255,0.3);
  border-radius: 0 0 10px 10px;
`

export const Details = styled.div`
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
`

interface DescriptionProps { active: boolean }
export const Description = styled.div`
  display: flex;
  word-wrap: break-word;
  max-width: 100%;
  
  ${(props: DescriptionProps) => props.active ? `
    flex: 1 1 0;
  ` : ''}
`

interface DescriptionTextProps { active: boolean }
export const DescriptionText = styled.div`
  flex: 1 1 auto;
  overflow: hidden;

  > * {
    margin: 6px;
  }
  
  ${(props: DescriptionTextProps) => !props.active ? `
    display: none;
  ` : ''}
`

interface DescriptionToggleProps { active: boolean }
export const DescriptionToggle = styled.div`
  display: flex;
  align-items: center;
  min-width: 24px;
  max-width: 24px;
  min-height: 50px;
  max-height: 100%;
  cursor: pointer;
  border-radius: 4px;
  background-color: rgba(255,255,255,0.1);

  img {
    transition: 0.3s linear transform;
  }

  ${(props: DescriptionToggleProps) => !props.active ? `
    img {
      transform: rotate(180deg);
    }
  ` : ''}

  &:hover {
    background-color: rgba(255,255,255,0.3);
  }
`

export const PlayerList = styled.div`
  display: flex;
  flex: 1 1 100px;
  flex-wrap: wrap;
  align-items: flex-start;
  align-content: flex-start;
  padding: 6px;
  min-width: 300px;
  max-height: 340px;
  overflow: hidden;
`

export const Player = styled.div`
  display: flex;
  flex: 1 1 0;
  border-bottom: 1px solid black;
  border-top: 1px solid black;
  min-width: 50%;
  overflow: hidden;

  .img {
    width: 24px;
    height: 24px;
  }

  .img img {
    height: 100%;
  }

  .name {
    flex: 1 1 auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`
