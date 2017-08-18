import React from 'react'
import {
  connect
} from 'react-redux'

import {
  ScreenSize
} from '../../reducers/mediaQuery'

const AWS_TAG = 'smmdb09-20'
const MAX_LENGTH_DESCRIPTION = 400
const MAX_DESCRIPTION_VALUES = 6

class AmazonPanel extends React.PureComponent {
  constructor (props) {
    super(props)
    this.getImage = this.getImage.bind(this)
  }
  componentWillMount () {
    const products = this.props.amazon.toJS()
    this.product = products[Math.floor(Math.random() * products.length)]
  }
  componentWillReceiveProps (nextProps, nextContext) {
    const products = nextProps.amazon.toJS()
    this.product = products[Math.floor(Math.random() * products.length)]
  }
  getImage (asin, country, width) {
    const domain = country === 'US' || country === 'CA' ? 'na' : 'eu'
    return `//ws-${domain}.amazon-adsystem.com/widgets/q?_encoding=UTF8&MarketPlace=${country}&ASIN=${asin}&ServiceVersion=20070822&ID=AsinImage&WS=1&Format=_SL${width}_&tag=${AWS_TAG}`
  }
  render () {
    if (!this.product) return null
    const screenSize = this.props.screenSize
    let description = ''
    const features = this.product.features
    if (features) {
      for (let i in features) {
        if (i >= MAX_DESCRIPTION_VALUES) break
        if (description.length + features[i].length > MAX_LENGTH_DESCRIPTION) break
        description += `${features[i]}\n`
      }
    }
    let price = this.product.price
    if (price && price.includes('EUR ')) {
      price = price.replace('EUR ', '') + '€'
    }
    let offerPrice = this.product.offerPrice
    if (offerPrice && offerPrice.includes('EUR ')) {
      offerPrice = offerPrice.replace('EUR ', '') + '€'
    }
    let isOffer = false
    if (price && offerPrice) {
      const priceVal = parseFloat(price.replace(/[^0-9.]/g, ''))
      const offerPriceVal = parseFloat(offerPrice.replace(/[^0-9.]/g, ''))
      isOffer = offerPriceVal < priceVal
    }
    const styles = {
      panel: {
        height: 'auto'
      },
      a: {
        textDecoration: 'none'
      },
      main: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        background: '#fff',
        borderRadius: '10px',
        boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)'
      },
      img: {
        width: 'auto',
        height: 'auto',
        maxWidth: '200px',
        maxHeight: '120px',
        padding: '0 10px'
      },
      logo: {
        position: 'absolute',
        width: '60px',
        height: 'auto',
        right: '10px',
        bottom: '4px',
        zIndex: '1'
      },
      text: {
        width: '0',
        minWidth: '200px',
        flex: '1 0 0%',
        padding: '5px 10px',
        color: '#000'
      },
      price: {
        color: '#bf0000',
        fontSize: '18px'
      },
      priceOffer: {
        textDecoration: 'line-through',
        color: '#444',
        fontSize: '13px'
      },
      title: {
        display: 'block',
        fontSize: '17px'
      },
      description: {
        display: 'block',
        fontSize: '12px',
        color: '#222',
        whiteSpace: 'pre-line',
        padding: '5px'
      }
    }
    return (
      <div style={styles.panel}>
        <a target='_blank' href={this.product.detailPageURL} style={styles.a}>
          <div style={styles.main}>
            <img style={styles.logo} src='/img/amazon.svg' />
            <img style={styles.img} src={this.getImage(this.product.asin, this.product.country, 300)} />
            <div style={styles.text}>
              <div style={styles.title}>
                {
                  isOffer ? (
                    <div><span style={styles.price}>{ offerPrice }</span><span style={styles.priceOffer}>{ price }</span></div>
                  ) : (
                    <span style={styles.price}>{ price || offerPrice }</span>
                  )
                } { this.product.title ? this.product.title : '' }
              </div>
              {
                screenSize > ScreenSize.SUPER_SMALL &&
                <div style={styles.description}>
                  { description }
                </div>
              }
            </div>
          </div>
        </a>
      </div>
    )
  }
}
export default connect(state => ({
  amazon: state.get('amazon'),
  screenSize: state.getIn(['mediaQuery', 'screenSize'])
}))(AmazonPanel)
