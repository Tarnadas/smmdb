import * as React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

export class PrivacyPolicyView extends React.PureComponent<any, any> {
  render () {
    const styles: React.CSSProperties = {
      view: {
        height: '100%',
        fontSize: '14px',
        textAlign: 'left',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        color: '#000',
        overflow: 'auto'
      },
      header: {
        margin: '10px 20px',
        fontSize: '20px',
        fontWeight: 'bold',
        height: 'auto'
      },
      smallHeader: {
        margin: '10px',
        fontSize: '15px',
        fontWeight: 'bold',
        height: 'auto'
      },
      text: {
        margin: '10px 0',
        height: 'auto'
      }
    }
    return (
      <div id='scroll' style={styles.view}>
        <Helmet>
          <title>SMMDB - Privacy Policy</title>
        </Helmet>
        <div style={styles.text}>
          This privacy policy tells you what to expect when SMMDB collects personal information.
        </div>
        <div style={styles.header}>
          1. Collection of Personal Information
        </div>
        <div style={styles.text}>
          You provide certain personal information to us when you register to use our Services, send e-mail messages, submit forms, and send other information to us,
            or when you use our services and their communication tools.<br /><br />

          SMMDB may store all communications exchanged between You and any other person while using the website.
            This not only includes "public" messages, but also includes all messages exchanged in private using our Services.<br /><br />

          The communication data will be stored by SMMDB on its own servers.<br /><br />

          Communication data is not transferred to any third party under any circumstances unless such disclosure is legally required by law enforcement authorities, a court authority, or other legal processes.<br />
          Communication data is stored as long as it is required to provide support and may be used in development or debugging scenarios.
        </div>
        <div style={styles.smallHeader}>
          Use of E-mail Addresses
        </div>
        <div style={styles.text}>
          Your e-mail address used at the time of Account creation may be used to contact you regarding specific issues related to your Account. You may also receive special promotional notices for Services.
        </div>
        <div style={styles.smallHeader}>
          Use of Non-personal Information
        </div>
        <div style={styles.text}>
          In addition to Account-related information, we will automatically collect certain non-personal information about your use of our Site and Services. Please see Section 2 for further information about information collected when you visit our website.
        </div>
        <div style={styles.smallHeader}>
          Personally Identifiable information while using our Services
        </div>
        <div style={styles.text}>
          When you create an Account for SMMDB's Services, your IP Address (the Internet Protocol Address from which you have created the Account via) and E-mail Address may be stored in our records.<br />
          When you use any Service provided by SMMDB, your IP Address (the Internet Protocol address from which you access any Service provided by SMMDB) may be stored in our records.<br /><br />

          When you make a donation to SMMDB, your payment information and transaction is processed by a third party. SMMDB may store information about donation history through uniquely identifiable Account information and IP Addresses. SMMDB does not store any payment information used to complete the transaction initiated by You. Further details about the third party's Terms and Conditions that you agree to when donating to SMMDB may be found at their website.
        </div>
        <div style={styles.header}>
          2. Cookies and Related Technology
        </div>
        <div style={styles.text}>
          When someone visits http://smmdb.ddns.net/ we collect standard internet log information and details of visitor behavior patterns. We do this to find out things such as the number of visitors to the parts of the site. We collect this information in a way which does not identify anyone. We do not make any attempt to identify users who visit our website while not logged in to a SMMDB Account, and we will not associate any data gathered from this site with any personally identifiable information from any source.
        </div>
        <div style={styles.smallHeader}>
          Use of Cookies by SMMDB
        </div>
        <div style={styles.text}>
          Cookies are small text files that are placed on your computer by websites that you visit. They are widely used in order to make websites work, work more efficiently, as well as to provide information to owners of the site.<br /><br />
          We use cookies to store session identification data as well as cookies required by Google Analytics and Google Login.
        </div>
        <div style={styles.header}>
          3. Who collects the personal information
        </div>
        <div style={styles.text}>
          Please see <Link to='/legal'>Legal Notice</Link>.
        </div>
        <div style={styles.header}>
          4. How the personal information is used
        </div>
        <div style={styles.text}>
          SMMDB may use the personal information collected using our Services in order to provide User Support and Account Maintenance.
        </div>
        <div style={styles.header}>
          5. Privacy Protections for Children
        </div>
        <div style={styles.text}>
          Our Services are not directed to young children, and SMMDB does not provide membership for persons under the age of 13.
            If You are under the age of 13, You may not create an Account for SMMDB's Services nor may you use any of SMMDB's Services. SMMDB will not knowingly collect, maintain, or disclose any personal information from children under the age of 13.<br /><br />

          If you are under the age of legal capacity in your country of residence and are above the age of 13, you must have your parent or guardian accept these Terms of Service before giving us any personally identifiable information or using our Services.<br /><br />

          If you are a parent or guardian who has discovered that your child has entered this agreement without your consent, SMMDB will take reasonable steps to remove personally identifiable information from SMMDB's servers at your request. To request removal of your child's information, please send an e-mail to mreder1289@gmail.com. Be sure to include in your message the affected Accounts and e-mail addresses used by the child who registered for our Services.
        </div>
      </div>
    )
  }
}