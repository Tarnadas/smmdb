import * as React from 'react'

interface ProgressSpinnerProps {
  inline?: boolean
}

export class ProgressSpinner extends React.PureComponent<ProgressSpinnerProps> {
  public render (): JSX.Element {
    const { inline } = this.props
    return (
      <div
        style={Object.assign(
          {
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center'
          },
          inline
            ? {}
            : {
              position: 'fixed',
              top: '0',
              left: '0',
              height: '100%',
              zIndex: '100',
              backgroundColor: 'rgba(0,0,0,0.3)'
            }
        )}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: '7px solid transparent',
            borderTopColor: 'rgba(0,0,0,0.6)',
            animation: 'rotate 800ms linear infinite'
          }}
        />
      </div>
    )
  }
}
